using FloriculturaEmbeleze.Domain.Enums;

namespace FloriculturaEmbeleze.Application.DTOs.Stock;

public class StockMovementCreateDto
{
    public Guid ProductId { get; set; }
    public Guid? ProductVariationId { get; set; }
    public StockMovementType Type { get; set; }
    public int Quantity { get; set; }
    public string? Reason { get; set; }
}
