using FloriculturaEmbeleze.Application.DTOs.Orders;

namespace FloriculturaEmbeleze.Application.DTOs.Dashboard;

public class DashboardDto
{
    public int OrdersToday { get; set; }
    public int OrdersThisWeek { get; set; }
    public int OrdersThisMonth { get; set; }
    public decimal RevenueThisMonth { get; set; }
    public List<OrderListDto> RecentOrders { get; set; } = new();
    public List<LowStockProductDto> LowStockProducts { get; set; } = new();
    public int UnreadMessages { get; set; }
}
