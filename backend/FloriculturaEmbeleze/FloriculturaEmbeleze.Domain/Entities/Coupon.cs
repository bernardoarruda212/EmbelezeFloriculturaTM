using FloriculturaEmbeleze.Domain.Enums;

namespace FloriculturaEmbeleze.Domain.Entities;

public class Coupon : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DiscountType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public int? MaxUses { get; set; }
    public int CurrentUses { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
    public Guid? CampaignId { get; set; }

    public Campaign? Campaign { get; set; }
    public ICollection<CouponUsage> Usages { get; set; } = new List<CouponUsage>();
}
