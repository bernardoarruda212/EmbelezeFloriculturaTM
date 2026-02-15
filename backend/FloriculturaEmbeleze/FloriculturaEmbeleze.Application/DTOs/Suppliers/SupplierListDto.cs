namespace FloriculturaEmbeleze.Application.DTOs.Suppliers;

public class SupplierListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool IsActive { get; set; }
    public int ProductCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
