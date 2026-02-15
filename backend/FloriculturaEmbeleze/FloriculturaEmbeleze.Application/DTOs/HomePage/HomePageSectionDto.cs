using FloriculturaEmbeleze.Domain.Enums;

namespace FloriculturaEmbeleze.Application.DTOs.HomePage;

public class HomePageSectionDto
{
    public Guid Id { get; set; }
    public HomePageSectionType SectionType { get; set; }
    public string? Title { get; set; }
    public string? Subtitle { get; set; }
    public string? ContentJson { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsVisible { get; set; }
}
