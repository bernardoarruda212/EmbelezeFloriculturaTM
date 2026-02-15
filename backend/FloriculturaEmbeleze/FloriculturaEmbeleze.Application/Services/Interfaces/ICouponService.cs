using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Marketing;

namespace FloriculturaEmbeleze.Application.Services.Interfaces;

public interface ICouponService
{
    Task<PaginatedResultDto<CouponListDto>> GetCouponsAsync(string? search, bool? isActive, int page = 1, int pageSize = 20);
    Task<CouponListDto?> GetCouponByIdAsync(Guid id);
    Task<CouponListDto> CreateCouponAsync(CouponCreateDto dto);
    Task<CouponListDto> UpdateCouponAsync(Guid id, CouponCreateDto dto);
    Task DeleteCouponAsync(Guid id);
    Task<CouponValidationResultDto> ValidateCouponAsync(CouponValidationDto dto);
    Task RecordCouponUsageAsync(Guid couponId, Guid orderId, decimal discountAmount);
}
