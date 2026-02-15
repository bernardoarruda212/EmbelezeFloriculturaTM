namespace FloriculturaEmbeleze.Domain.Entities;

public class ProductPromotion : BaseEntity
{
    public Guid ProductId { get; set; }
    public Guid? CampaignId { get; set; }
    public decimal PromotionalPrice { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;

    public Product Product { get; set; } = null!;
    public Campaign? Campaign { get; set; }
}
