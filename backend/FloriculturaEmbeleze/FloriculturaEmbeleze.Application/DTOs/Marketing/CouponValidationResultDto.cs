using FloriculturaEmbeleze.Domain.Enums;

namespace FloriculturaEmbeleze.Application.DTOs.Marketing;

public class CouponValidationResultDto
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
    public Guid? CouponId { get; set; }
    public DiscountType? DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal DiscountAmount { get; set; }
}
