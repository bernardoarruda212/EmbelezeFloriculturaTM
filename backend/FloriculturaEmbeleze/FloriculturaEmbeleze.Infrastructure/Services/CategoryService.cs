using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using FloriculturaEmbeleze.Application.DTOs.Categories;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using FloriculturaEmbeleze.Domain.Entities;
using FloriculturaEmbeleze.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> GetActiveCategoriesAsync()
    {
        return await _context.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description,
                IconClass = c.IconClass,
                ImageUrl = c.ImageUrl,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                ProductCount = c.ProductCategories.Count
            })
            .ToListAsync();
    }

    public async Task<List<CategoryDto>> GetAllCategoriesAsync()
    {
        return await _context.Categories
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description,
                IconClass = c.IconClass,
                ImageUrl = c.ImageUrl,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                ProductCount = c.ProductCategories.Count
            })
            .ToListAsync();
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(Guid id)
    {
        return await _context.Categories
            .Where(c => c.Id == id)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description,
                IconClass = c.IconClass,
                ImageUrl = c.ImageUrl,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                ProductCount = c.ProductCategories.Count
            })
            .FirstOrDefaultAsync();
    }

    public async Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto dto)
    {
        var category = new Category
        {
            Name = dto.Name,
            Slug = GenerateSlug(dto.Name),
            Description = dto.Description,
            IconClass = dto.IconClass,
            DisplayOrder = dto.DisplayOrder,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return (await GetCategoryByIdAsync(category.Id))!;
    }

    public async Task<CategoryDto> UpdateCategoryAsync(Guid id, CategoryCreateDto dto)
    {
        var category = await _context.Categories.FindAsync(id)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        category.Name = dto.Name;
        category.Slug = GenerateSlug(dto.Name);
        category.Description = dto.Description;
        category.IconClass = dto.IconClass;
        category.DisplayOrder = dto.DisplayOrder;
        category.IsActive = dto.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (await GetCategoryByIdAsync(category.Id))!;
    }

    public async Task DeleteCategoryAsync(Guid id)
    {
        var category = await _context.Categories
            .Include(c => c.ProductCategories)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        if (category.ProductCategories.Any())
            throw new InvalidOperationException(
                "Não é possível excluir uma categoria que possui produtos vinculados.");

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
    }

    public async Task ReorderCategoriesAsync(List<Guid> categoryIds)
    {
        var categories = await _context.Categories.ToListAsync();

        for (int i = 0; i < categoryIds.Count; i++)
        {
            var category = categories.FirstOrDefault(c => c.Id == categoryIds[i]);
            if (category != null)
            {
                category.DisplayOrder = i;
            }
        }

        await _context.SaveChangesAsync();
    }

    private static string GenerateSlug(string name)
    {
        var normalizedString = name.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder();

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        var slug = stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        slug = slug.ToLowerInvariant();
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-+", "-");
        slug = slug.Trim('-');

        return slug;
    }
}
