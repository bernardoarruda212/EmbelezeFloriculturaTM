namespace FloriculturaEmbeleze.Application.DTOs.Customers;

public class CustomerUpdateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Notes { get; set; }
}
