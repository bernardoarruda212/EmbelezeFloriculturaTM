namespace FloriculturaEmbeleze.Domain.Entities;

public class ProductSupplier
{
    public Guid ProductId { get; set; }
    public Guid SupplierId { get; set; }

    public Product Product { get; set; } = null!;
    public Supplier Supplier { get; set; } = null!;
}
