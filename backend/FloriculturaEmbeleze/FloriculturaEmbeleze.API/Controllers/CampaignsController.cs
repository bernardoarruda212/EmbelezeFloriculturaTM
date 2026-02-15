using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Marketing;
using FloriculturaEmbeleze.Application.Services.Interfaces;

namespace FloriculturaEmbeleze.API.Controllers;

[ApiController]
[Route("api/campaigns")]
[Authorize]
public class CampaignsController : ControllerBase
{
    private readonly ICampaignService _campaignService;

    public CampaignsController(ICampaignService campaignService)
    {
        _campaignService = campaignService;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResultDto<CampaignListDto>>> GetCampaigns(
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _campaignService.GetCampaignsAsync(search, isActive, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CampaignListDto>> GetCampaignById(Guid id)
    {
        var campaign = await _campaignService.GetCampaignByIdAsync(id);
        if (campaign == null) return NotFound();
        return Ok(campaign);
    }

    [HttpPost]
    public async Task<ActionResult<CampaignListDto>> CreateCampaign([FromBody] CampaignCreateDto dto)
    {
        var campaign = await _campaignService.CreateCampaignAsync(dto);
        return CreatedAtAction(nameof(GetCampaignById), new { id = campaign.Id }, campaign);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CampaignListDto>> UpdateCampaign(Guid id, [FromBody] CampaignCreateDto dto)
    {
        var campaign = await _campaignService.UpdateCampaignAsync(id, dto);
        return Ok(campaign);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCampaign(Guid id)
    {
        await _campaignService.DeleteCampaignAsync(id);
        return NoContent();
    }

    [HttpPatch("{id:guid}/toggle-active")]
    public async Task<IActionResult> ToggleActive(Guid id)
    {
        await _campaignService.ToggleActiveAsync(id);
        return NoContent();
    }
}
