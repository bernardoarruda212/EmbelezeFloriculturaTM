using FloriculturaEmbeleze.Domain.Enums;

namespace FloriculturaEmbeleze.Domain.Entities;

public class Expense : BaseEntity
{
    public Guid CategoryId { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime ExpenseDate { get; set; }
    public bool IsRecurring { get; set; }
    public RecurrenceInterval? RecurrenceInterval { get; set; }
    public Guid? UserId { get; set; }

    public ExpenseCategory Category { get; set; } = null!;
}
