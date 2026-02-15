namespace FloriculturaEmbeleze.Application.DTOs.Marketing;

public class ProductPromotionListDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal OriginalPrice { get; set; }
    public decimal PromotionalPrice { get; set; }
    public decimal DiscountPercentage { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public string? CampaignName { get; set; }
    public DateTime CreatedAt { get; set; }
}
