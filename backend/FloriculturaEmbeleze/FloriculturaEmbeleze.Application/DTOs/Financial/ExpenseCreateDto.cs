using FloriculturaEmbeleze.Domain.Enums;

namespace FloriculturaEmbeleze.Application.DTOs.Financial;

public class ExpenseCreateDto
{
    public Guid CategoryId { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime ExpenseDate { get; set; }
    public bool IsRecurring { get; set; }
    public RecurrenceInterval? RecurrenceInterval { get; set; }
}
