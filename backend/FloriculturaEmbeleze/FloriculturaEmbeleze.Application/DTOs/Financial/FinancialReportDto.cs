namespace FloriculturaEmbeleze.Application.DTOs.Financial;

public class FinancialReportDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetProfit { get; set; }
    public decimal AverageTicket { get; set; }
    public int TotalOrders { get; set; }
    public List<RevenueByDayDto> RevenueByDay { get; set; } = new();
    public List<CategoryExpenseDto> ExpensesByCategory { get; set; } = new();
    public List<TopProductDto> TopProducts { get; set; } = new();
}
