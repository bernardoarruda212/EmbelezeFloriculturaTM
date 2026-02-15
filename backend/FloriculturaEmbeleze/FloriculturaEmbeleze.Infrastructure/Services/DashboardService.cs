using FloriculturaEmbeleze.Application.DTOs.Dashboard;
using FloriculturaEmbeleze.Application.DTOs.Orders;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using FloriculturaEmbeleze.Domain.Enums;
using FloriculturaEmbeleze.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardDto> GetDashboardDataAsync()
    {
        return await BuildDashboardAsync();
    }

    public async Task<DashboardDto> GetDashboardAsync()
    {
        return await BuildDashboardAsync();
    }

    private async Task<DashboardDto> BuildDashboardAsync()
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

        var recentOrders = await _context.Orders
            .OrderByDescending(o => o.CreatedAt)
            .Take(10)
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

        var lowStockProducts = await _context.Products
            .Where(p => p.IsActive && p.StockQuantity < 5)
            .OrderBy(p => p.StockQuantity)
            .Select(p => new LowStockProductDto
            {
                Id = p.Id,
                Name = p.Name,
                StockQuantity = p.StockQuantity
            })
            .ToListAsync();

        var unreadMessages = await _context.ContactMessages
            .CountAsync(m => !m.IsRead);

        return new DashboardDto
        {
            OrdersToday = ordersToday,
            OrdersThisWeek = ordersThisWeek,
            OrdersThisMonth = ordersThisMonth,
            RevenueThisMonth = revenueThisMonth,
            RecentOrders = recentOrders,
            LowStockProducts = lowStockProducts,
            UnreadMessages = unreadMessages
        };
    }
}
