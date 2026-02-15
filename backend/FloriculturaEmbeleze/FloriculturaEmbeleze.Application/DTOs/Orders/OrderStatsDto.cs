namespace FloriculturaEmbeleze.Application.DTOs.Orders;

public class OrderStatsDto
{
    public int OrdersToday { get; set; }
    public int OrdersThisWeek { get; set; }
    public int OrdersThisMonth { get; set; }
    public decimal RevenueThisMonth { get; set; }
}
