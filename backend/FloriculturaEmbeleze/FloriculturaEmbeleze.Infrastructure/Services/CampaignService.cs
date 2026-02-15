using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Marketing;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using FloriculturaEmbeleze.Domain.Entities;
using FloriculturaEmbeleze.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class CampaignService : ICampaignService
{
    private readonly AppDbContext _context;

    public CampaignService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResultDto<CampaignListDto>> GetCampaignsAsync(string? search, bool? isActive, int page = 1, int pageSize = 20)
    {
        var query = _context.Campaigns
            .Include(c => c.Coupons)
            .Include(c => c.ProductPromotions)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(searchLower) || (c.Description != null && c.Description.ToLower().Contains(searchLower)));
        }

        if (isActive.HasValue)
            query = query.Where(c => c.IsActive == isActive.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CampaignListDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                IsActive = c.IsActive,
                CouponCount = c.Coupons.Count,
                PromotionCount = c.ProductPromotions.Count,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return new PaginatedResultDto<CampaignListDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<CampaignListDto?> GetCampaignByIdAsync(Guid id)
    {
        var campaign = await _context.Campaigns
            .Include(c => c.Coupons)
            .Include(c => c.ProductPromotions)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (campaign == null) return null;

        return new CampaignListDto
        {
            Id = campaign.Id,
            Name = campaign.Name,
            Description = campaign.Description,
            StartDate = campaign.StartDate,
            EndDate = campaign.EndDate,
            IsActive = campaign.IsActive,
            CouponCount = campaign.Coupons.Count,
            PromotionCount = campaign.ProductPromotions.Count,
            CreatedAt = campaign.CreatedAt
        };
    }

    public async Task<CampaignListDto> CreateCampaignAsync(CampaignCreateDto dto)
    {
        var campaign = new Campaign
        {
            Name = dto.Name,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Campaigns.Add(campaign);
        await _context.SaveChangesAsync();

        return (await GetCampaignByIdAsync(campaign.Id))!;
    }

    public async Task<CampaignListDto> UpdateCampaignAsync(Guid id, CampaignCreateDto dto)
    {
        var campaign = await _context.Campaigns.FindAsync(id)
            ?? throw new KeyNotFoundException("Campanha não encontrada.");

        campaign.Name = dto.Name;
        campaign.Description = dto.Description;
        campaign.StartDate = dto.StartDate;
        campaign.EndDate = dto.EndDate;
        campaign.IsActive = dto.IsActive;
        campaign.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (await GetCampaignByIdAsync(id))!;
    }

    public async Task DeleteCampaignAsync(Guid id)
    {
        var campaign = await _context.Campaigns.FindAsync(id)
            ?? throw new KeyNotFoundException("Campanha não encontrada.");

        _context.Campaigns.Remove(campaign);
        await _context.SaveChangesAsync();
    }

    public async Task ToggleActiveAsync(Guid id)
    {
        var campaign = await _context.Campaigns.FindAsync(id)
            ?? throw new KeyNotFoundException("Campanha não encontrada.");

        campaign.IsActive = !campaign.IsActive;
        campaign.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
}
