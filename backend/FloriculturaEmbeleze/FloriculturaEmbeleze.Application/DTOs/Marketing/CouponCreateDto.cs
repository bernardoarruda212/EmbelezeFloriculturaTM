using FloriculturaEmbeleze.Domain.Enums;

namespace FloriculturaEmbeleze.Application.DTOs.Marketing;

public class CouponCreateDto
{
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DiscountType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public int? MaxUses { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
    public Guid? CampaignId { get; set; }
}
