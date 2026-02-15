using FloriculturaEmbeleze.Domain.Enums;

namespace FloriculturaEmbeleze.Domain.Entities;

public class StockMovement : BaseEntity
{
    public Guid ProductId { get; set; }
    public Guid? ProductVariationId { get; set; }
    public StockMovementType Type { get; set; }
    public int Quantity { get; set; }
    public int QuantityBefore { get; set; }
    public int QuantityAfter { get; set; }
    public string? Reason { get; set; }
    public Guid? OrderId { get; set; }
    public Guid? UserId { get; set; }

    public Product Product { get; set; } = null!;
    public ProductVariation? ProductVariation { get; set; }
    public Order? Order { get; set; }
}
