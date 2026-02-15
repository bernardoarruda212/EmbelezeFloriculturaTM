using FloriculturaEmbeleze.Domain.Enums;

namespace FloriculturaEmbeleze.Domain.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? DeliveryNotes { get; set; }
    public OrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public bool WhatsAppNotified { get; set; } = false;

    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public Guid? CouponId { get; set; }
    public Coupon? Coupon { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Subtotal { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
