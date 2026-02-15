namespace FloriculturaEmbeleze.Domain.Entities;

public class ExpenseCategory : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? ColorHex { get; set; }
    public string? IconClass { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}
