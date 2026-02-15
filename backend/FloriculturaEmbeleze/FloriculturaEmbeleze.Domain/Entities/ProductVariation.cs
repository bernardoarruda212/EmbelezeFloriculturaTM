namespace FloriculturaEmbeleze.Domain.Entities;

public class ProductVariation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public Product Product { get; set; } = null!;
}
