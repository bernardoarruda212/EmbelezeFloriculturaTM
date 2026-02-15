namespace FloriculturaEmbeleze.Application.DTOs.HomePage;

public class BannerCreateDto
{
    public string ImageUrl { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
}
