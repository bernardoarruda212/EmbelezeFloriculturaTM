namespace FloriculturaEmbeleze.Domain.Entities;

public class Campaign : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Coupon> Coupons { get; set; } = new List<Coupon>();
    public ICollection<ProductPromotion> ProductPromotions { get; set; } = new List<ProductPromotion>();
}
