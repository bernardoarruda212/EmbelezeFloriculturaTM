namespace FloriculturaEmbeleze.Application.DTOs.Products;

public class ProductUpdateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public int StockQuantity { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Badge { get; set; }
    public List<Guid> CategoryIds { get; set; } = new();
    public List<ProductVariationCreateDto> Variations { get; set; } = new();
}
