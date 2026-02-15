namespace FloriculturaEmbeleze.Application.DTOs.Products;

public class ProductListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public int StockQuantity { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; }
    public string? Badge { get; set; }
    public string? MainImageUrl { get; set; }
    public List<string> CategoryNames { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}
