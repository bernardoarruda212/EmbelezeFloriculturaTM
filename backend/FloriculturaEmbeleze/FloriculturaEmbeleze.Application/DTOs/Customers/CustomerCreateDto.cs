namespace FloriculturaEmbeleze.Application.DTOs.Customers;

public class CustomerCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Notes { get; set; }
}
