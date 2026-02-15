using FloriculturaEmbeleze.Domain.Enums;

namespace FloriculturaEmbeleze.Domain.Entities;

public class Customer : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Notes { get; set; }
    public CustomerSegment Segment { get; set; } = CustomerSegment.New;
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
    public DateTime? FirstOrderDate { get; set; }
    public DateTime? LastOrderDate { get; set; }

    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
