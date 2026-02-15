namespace FloriculturaEmbeleze.Domain.Entities;

public class Banner
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid HomePageSectionId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public HomePageSection Section { get; set; } = null!;
}
