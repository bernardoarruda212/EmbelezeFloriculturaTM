using FloriculturaEmbeleze.Domain.Enums;

namespace FloriculturaEmbeleze.Application.DTOs.Customers;

public class CustomerListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public CustomerSegment Segment { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
    public DateTime? LastOrderDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
