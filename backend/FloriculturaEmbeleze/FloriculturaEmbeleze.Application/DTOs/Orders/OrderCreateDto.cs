namespace FloriculturaEmbeleze.Application.DTOs.Orders;

public class OrderCreateDto
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? DeliveryNotes { get; set; }
    public string? CouponCode { get; set; }
    public List<OrderItemCreateDto> Items { get; set; } = new();
}
