namespace FloriculturaEmbeleze.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public int StockQuantity { get; set; } = 0;
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Badge { get; set; }

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<ProductVariation> Variations { get; set; } = new List<ProductVariation>();
    public ICollection<ProductCategory> ProductCategories { get; set; } = new List<ProductCategory>();
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
    public ICollection<ProductSupplier> ProductSuppliers { get; set; } = new List<ProductSupplier>();
    public ICollection<ProductPromotion> ProductPromotions { get; set; } = new List<ProductPromotion>();
}
