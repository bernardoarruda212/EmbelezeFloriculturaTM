using FloriculturaEmbeleze.Application.DTOs.HomePage;

namespace FloriculturaEmbeleze.Application.Services.Interfaces;

public interface IHomePageService
{
    Task<List<HomePageSectionDto>> GetVisibleSectionsAsync();
    Task<List<HomePageSectionDto>> GetAllSectionsAsync();
    Task<HomePageSectionDto> UpdateSectionAsync(Guid id, HomePageSectionDto dto);
    Task ReorderSectionsAsync(List<Guid> sectionIds);
    Task<List<BannerDto>> GetBannersAsync();
    Task<BannerDto> CreateBannerAsync(BannerCreateDto dto);
    Task<BannerDto> UpdateBannerAsync(Guid id, BannerDto dto);
    Task DeleteBannerAsync(Guid id);
    Task ReorderBannersAsync(List<Guid> bannerIds);
}
