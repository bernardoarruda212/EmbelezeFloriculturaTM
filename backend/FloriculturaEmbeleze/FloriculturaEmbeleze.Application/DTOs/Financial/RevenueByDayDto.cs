namespace FloriculturaEmbeleze.Application.DTOs.Financial;

public class RevenueByDayDto
{
    public DateTime Date { get; set; }
    public decimal Revenue { get; set; }
    public int OrderCount { get; set; }
}
