namespace FloriculturaEmbeleze.Application.DTOs.HomePage;

public class BannerDto
{
    public Guid Id { get; set; }
    public Guid HomePageSectionId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}
