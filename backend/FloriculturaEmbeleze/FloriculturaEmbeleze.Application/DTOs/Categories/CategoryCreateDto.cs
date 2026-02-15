namespace FloriculturaEmbeleze.Application.DTOs.Categories;

public class CategoryCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconClass { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
