using FloriculturaEmbeleze.Domain.Enums;

namespace FloriculturaEmbeleze.Application.DTOs.Stock;

public class StockMovementListDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public Guid? ProductVariationId { get; set; }
    public string? VariationName { get; set; }
    public StockMovementType Type { get; set; }
    public int Quantity { get; set; }
    public int QuantityBefore { get; set; }
    public int QuantityAfter { get; set; }
    public string? Reason { get; set; }
    public Guid? OrderId { get; set; }
    public string? OrderNumber { get; set; }
    public DateTime CreatedAt { get; set; }
}
