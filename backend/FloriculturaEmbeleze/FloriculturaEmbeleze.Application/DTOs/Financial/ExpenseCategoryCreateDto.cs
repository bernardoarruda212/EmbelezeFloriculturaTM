namespace FloriculturaEmbeleze.Application.DTOs.Financial;

public class ExpenseCategoryCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string? ColorHex { get; set; }
    public string? IconClass { get; set; }
    public int DisplayOrder { get; set; }
}
