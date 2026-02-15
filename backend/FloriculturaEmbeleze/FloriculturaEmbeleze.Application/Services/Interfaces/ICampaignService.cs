using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Marketing;

namespace FloriculturaEmbeleze.Application.Services.Interfaces;

public interface ICampaignService
{
    Task<PaginatedResultDto<CampaignListDto>> GetCampaignsAsync(string? search, bool? isActive, int page = 1, int pageSize = 20);
    Task<CampaignListDto?> GetCampaignByIdAsync(Guid id);
    Task<CampaignListDto> CreateCampaignAsync(CampaignCreateDto dto);
    Task<CampaignListDto> UpdateCampaignAsync(Guid id, CampaignCreateDto dto);
    Task DeleteCampaignAsync(Guid id);
    Task ToggleActiveAsync(Guid id);
}
