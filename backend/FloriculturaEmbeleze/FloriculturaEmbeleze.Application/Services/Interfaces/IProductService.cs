using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Products;

namespace FloriculturaEmbeleze.Application.Services.Interfaces;

public interface IProductService
{
    Task<PaginatedResultDto<ProductListDto>> GetProductsAsync(ProductFilterDto filter);
    Task<ProductDetailDto?> GetProductBySlugAsync(string slug);
    Task<ProductDetailDto?> GetProductByIdAsync(Guid id);
    Task<List<ProductListDto>> GetFeaturedProductsAsync(int count);
    Task<ProductDetailDto> CreateProductAsync(ProductCreateDto dto);
    Task<ProductDetailDto> UpdateProductAsync(Guid id, ProductUpdateDto dto);
    Task DeleteProductAsync(Guid id);
    Task ToggleActiveAsync(Guid id);
    Task ToggleFeaturedAsync(Guid id);
    Task AddProductImageAsync(Guid productId, string imageUrl);
    Task RemoveProductImageAsync(Guid productId, Guid imageId);
    Task ReorderProductImagesAsync(Guid productId, List<Guid> imageIds);
    Task SetMainImageAsync(Guid productId, Guid imageId);
}
