namespace FloriculturaEmbeleze.Application.DTOs.Marketing;

public class ProductPromotionCreateDto
{
    public Guid ProductId { get; set; }
    public Guid? CampaignId { get; set; }
    public decimal PromotionalPrice { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
}
