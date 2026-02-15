namespace FloriculturaEmbeleze.Application.DTOs.Contact;

public class ContactMessageCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Subject { get; set; }
    public string Message { get; set; } = string.Empty;
}
