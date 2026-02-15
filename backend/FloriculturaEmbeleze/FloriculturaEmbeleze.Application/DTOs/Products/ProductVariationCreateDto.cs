namespace FloriculturaEmbeleze.Application.DTOs.Products;

public class ProductVariationCreateDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
}
