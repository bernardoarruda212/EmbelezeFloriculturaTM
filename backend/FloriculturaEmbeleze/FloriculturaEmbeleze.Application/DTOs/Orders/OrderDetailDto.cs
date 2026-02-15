using FloriculturaEmbeleze.Domain.Enums;

namespace FloriculturaEmbeleze.Application.DTOs.Orders;

public class OrderDetailDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public OrderStatus Status { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public Guid? CouponId { get; set; }
    public bool WhatsAppNotified { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CustomerEmail { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? DeliveryNotes { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}
