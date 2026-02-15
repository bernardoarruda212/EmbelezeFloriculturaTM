namespace FloriculturaEmbeleze.Application.DTOs.Marketing;

public class CampaignListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public int CouponCount { get; set; }
    public int PromotionCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
