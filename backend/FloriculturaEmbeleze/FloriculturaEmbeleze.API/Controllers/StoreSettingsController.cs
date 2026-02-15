using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FloriculturaEmbeleze.Application.DTOs.StoreSettings;
using FloriculturaEmbeleze.Application.Services.Interfaces;

namespace FloriculturaEmbeleze.API.Controllers;

[ApiController]
[Route("api/store-settings")]
public class StoreSettingsController : ControllerBase
{
    private readonly IStoreSettingsService _storeSettingsService;

    public StoreSettingsController(IStoreSettingsService storeSettingsService)
    {
        _storeSettingsService = storeSettingsService;
    }

    [HttpGet]
    public async Task<ActionResult<StoreSettingsDto>> GetSettings()
    {
        var result = await _storeSettingsService.GetSettingsAsync();
        return Ok(result);
    }

    [HttpPut]
    [Authorize]
    public async Task<ActionResult<StoreSettingsDto>> UpdateSettings([FromBody] StoreSettingsDto dto)
    {
        var result = await _storeSettingsService.UpdateSettingsAsync(dto);
        return Ok(result);
    }
}
