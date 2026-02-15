namespace FloriculturaEmbeleze.Application.DTOs.Marketing;

public class CouponValidationDto
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderTotal { get; set; }
}
