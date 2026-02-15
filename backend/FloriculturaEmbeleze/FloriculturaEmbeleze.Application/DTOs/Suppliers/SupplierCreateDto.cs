namespace FloriculturaEmbeleze.Application.DTOs.Suppliers;

public class SupplierCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }
    public List<Guid> ProductIds { get; set; } = new();
}
