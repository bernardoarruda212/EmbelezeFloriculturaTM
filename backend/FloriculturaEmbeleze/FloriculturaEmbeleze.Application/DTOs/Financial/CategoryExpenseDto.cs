namespace FloriculturaEmbeleze.Application.DTOs.Financial;

public class CategoryExpenseDto
{
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? ColorHex { get; set; }
    public decimal TotalAmount { get; set; }
    public int Count { get; set; }
}
