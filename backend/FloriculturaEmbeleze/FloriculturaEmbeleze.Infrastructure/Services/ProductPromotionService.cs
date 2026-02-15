using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Marketing;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using FloriculturaEmbeleze.Domain.Entities;
using FloriculturaEmbeleze.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class ProductPromotionService : IProductPromotionService
{
    private readonly AppDbContext _context;

    public ProductPromotionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResultDto<ProductPromotionListDto>> GetPromotionsAsync(Guid? productId, bool? isActive, int page = 1, int pageSize = 20)
    {
        var query = _context.ProductPromotions
            .Include(pp => pp.Product)
            .Include(pp => pp.Campaign)
            .AsQueryable();

        if (productId.HasValue)
            query = query.Where(pp => pp.ProductId == productId.Value);

        if (isActive.HasValue)
            query = query.Where(pp => pp.IsActive == isActive.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(pp => pp.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(pp => new ProductPromotionListDto
            {
                Id = pp.Id,
                ProductId = pp.ProductId,
                ProductName = pp.Product.Name,
                OriginalPrice = pp.Product.BasePrice,
                PromotionalPrice = pp.PromotionalPrice,
                DiscountPercentage = pp.Product.BasePrice > 0
                    ? Math.Round((pp.Product.BasePrice - pp.PromotionalPrice) / pp.Product.BasePrice * 100, 2)
                    : 0,
                StartDate = pp.StartDate,
                EndDate = pp.EndDate,
                IsActive = pp.IsActive,
                CampaignName = pp.Campaign != null ? pp.Campaign.Name : null,
                CreatedAt = pp.CreatedAt
            })
            .ToListAsync();

        return new PaginatedResultDto<ProductPromotionListDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ProductPromotionListDto> CreatePromotionAsync(ProductPromotionCreateDto dto)
    {
        var product = await _context.Products.FindAsync(dto.ProductId)
            ?? throw new KeyNotFoundException("Produto não encontrado.");

        var promotion = new ProductPromotion
        {
            ProductId = dto.ProductId,
            CampaignId = dto.CampaignId,
            PromotionalPrice = dto.PromotionalPrice,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.ProductPromotions.Add(promotion);
        await _context.SaveChangesAsync();

        return new ProductPromotionListDto
        {
            Id = promotion.Id,
            ProductId = promotion.ProductId,
            ProductName = product.Name,
            OriginalPrice = product.BasePrice,
            PromotionalPrice = promotion.PromotionalPrice,
            DiscountPercentage = product.BasePrice > 0
                ? Math.Round((product.BasePrice - promotion.PromotionalPrice) / product.BasePrice * 100, 2)
                : 0,
            StartDate = promotion.StartDate,
            EndDate = promotion.EndDate,
            IsActive = promotion.IsActive,
            CampaignName = dto.CampaignId.HasValue
                ? (await _context.Campaigns.FindAsync(dto.CampaignId))?.Name
                : null,
            CreatedAt = promotion.CreatedAt
        };
    }

    public async Task<ProductPromotionListDto> UpdatePromotionAsync(Guid id, ProductPromotionCreateDto dto)
    {
        var promotion = await _context.ProductPromotions
            .Include(pp => pp.Product)
            .Include(pp => pp.Campaign)
            .FirstOrDefaultAsync(pp => pp.Id == id)
            ?? throw new KeyNotFoundException("Promoção não encontrada.");

        var product = await _context.Products.FindAsync(dto.ProductId)
            ?? throw new KeyNotFoundException("Produto não encontrado.");

        promotion.ProductId = dto.ProductId;
        promotion.CampaignId = dto.CampaignId;
        promotion.PromotionalPrice = dto.PromotionalPrice;
        promotion.StartDate = dto.StartDate;
        promotion.EndDate = dto.EndDate;
        promotion.IsActive = dto.IsActive;
        promotion.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ProductPromotionListDto
        {
            Id = promotion.Id,
            ProductId = promotion.ProductId,
            ProductName = product.Name,
            OriginalPrice = product.BasePrice,
            PromotionalPrice = promotion.PromotionalPrice,
            DiscountPercentage = product.BasePrice > 0
                ? Math.Round((product.BasePrice - promotion.PromotionalPrice) / product.BasePrice * 100, 2)
                : 0,
            StartDate = promotion.StartDate,
            EndDate = promotion.EndDate,
            IsActive = promotion.IsActive,
            CampaignName = dto.CampaignId.HasValue
                ? (await _context.Campaigns.FindAsync(dto.CampaignId))?.Name
                : null,
            CreatedAt = promotion.CreatedAt
        };
    }

    public async Task DeletePromotionAsync(Guid id)
    {
        var promotion = await _context.ProductPromotions.FindAsync(id)
            ?? throw new KeyNotFoundException("Promoção não encontrada.");

        _context.ProductPromotions.Remove(promotion);
        await _context.SaveChangesAsync();
    }
}
