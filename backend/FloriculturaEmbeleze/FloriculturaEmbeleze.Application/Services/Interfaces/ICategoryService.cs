using FloriculturaEmbeleze.Application.DTOs.Categories;

namespace FloriculturaEmbeleze.Application.Services.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetActiveCategoriesAsync();
    Task<List<CategoryDto>> GetAllCategoriesAsync();
    Task<CategoryDto?> GetCategoryByIdAsync(Guid id);
    Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto dto);
    Task<CategoryDto> UpdateCategoryAsync(Guid id, CategoryCreateDto dto);
    Task DeleteCategoryAsync(Guid id);
    Task ReorderCategoriesAsync(List<Guid> categoryIds);
}
