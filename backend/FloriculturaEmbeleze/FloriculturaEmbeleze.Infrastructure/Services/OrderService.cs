using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Marketing;
using FloriculturaEmbeleze.Application.DTOs.Orders;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using FloriculturaEmbeleze.Domain.Entities;
using FloriculturaEmbeleze.Domain.Enums;
using FloriculturaEmbeleze.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;
    private readonly ICustomerService _customerService;
    private readonly IStockService _stockService;
    private readonly ICouponService _couponService;

    public OrderService(AppDbContext context, ICustomerService customerService, IStockService stockService, ICouponService couponService)
    {
        _context = context;
        _customerService = customerService;
        _stockService = stockService;
        _couponService = couponService;
    }

    public async Task<OrderDetailDto> CreateOrderAsync(OrderCreateDto dto)
    {
        if (dto.Items == null || !dto.Items.Any())
            throw new InvalidOperationException("O pedido deve conter pelo menos um item.");

        var order = new Order
        {
            OrderNumber = await GenerateOrderNumberAsync(),
            CustomerName = dto.CustomerName,
            CustomerPhone = dto.CustomerPhone,
            CustomerEmail = dto.CustomerEmail,
            DeliveryAddress = dto.DeliveryAddress,
            DeliveryNotes = dto.DeliveryNotes,
            Status = OrderStatus.Novo,
            CreatedAt = DateTime.UtcNow
        };

        decimal totalAmount = 0;

        foreach (var itemDto in dto.Items)
        {
            var product = await _context.Products.FindAsync(itemDto.ProductId)
                ?? throw new KeyNotFoundException($"Produto com ID {itemDto.ProductId} não encontrado.");

            decimal unitPrice = product.BasePrice;
            string? variationName = null;

            if (itemDto.ProductVariationId.HasValue)
            {
                var variation = await _context.ProductVariations
                    .FirstOrDefaultAsync(v =>
                        v.Id == itemDto.ProductVariationId.Value &&
                        v.ProductId == itemDto.ProductId)
                    ?? throw new KeyNotFoundException(
                        $"Variação com ID {itemDto.ProductVariationId} não encontrada.");

                unitPrice = variation.Price;
                variationName = variation.Name;
            }

            var subtotal = unitPrice * itemDto.Quantity;
            totalAmount += subtotal;

            order.Items.Add(new OrderItem
            {
                ProductId = itemDto.ProductId,
                ProductVariationId = itemDto.ProductVariationId,
                ProductName = product.Name,
                VariationName = variationName,
                UnitPrice = unitPrice,
                Quantity = itemDto.Quantity,
                Subtotal = subtotal
            });
        }

        order.Subtotal = totalAmount;
        order.TotalAmount = totalAmount;

        // Apply coupon if provided
        if (!string.IsNullOrWhiteSpace(dto.CouponCode))
        {
            var validation = await _couponService.ValidateCouponAsync(new CouponValidationDto
            {
                Code = dto.CouponCode,
                OrderTotal = totalAmount
            });

            if (validation.IsValid && validation.CouponId.HasValue)
            {
                order.CouponId = validation.CouponId.Value;
                order.DiscountAmount = validation.DiscountAmount;
                order.TotalAmount = totalAmount - validation.DiscountAmount;
            }
        }

        // Upsert customer from order data
        var customerId = await _customerService.UpsertCustomerFromOrderAsync(
            dto.CustomerName, dto.CustomerPhone, dto.CustomerEmail, dto.DeliveryAddress);
        order.CustomerId = customerId;

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Record coupon usage after order is saved
        if (order.CouponId.HasValue)
        {
            await _couponService.RecordCouponUsageAsync(order.CouponId.Value, order.Id, order.DiscountAmount);
        }

        await _stockService.DeductStockForOrderAsync(order.Id, null);

        // Recalculate customer metrics after order creation
        await _customerService.RecalculateCustomerMetricsAsync(customerId);

        return MapToDetailDto(order);
    }

    public async Task<PaginatedResultDto<OrderListDto>> GetOrdersAsync(
        string? status,
        string? search,
        DateTime? dateFrom,
        DateTime? dateTo,
        int page,
        int pageSize)
    {
        var query = _context.Orders.AsQueryable();

        // Status filter
        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<OrderStatus>(status, ignoreCase: true, out var parsedStatus))
        {
            query = query.Where(o => o.Status == parsedStatus);
        }

        // Search filter (customer name or order number)
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(o =>
                o.CustomerName.ToLower().Contains(searchLower) ||
                o.OrderNumber.ToLower().Contains(searchLower));
        }

        // Date range filter
        if (dateFrom.HasValue)
            query = query.Where(o => o.CreatedAt >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(o => o.CreatedAt <= dateTo.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new OrderListDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = o.CustomerName,
                CustomerPhone = o.CustomerPhone,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                WhatsAppNotified = o.WhatsAppNotified,
                CreatedAt = o.CreatedAt
            })
            .ToListAsync();

        return new PaginatedResultDto<OrderListDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<OrderDetailDto?> GetOrderByIdAsync(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        return order == null ? null : MapToDetailDto(order);
    }

    public async Task UpdateOrderStatusAsync(Guid id, OrderStatusUpdateDto dto)
    {
        var order = await _context.Orders.FindAsync(id)
            ?? throw new KeyNotFoundException("Pedido não encontrado.");

        order.Status = dto.Status;
        order.UpdatedAt = DateTime.UtcNow;

        // Restore stock when order is cancelled
        if (dto.Status == OrderStatus.Cancelado)
        {
            await _stockService.RestoreStockForOrderAsync(id, null);
        }

        await _context.SaveChangesAsync();
    }

    public async Task<OrderStatsDto> GetOrderStatsAsync()
    {
        var now = DateTime.UtcNow;
        var todayStart = now.Date;
        var weekStart = todayStart.AddDays(-(int)todayStart.DayOfWeek);
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var ordersToday = await _context.Orders
            .CountAsync(o => o.CreatedAt >= todayStart);

        var ordersThisWeek = await _context.Orders
            .CountAsync(o => o.CreatedAt >= weekStart);

        var ordersThisMonth = await _context.Orders
            .CountAsync(o => o.CreatedAt >= monthStart);

        var revenueThisMonth = await _context.Orders
            .Where(o => o.CreatedAt >= monthStart && o.Status != OrderStatus.Cancelado)
            .SumAsync(o => o.TotalAmount);

        return new OrderStatsDto
        {
            OrdersToday = ordersToday,
            OrdersThisWeek = ordersThisWeek,
            OrdersThisMonth = ordersThisMonth,
            RevenueThisMonth = revenueThisMonth
        };
    }

    private async Task<string> GenerateOrderNumberAsync()
    {
        var today = DateTime.UtcNow;
        var datePrefix = today.ToString("yyyyMMdd");
        var prefix = $"EMB-{datePrefix}-";

        var lastOrder = await _context.Orders
            .Where(o => o.OrderNumber.StartsWith(prefix))
            .OrderByDescending(o => o.OrderNumber)
            .FirstOrDefaultAsync();

        int nextNumber = 1;
        if (lastOrder != null)
        {
            var lastNumberStr = lastOrder.OrderNumber.Replace(prefix, "");
            if (int.TryParse(lastNumberStr, out var lastNumber))
                nextNumber = lastNumber + 1;
        }

        return $"{prefix}{nextNumber:D3}";
    }

    private static OrderDetailDto MapToDetailDto(Order order) => new()
    {
        Id = order.Id,
        OrderNumber = order.OrderNumber,
        CustomerName = order.CustomerName,
        CustomerPhone = order.CustomerPhone,
        CustomerEmail = order.CustomerEmail,
        DeliveryAddress = order.DeliveryAddress,
        DeliveryNotes = order.DeliveryNotes,
        Status = order.Status,
        Subtotal = order.Subtotal,
        DiscountAmount = order.DiscountAmount,
        TotalAmount = order.TotalAmount,
        CouponId = order.CouponId,
        WhatsAppNotified = order.WhatsAppNotified,
        CreatedAt = order.CreatedAt,
        Items = order.Items.Select(i => new OrderItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            VariationName = i.VariationName,
            UnitPrice = i.UnitPrice,
            Quantity = i.Quantity,
            Subtotal = i.Subtotal
        }).ToList()
    };
}
