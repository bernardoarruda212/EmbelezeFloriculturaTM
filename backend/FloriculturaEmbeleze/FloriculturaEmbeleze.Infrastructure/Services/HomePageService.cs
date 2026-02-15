using FloriculturaEmbeleze.Application.DTOs.HomePage;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using FloriculturaEmbeleze.Domain.Entities;
using FloriculturaEmbeleze.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class HomePageService : IHomePageService
{
    private readonly AppDbContext _context;

    public HomePageService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<HomePageSectionDto>> GetVisibleSectionsAsync()
    {
        return await _context.HomePageSections
            .Where(s => s.IsVisible)
            .OrderBy(s => s.DisplayOrder)
            .Select(s => new HomePageSectionDto
            {
                Id = s.Id,
                SectionType = s.SectionType,
                Title = s.Title,
                Subtitle = s.Subtitle,
                ContentJson = s.ContentJson,
                DisplayOrder = s.DisplayOrder,
                IsVisible = s.IsVisible
            })
            .ToListAsync();
    }

    public async Task<List<HomePageSectionDto>> GetAllSectionsAsync()
    {
        return await _context.HomePageSections
            .OrderBy(s => s.DisplayOrder)
            .Select(s => new HomePageSectionDto
            {
                Id = s.Id,
                SectionType = s.SectionType,
                Title = s.Title,
                Subtitle = s.Subtitle,
                ContentJson = s.ContentJson,
                DisplayOrder = s.DisplayOrder,
                IsVisible = s.IsVisible
            })
            .ToListAsync();
    }

    public async Task<HomePageSectionDto> UpdateSectionAsync(Guid id, HomePageSectionDto dto)
    {
        var section = await _context.HomePageSections.FindAsync(id)
            ?? throw new KeyNotFoundException("Seção não encontrada.");

        section.Title = dto.Title;
        section.Subtitle = dto.Subtitle;
        section.ContentJson = dto.ContentJson;
        section.IsVisible = dto.IsVisible;
        section.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new HomePageSectionDto
        {
            Id = section.Id,
            SectionType = section.SectionType,
            Title = section.Title,
            Subtitle = section.Subtitle,
            ContentJson = section.ContentJson,
            DisplayOrder = section.DisplayOrder,
            IsVisible = section.IsVisible
        };
    }

    public async Task ReorderSectionsAsync(List<Guid> sectionIds)
    {
        var sections = await _context.HomePageSections.ToListAsync();

        for (int i = 0; i < sectionIds.Count; i++)
        {
            var section = sections.FirstOrDefault(s => s.Id == sectionIds[i]);
            if (section != null)
            {
                section.DisplayOrder = i;
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task<List<BannerDto>> GetBannersAsync()
    {
        return await _context.Banners
            .Where(b => b.IsActive)
            .OrderBy(b => b.DisplayOrder)
            .Select(b => new BannerDto
            {
                Id = b.Id,
                HomePageSectionId = b.HomePageSectionId,
                ImageUrl = b.ImageUrl,
                LinkUrl = b.LinkUrl,
                Title = b.Title,
                Description = b.Description,
                DisplayOrder = b.DisplayOrder,
                IsActive = b.IsActive
            })
            .ToListAsync();
    }

    public async Task<BannerDto> CreateBannerAsync(BannerCreateDto dto)
    {
        // Find the Banners section
        var bannersSection = await _context.HomePageSections
            .FirstOrDefaultAsync(s => s.SectionType == Domain.Enums.HomePageSectionType.Banners)
            ?? throw new KeyNotFoundException("Seção de banners não encontrada.");

        var maxOrder = await _context.Banners
            .Where(b => b.HomePageSectionId == bannersSection.Id)
            .MaxAsync(b => (int?)b.DisplayOrder) ?? -1;

        var banner = new Banner
        {
            HomePageSectionId = bannersSection.Id,
            ImageUrl = dto.ImageUrl,
            LinkUrl = dto.LinkUrl,
            Title = dto.Title,
            Description = dto.Description,
            DisplayOrder = maxOrder + 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Banners.Add(banner);
        await _context.SaveChangesAsync();

        return MapToBannerDto(banner);
    }

    public async Task<BannerDto> UpdateBannerAsync(Guid id, BannerDto dto)
    {
        var banner = await _context.Banners.FindAsync(id)
            ?? throw new KeyNotFoundException("Banner não encontrado.");

        banner.ImageUrl = dto.ImageUrl;
        banner.LinkUrl = dto.LinkUrl;
        banner.Title = dto.Title;
        banner.Description = dto.Description;
        banner.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return MapToBannerDto(banner);
    }

    public async Task DeleteBannerAsync(Guid id)
    {
        var banner = await _context.Banners.FindAsync(id)
            ?? throw new KeyNotFoundException("Banner não encontrado.");

        _context.Banners.Remove(banner);
        await _context.SaveChangesAsync();
    }

    public async Task ReorderBannersAsync(List<Guid> bannerIds)
    {
        var banners = await _context.Banners.ToListAsync();

        for (int i = 0; i < bannerIds.Count; i++)
        {
            var banner = banners.FirstOrDefault(b => b.Id == bannerIds[i]);
            if (banner != null)
            {
                banner.DisplayOrder = i;
            }
        }

        await _context.SaveChangesAsync();
    }

    private static BannerDto MapToBannerDto(Banner banner) => new()
    {
        Id = banner.Id,
        HomePageSectionId = banner.HomePageSectionId,
        ImageUrl = banner.ImageUrl,
        LinkUrl = banner.LinkUrl,
        Title = banner.Title,
        Description = banner.Description,
        DisplayOrder = banner.DisplayOrder,
        IsActive = banner.IsActive
    };
}
