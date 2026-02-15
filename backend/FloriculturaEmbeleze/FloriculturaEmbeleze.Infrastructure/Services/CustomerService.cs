using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Customers;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using FloriculturaEmbeleze.Domain.Entities;
using FloriculturaEmbeleze.Domain.Enums;
using FloriculturaEmbeleze.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _context;

    public CustomerService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResultDto<CustomerListDto>> GetCustomersAsync(CustomerFilterDto filter)
    {
        var query = _context.Customers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(search) || c.Phone.Contains(search) || (c.Email != null && c.Email.ToLower().Contains(search)));
        }

        if (filter.Segment.HasValue)
            query = query.Where(c => c.Segment == filter.Segment.Value);

        if (filter.DateFrom.HasValue)
            query = query.Where(c => c.CreatedAt >= filter.DateFrom.Value);

        if (filter.DateTo.HasValue)
            query = query.Where(c => c.CreatedAt <= filter.DateTo.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(c => new CustomerListDto
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,
                Segment = c.Segment,
                TotalOrders = c.TotalOrders,
                TotalSpent = c.TotalSpent,
                LastOrderDate = c.LastOrderDate,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return new PaginatedResultDto<CustomerListDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<CustomerDetailDto?> GetCustomerByIdAsync(Guid id)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null) return null;

        var recentOrders = await _context.Orders
            .Where(o => o.CustomerId == id)
            .OrderByDescending(o => o.CreatedAt)
            .Take(20)
            .Select(o => new CustomerOrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                CreatedAt = o.CreatedAt
            })
            .ToListAsync();

        return new CustomerDetailDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = customer.Phone,
            Email = customer.Email,
            Address = customer.Address,
            BirthDate = customer.BirthDate,
            Notes = customer.Notes,
            Segment = customer.Segment,
            TotalOrders = customer.TotalOrders,
            TotalSpent = customer.TotalSpent,
            AverageTicket = customer.TotalOrders > 0 ? customer.TotalSpent / customer.TotalOrders : 0,
            FirstOrderDate = customer.FirstOrderDate,
            LastOrderDate = customer.LastOrderDate,
            CreatedAt = customer.CreatedAt,
            RecentOrders = recentOrders
        };
    }

    public async Task<CustomerDetailDto?> GetCustomerByPhoneAsync(string phone)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Phone == phone);

        if (customer == null) return null;
        return await GetCustomerByIdAsync(customer.Id);
    }

    public async Task<CustomerDetailDto> CreateCustomerAsync(CustomerCreateDto dto)
    {
        var customer = new Customer
        {
            Name = dto.Name,
            Phone = dto.Phone,
            Email = dto.Email,
            Address = dto.Address,
            BirthDate = dto.BirthDate,
            Notes = dto.Notes,
            Segment = CustomerSegment.New,
            CreatedAt = DateTime.UtcNow
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return (await GetCustomerByIdAsync(customer.Id))!;
    }

    public async Task<CustomerDetailDto> UpdateCustomerAsync(Guid id, CustomerUpdateDto dto)
    {
        var customer = await _context.Customers.FindAsync(id)
            ?? throw new KeyNotFoundException("Cliente não encontrado.");

        customer.Name = dto.Name;
        customer.Email = dto.Email;
        customer.Address = dto.Address;
        customer.BirthDate = dto.BirthDate;
        customer.Notes = dto.Notes;
        customer.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (await GetCustomerByIdAsync(id))!;
    }

    public async Task DeleteCustomerAsync(Guid id)
    {
        var customer = await _context.Customers.FindAsync(id)
            ?? throw new KeyNotFoundException("Cliente não encontrado.");

        _context.Customers.Remove(customer);
        await _context.SaveChangesAsync();
    }

    public async Task<CustomerStatsDto> GetCustomerStatsAsync()
    {
        var customers = await _context.Customers.ToListAsync();

        return new CustomerStatsDto
        {
            TotalCustomers = customers.Count,
            NewCustomers = customers.Count(c => c.Segment == CustomerSegment.New),
            RegularCustomers = customers.Count(c => c.Segment == CustomerSegment.Regular),
            VipCustomers = customers.Count(c => c.Segment == CustomerSegment.VIP),
            InactiveCustomers = customers.Count(c => c.Segment == CustomerSegment.Inactive)
        };
    }

    public async Task<Guid> UpsertCustomerFromOrderAsync(string name, string phone, string? email, string? address)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Phone == phone);

        if (customer == null)
        {
            customer = new Customer
            {
                Name = name,
                Phone = phone,
                Email = email,
                Address = address,
                Segment = CustomerSegment.New,
                CreatedAt = DateTime.UtcNow
            };
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
        }
        else
        {
            customer.Name = name;
            if (!string.IsNullOrEmpty(email)) customer.Email = email;
            if (!string.IsNullOrEmpty(address)) customer.Address = address;
            customer.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return customer.Id;
    }

    public async Task RecalculateCustomerMetricsAsync(Guid customerId)
    {
        var customer = await _context.Customers.FindAsync(customerId);
        if (customer == null) return;

        var orders = await _context.Orders
            .Where(o => o.CustomerId == customerId && o.Status != OrderStatus.Cancelado)
            .ToListAsync();

        customer.TotalOrders = orders.Count;
        customer.TotalSpent = orders.Sum(o => o.TotalAmount);
        customer.FirstOrderDate = orders.MinBy(o => o.CreatedAt)?.CreatedAt;
        customer.LastOrderDate = orders.MaxBy(o => o.CreatedAt)?.CreatedAt;

        // Calculate segment
        if (customer.TotalOrders == 0)
            customer.Segment = CustomerSegment.New;
        else if (customer.TotalOrders >= 5 || customer.TotalSpent >= 1000)
            customer.Segment = CustomerSegment.VIP;
        else if (customer.LastOrderDate < DateTime.UtcNow.AddDays(-90))
            customer.Segment = CustomerSegment.Inactive;
        else
            customer.Segment = CustomerSegment.Regular;

        customer.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
}
