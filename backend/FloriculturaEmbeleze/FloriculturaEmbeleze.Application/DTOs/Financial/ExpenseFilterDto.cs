namespace FloriculturaEmbeleze.Application.DTOs.Financial;

public class ExpenseFilterDto
{
    public Guid? CategoryId { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public bool? IsRecurring { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
