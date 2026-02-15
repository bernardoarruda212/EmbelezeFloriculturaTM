namespace FloriculturaEmbeleze.Application.DTOs.Financial;

public class ExpenseCategoryListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ColorHex { get; set; }
    public string? IconClass { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public int ExpenseCount { get; set; }
    public decimal TotalAmount { get; set; }
}
