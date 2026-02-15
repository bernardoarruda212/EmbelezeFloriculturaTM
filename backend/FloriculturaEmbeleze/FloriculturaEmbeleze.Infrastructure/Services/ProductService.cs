using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Products;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using FloriculturaEmbeleze.Domain.Entities;
using FloriculturaEmbeleze.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResultDto<ProductListDto>> GetProductsAsync(ProductFilterDto filter)
    {
        var query = _context.Products
            .Include(p => p.Images)
            .Include(p => p.Variations)
            .Include(p => p.ProductCategories)
                .ThenInclude(pc => pc.Category)
            .AsQueryable();

        // Search filter
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(search));
        }

        // Category filter
        if (filter.CategoryId.HasValue)
        {
            query = query.Where(p =>
                p.ProductCategories.Any(pc => pc.CategoryId == filter.CategoryId.Value));
        }

        // Price range filter
        if (filter.MinPrice.HasValue)
            query = query.Where(p => p.BasePrice >= filter.MinPrice.Value);

        if (filter.MaxPrice.HasValue)
            query = query.Where(p => p.BasePrice <= filter.MaxPrice.Value);

        // Active filter
        if (filter.IsActive.HasValue)
            query = query.Where(p => p.IsActive == filter.IsActive.Value);

        // Sorting
        query = filter.SortBy?.ToLower() switch
        {
            "name" => query.OrderBy(p => p.Name),
            "name_desc" => query.OrderByDescending(p => p.Name),
            "price" => query.OrderBy(p => p.BasePrice),
            "price_desc" => query.OrderByDescending(p => p.BasePrice),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            "oldest" => query.OrderBy(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(p => new ProductListDto
            {
                Id = p.Id,
                Name = p.Name,
                Slug = p.Slug,
                BasePrice = p.BasePrice,
                StockQuantity = p.StockQuantity,
                IsFeatured = p.IsFeatured,
                IsActive = p.IsActive,
                Badge = p.Badge,
                MainImageUrl = p.Images
                    .Where(i => i.IsMain)
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault()
                    ?? p.Images
                        .OrderBy(i => i.DisplayOrder)
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault(),
                CategoryNames = p.ProductCategories
                    .Select(pc => pc.Category.Name)
                    .ToList(),
                CreatedAt = p.CreatedAt,
                VariationCount = p.Variations.Count,
                Variations = p.Variations.Select(v => new ProductVariationDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity,
                    IsActive = v.IsActive
                }).ToList()
            })
            .ToListAsync();

        return new PaginatedResultDto<ProductListDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<ProductDetailDto?> GetProductBySlugAsync(string slug)
    {
        var product = await _context.Products
            .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
            .Include(p => p.Variations)
            .Include(p => p.ProductCategories)
                .ThenInclude(pc => pc.Category)
            .FirstOrDefaultAsync(p => p.Slug == slug);

        return product == null ? null : MapToDetailDto(product);
    }

    public async Task<ProductDetailDto?> GetProductByIdAsync(Guid id)
    {
        var product = await _context.Products
            .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
            .Include(p => p.Variations)
            .Include(p => p.ProductCategories)
                .ThenInclude(pc => pc.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        return product == null ? null : MapToDetailDto(product);
    }

    public async Task<List<ProductListDto>> GetFeaturedProductsAsync(int count)
    {
        return await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Variations)
            .Include(p => p.ProductCategories)
                .ThenInclude(pc => pc.Category)
            .Where(p => p.IsFeatured && p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .Take(count)
            .Select(p => new ProductListDto
            {
                Id = p.Id,
                Name = p.Name,
                Slug = p.Slug,
                BasePrice = p.BasePrice,
                StockQuantity = p.StockQuantity,
                IsFeatured = p.IsFeatured,
                IsActive = p.IsActive,
                Badge = p.Badge,
                MainImageUrl = p.Images
                    .Where(i => i.IsMain)
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault()
                    ?? p.Images
                        .OrderBy(i => i.DisplayOrder)
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault(),
                CategoryNames = p.ProductCategories
                    .Select(pc => pc.Category.Name)
                    .ToList(),
                CreatedAt = p.CreatedAt,
                VariationCount = p.Variations.Count,
                Variations = p.Variations.Select(v => new ProductVariationDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity,
                    IsActive = v.IsActive
                }).ToList()
            })
            .ToListAsync();
    }

    public async Task<ProductDetailDto> CreateProductAsync(ProductCreateDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Slug = GenerateSlug(dto.Name),
            Description = dto.Description,
            BasePrice = dto.BasePrice,
            StockQuantity = dto.StockQuantity,
            IsFeatured = dto.IsFeatured,
            IsActive = dto.IsActive,
            Badge = dto.Badge,
            CreatedAt = DateTime.UtcNow
        };

        // Ensure slug uniqueness
        product.Slug = await EnsureUniqueSlugAsync(product.Slug, null);

        _context.Products.Add(product);

        // Add categories
        foreach (var categoryId in dto.CategoryIds)
        {
            _context.ProductCategories.Add(new ProductCategory
            {
                ProductId = product.Id,
                CategoryId = categoryId
            });
        }

        // Add variations
        foreach (var variation in dto.Variations)
        {
            _context.ProductVariations.Add(new ProductVariation
            {
                ProductId = product.Id,
                Name = variation.Name,
                Price = variation.Price,
                StockQuantity = variation.StockQuantity,
                IsActive = true
            });
        }

        await _context.SaveChangesAsync();

        return (await GetProductByIdAsync(product.Id))!;
    }

    public async Task<ProductDetailDto> UpdateProductAsync(Guid id, ProductUpdateDto dto)
    {
        var product = await _context.Products
            .Include(p => p.ProductCategories)
            .Include(p => p.Variations)
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException("Produto não encontrado.");

        product.Name = dto.Name;
        product.Slug = GenerateSlug(dto.Name);
        product.Slug = await EnsureUniqueSlugAsync(product.Slug, product.Id);
        product.Description = dto.Description;
        product.BasePrice = dto.BasePrice;
        product.StockQuantity = dto.StockQuantity;
        product.IsFeatured = dto.IsFeatured;
        product.IsActive = dto.IsActive;
        product.Badge = dto.Badge;
        product.UpdatedAt = DateTime.UtcNow;

        // Sync categories: remove old, add new
        _context.ProductCategories.RemoveRange(product.ProductCategories);
        foreach (var categoryId in dto.CategoryIds)
        {
            _context.ProductCategories.Add(new ProductCategory
            {
                ProductId = product.Id,
                CategoryId = categoryId
            });
        }

        // Sync variations: remove old, add new
        _context.ProductVariations.RemoveRange(product.Variations);
        foreach (var variation in dto.Variations)
        {
            _context.ProductVariations.Add(new ProductVariation
            {
                ProductId = product.Id,
                Name = variation.Name,
                Price = variation.Price,
                StockQuantity = variation.StockQuantity,
                IsActive = true
            });
        }

        await _context.SaveChangesAsync();

        return (await GetProductByIdAsync(product.Id))!;
    }

    public async Task DeleteProductAsync(Guid id)
    {
        var product = await _context.Products.FindAsync(id)
            ?? throw new KeyNotFoundException("Produto não encontrado.");

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
    }

    public async Task ToggleActiveAsync(Guid id)
    {
        var product = await _context.Products.FindAsync(id)
            ?? throw new KeyNotFoundException("Produto não encontrado.");

        product.IsActive = !product.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task ToggleFeaturedAsync(Guid id)
    {
        var product = await _context.Products.FindAsync(id)
            ?? throw new KeyNotFoundException("Produto não encontrado.");

        product.IsFeatured = !product.IsFeatured;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task AddProductImageAsync(Guid productId, string imageUrl)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == productId)
            ?? throw new KeyNotFoundException("Produto não encontrado.");

        var maxOrder = product.Images.Any()
            ? product.Images.Max(i => i.DisplayOrder) + 1
            : 0;

        var image = new ProductImage
        {
            ProductId = productId,
            ImageUrl = imageUrl,
            DisplayOrder = maxOrder,
            IsMain = !product.Images.Any(),
            CreatedAt = DateTime.UtcNow
        };

        _context.ProductImages.Add(image);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveProductImageAsync(Guid productId, Guid imageId)
    {
        var image = await _context.ProductImages
            .FirstOrDefaultAsync(i => i.Id == imageId && i.ProductId == productId)
            ?? throw new KeyNotFoundException("Imagem não encontrada.");

        _context.ProductImages.Remove(image);
        await _context.SaveChangesAsync();
    }

    public async Task ReorderProductImagesAsync(Guid productId, List<Guid> imageIds)
    {
        var images = await _context.ProductImages
            .Where(i => i.ProductId == productId)
            .ToListAsync();

        for (int i = 0; i < imageIds.Count; i++)
        {
            var image = images.FirstOrDefault(img => img.Id == imageIds[i]);
            if (image != null)
            {
                image.DisplayOrder = i;
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task SetMainImageAsync(Guid productId, Guid imageId)
    {
        var images = await _context.ProductImages
            .Where(i => i.ProductId == productId)
            .ToListAsync();

        foreach (var image in images)
        {
            image.IsMain = image.Id == imageId;
        }

        await _context.SaveChangesAsync();
    }

    private static ProductDetailDto MapToDetailDto(Product product) => new()
    {
        Id = product.Id,
        Name = product.Name,
        Slug = product.Slug,
        Description = product.Description,
        BasePrice = product.BasePrice,
        StockQuantity = product.StockQuantity,
        IsFeatured = product.IsFeatured,
        IsActive = product.IsActive,
        Badge = product.Badge,
        MainImageUrl = product.Images
            .Where(i => i.IsMain)
            .Select(i => i.ImageUrl)
            .FirstOrDefault()
            ?? product.Images
                .OrderBy(i => i.DisplayOrder)
                .Select(i => i.ImageUrl)
                .FirstOrDefault(),
        CategoryNames = product.ProductCategories
            .Select(pc => pc.Category.Name)
            .ToList(),
        CreatedAt = product.CreatedAt,
        Images = product.Images
            .OrderBy(i => i.DisplayOrder)
            .Select(i => new ProductImageDto
            {
                Id = i.Id,
                ImageUrl = i.ImageUrl,
                DisplayOrder = i.DisplayOrder,
                IsMain = i.IsMain
            })
            .ToList(),
        Variations = product.Variations
            .Select(v => new ProductVariationDto
            {
                Id = v.Id,
                Name = v.Name,
                Price = v.Price,
                StockQuantity = v.StockQuantity,
                IsActive = v.IsActive
            })
            .ToList(),
        Categories = product.ProductCategories
            .Select(pc => new CategoryRefDto
            {
                Id = pc.Category.Id,
                Name = pc.Category.Name,
                Slug = pc.Category.Slug
            })
            .ToList()
    };

    private static string GenerateSlug(string name)
    {
        // Normalize and remove accents
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

        // Lowercase
        slug = slug.ToLowerInvariant();

        // Replace spaces and special chars with dashes
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-+", "-");
        slug = slug.Trim('-');

        return slug;
    }

    private async Task<string> EnsureUniqueSlugAsync(string slug, Guid? excludeProductId)
    {
        var baseSlug = slug;
        var counter = 1;

        while (true)
        {
            var query = _context.Products.Where(p => p.Slug == slug);
            if (excludeProductId.HasValue)
                query = query.Where(p => p.Id != excludeProductId.Value);

            if (!await query.AnyAsync())
                return slug;

            slug = $"{baseSlug}-{counter}";
            counter++;
        }
    }
}
