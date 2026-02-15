using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Marketing;

namespace FloriculturaEmbeleze.Application.Services.Interfaces;

public interface IProductPromotionService
{
    Task<PaginatedResultDto<ProductPromotionListDto>> GetPromotionsAsync(Guid? productId, bool? isActive, int page = 1, int pageSize = 20);
    Task<ProductPromotionListDto> CreatePromotionAsync(ProductPromotionCreateDto dto);
    Task<ProductPromotionListDto> UpdatePromotionAsync(Guid id, ProductPromotionCreateDto dto);
    Task DeletePromotionAsync(Guid id);
}
