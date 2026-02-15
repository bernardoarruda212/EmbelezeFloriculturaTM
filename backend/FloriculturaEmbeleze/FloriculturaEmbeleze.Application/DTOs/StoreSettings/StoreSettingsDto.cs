namespace FloriculturaEmbeleze.Application.DTOs.StoreSettings;

public class StoreSettingsDto
{
    public Guid Id { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string WhatsAppNumber { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? AboutContent { get; set; }
    public string? InstagramUrl { get; set; }
    public string? FacebookUrl { get; set; }
    public string? GoogleMapsEmbedUrl { get; set; }
    public List<BusinessHoursItemDto> BusinessHours { get; set; } = new();
}
