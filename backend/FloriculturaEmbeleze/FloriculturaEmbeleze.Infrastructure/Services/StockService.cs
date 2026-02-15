using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Stock;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using FloriculturaEmbeleze.Domain.Entities;
using FloriculturaEmbeleze.Domain.Enums;
using FloriculturaEmbeleze.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class StockService : IStockService
{
    private readonly AppDbContext _context;

    public StockService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResultDto<StockMovementListDto>> GetStockMovementsAsync(StockMovementFilterDto filter)
    {
        var query = _context.StockMovements
            .Include(sm => sm.Product)
            .Include(sm => sm.ProductVariation)
            .Include(sm => sm.Order)
            .AsQueryable();

        if (filter.ProductId.HasValue)
            query = query.Where(sm => sm.ProductId == filter.ProductId.Value);

        if (filter.Type.HasValue)
            query = query.Where(sm => sm.Type == filter.Type.Value);

        if (filter.DateFrom.HasValue)
            query = query.Where(sm => sm.CreatedAt >= filter.DateFrom.Value);

        if (filter.DateTo.HasValue)
            query = query.Where(sm => sm.CreatedAt <= filter.DateTo.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(sm => sm.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(sm => new StockMovementListDto
            {
                Id = sm.Id,
                ProductId = sm.ProductId,
                ProductName = sm.Product.Name,
                ProductVariationId = sm.ProductVariationId,
                VariationName = sm.ProductVariation != null ? sm.ProductVariation.Name : null,
                Type = sm.Type,
                Quantity = sm.Quantity,
                QuantityBefore = sm.QuantityBefore,
                QuantityAfter = sm.QuantityAfter,
                Reason = sm.Reason,
                OrderId = sm.OrderId,
                OrderNumber = sm.Order != null ? sm.Order.OrderNumber : null,
                CreatedAt = sm.CreatedAt
            })
            .ToListAsync();

        return new PaginatedResultDto<StockMovementListDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<StockMovementListDto> CreateStockMovementAsync(StockMovementCreateDto dto, Guid? userId)
    {
        var product = await _context.Products.FindAsync(dto.ProductId)
            ?? throw new KeyNotFoundException($"Produto com ID {dto.ProductId} não encontrado.");

        int quantityBefore;
        int quantityAfter;

        if (dto.ProductVariationId.HasValue)
        {
            var variation = await _context.ProductVariations
                .FirstOrDefaultAsync(v => v.Id == dto.ProductVariationId.Value && v.ProductId == dto.ProductId)
                ?? throw new KeyNotFoundException("Variação não encontrada.");

            quantityBefore = variation.StockQuantity;

            switch (dto.Type)
            {
                case StockMovementType.In:
                    variation.StockQuantity += dto.Quantity;
                    break;
                case StockMovementType.Out:
                    variation.StockQuantity -= dto.Quantity;
                    break;
                case StockMovementType.Adjustment:
                    variation.StockQuantity = dto.Quantity;
                    break;
            }

            quantityAfter = variation.StockQuantity;
        }
        else
        {
            quantityBefore = product.StockQuantity;

            switch (dto.Type)
            {
                case StockMovementType.In:
                    product.StockQuantity += dto.Quantity;
                    break;
                case StockMovementType.Out:
                    product.StockQuantity -= dto.Quantity;
                    break;
                case StockMovementType.Adjustment:
                    product.StockQuantity = dto.Quantity;
                    break;
            }

            quantityAfter = product.StockQuantity;
        }

        var movement = new StockMovement
        {
            ProductId = dto.ProductId,
            ProductVariationId = dto.ProductVariationId,
            Type = dto.Type,
            Quantity = dto.Quantity,
            QuantityBefore = quantityBefore,
            QuantityAfter = quantityAfter,
            Reason = dto.Reason,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync();

        return new StockMovementListDto
        {
            Id = movement.Id,
            ProductId = movement.ProductId,
            ProductName = product.Name,
            ProductVariationId = movement.ProductVariationId,
            Type = movement.Type,
            Quantity = movement.Quantity,
            QuantityBefore = movement.QuantityBefore,
            QuantityAfter = movement.QuantityAfter,
            Reason = movement.Reason,
            CreatedAt = movement.CreatedAt
        };
    }

    public async Task DeductStockForOrderAsync(Guid orderId, Guid? userId)
    {
        var orderItems = await _context.OrderItems
            .Where(oi => oi.OrderId == orderId)
            .ToListAsync();

        foreach (var item in orderItems)
        {
            if (item.ProductVariationId.HasValue)
            {
                var variation = await _context.ProductVariations.FindAsync(item.ProductVariationId.Value);
                if (variation != null)
                {
                    var before = variation.StockQuantity;
                    variation.StockQuantity -= item.Quantity;

                    _context.StockMovements.Add(new StockMovement
                    {
                        ProductId = item.ProductId,
                        ProductVariationId = item.ProductVariationId,
                        Type = StockMovementType.Out,
                        Quantity = item.Quantity,
                        QuantityBefore = before,
                        QuantityAfter = variation.StockQuantity,
                        Reason = "Venda - Pedido",
                        OrderId = orderId,
                        UserId = userId,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
            else
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product != null)
                {
                    var before = product.StockQuantity;
                    product.StockQuantity -= item.Quantity;

                    _context.StockMovements.Add(new StockMovement
                    {
                        ProductId = item.ProductId,
                        Type = StockMovementType.Out,
                        Quantity = item.Quantity,
                        QuantityBefore = before,
                        QuantityAfter = product.StockQuantity,
                        Reason = "Venda - Pedido",
                        OrderId = orderId,
                        UserId = userId,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task RestoreStockForOrderAsync(Guid orderId, Guid? userId)
    {
        var orderItems = await _context.OrderItems
            .Where(oi => oi.OrderId == orderId)
            .ToListAsync();

        foreach (var item in orderItems)
        {
            if (item.ProductVariationId.HasValue)
            {
                var variation = await _context.ProductVariations.FindAsync(item.ProductVariationId.Value);
                if (variation != null)
                {
                    var before = variation.StockQuantity;
                    variation.StockQuantity += item.Quantity;

                    _context.StockMovements.Add(new StockMovement
                    {
                        ProductId = item.ProductId,
                        ProductVariationId = item.ProductVariationId,
                        Type = StockMovementType.In,
                        Quantity = item.Quantity,
                        QuantityBefore = before,
                        QuantityAfter = variation.StockQuantity,
                        Reason = "Estorno - Pedido cancelado",
                        OrderId = orderId,
                        UserId = userId,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
            else
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product != null)
                {
                    var before = product.StockQuantity;
                    product.StockQuantity += item.Quantity;

                    _context.StockMovements.Add(new StockMovement
                    {
                        ProductId = item.ProductId,
                        Type = StockMovementType.In,
                        Quantity = item.Quantity,
                        QuantityBefore = before,
                        QuantityAfter = product.StockQuantity,
                        Reason = "Estorno - Pedido cancelado",
                        OrderId = orderId,
                        UserId = userId,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task<List<LowStockAlertDto>> GetLowStockAlertsAsync(int threshold = 5)
    {
        var products = await _context.Products
            .Where(p => p.IsActive && p.StockQuantity <= threshold)
            .Select(p => new LowStockAlertDto
            {
                ProductId = p.Id,
                ProductName = p.Name,
                CurrentStock = p.StockQuantity,
                Threshold = threshold,
                HasVariations = p.Variations.Any()
            })
            .ToListAsync();

        return products;
    }
}
