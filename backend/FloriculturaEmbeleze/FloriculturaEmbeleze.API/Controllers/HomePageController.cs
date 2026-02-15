using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.HomePage;
using FloriculturaEmbeleze.Application.Services.Interfaces;

namespace FloriculturaEmbeleze.API.Controllers;

[ApiController]
[Route("api/homepage")]
public class HomePageController : ControllerBase
{
    private readonly IHomePageService _homePageService;

    public HomePageController(IHomePageService homePageService)
    {
        _homePageService = homePageService;
    }

    // --- Sections ---

    [HttpGet("sections")]
    public async Task<ActionResult<List<HomePageSectionDto>>> GetVisibleSections()
    {
        var result = await _homePageService.GetVisibleSectionsAsync();
        return Ok(result);
    }

    [HttpGet("sections/all")]
    [Authorize]
    public async Task<ActionResult<List<HomePageSectionDto>>> GetAllSections()
    {
        var result = await _homePageService.GetAllSectionsAsync();
        return Ok(result);
    }

    [HttpPut("sections/{id:guid}")]
    [Authorize]
    public async Task<ActionResult<HomePageSectionDto>> UpdateSection(Guid id, [FromBody] HomePageSectionDto dto)
    {
        var result = await _homePageService.UpdateSectionAsync(id, dto);
        return Ok(result);
    }

    [HttpPut("sections/reorder")]
    [Authorize]
    public async Task<IActionResult> ReorderSections([FromBody] ReorderRequestDto dto)
    {
        await _homePageService.ReorderSectionsAsync(dto.Ids);
        return NoContent();
    }

    // --- Banners ---

    [HttpGet("banners")]
    public async Task<ActionResult<List<BannerDto>>> GetBanners()
    {
        var result = await _homePageService.GetBannersAsync();
        return Ok(result);
    }

    [HttpPost("banners")]
    [Authorize]
    public async Task<ActionResult<BannerDto>> CreateBanner([FromBody] BannerCreateDto dto)
    {
        var result = await _homePageService.CreateBannerAsync(dto);
        return CreatedAtAction(nameof(GetBanners), result);
    }

    [HttpPut("banners/{id:guid}")]
    [Authorize]
    public async Task<ActionResult<BannerDto>> UpdateBanner(Guid id, [FromBody] BannerDto dto)
    {
        var result = await _homePageService.UpdateBannerAsync(id, dto);
        return Ok(result);
    }

    [HttpDelete("banners/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteBanner(Guid id)
    {
        await _homePageService.DeleteBannerAsync(id);
        return NoContent();
    }

    [HttpPut("banners/reorder")]
    [Authorize]
    public async Task<IActionResult> ReorderBanners([FromBody] ReorderRequestDto dto)
    {
        await _homePageService.ReorderBannersAsync(dto.Ids);
        return NoContent();
    }
}
