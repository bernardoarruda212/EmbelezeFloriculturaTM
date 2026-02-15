using FloriculturaEmbeleze.Domain.Enums;

namespace FloriculturaEmbeleze.Domain.Entities;

public class HomePageSection
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public HomePageSectionType SectionType { get; set; }
    public string? Title { get; set; }
    public string? Subtitle { get; set; }
    public string? ContentJson { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsVisible { get; set; } = true;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<Banner> Banners { get; set; } = new List<Banner>();
}
