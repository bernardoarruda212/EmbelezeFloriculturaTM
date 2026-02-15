namespace FloriculturaEmbeleze.Application.DTOs.Orders;

public class OrderItemCreateDto
{
    public Guid ProductId { get; set; }
    public Guid? ProductVariationId { get; set; }
    public int Quantity { get; set; }
}
