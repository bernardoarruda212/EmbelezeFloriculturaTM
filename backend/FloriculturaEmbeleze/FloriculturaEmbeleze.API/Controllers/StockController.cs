using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Stock;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using System.Security.Claims;

namespace FloriculturaEmbeleze.API.Controllers;

[ApiController]
[Route("api/stock")]
[Authorize]
public class StockController : ControllerBase
{
    private readonly IStockService _stockService;

    public StockController(IStockService stockService)
    {
        _stockService = stockService;
    }

    [HttpGet("movements")]
    public async Task<ActionResult<PaginatedResultDto<StockMovementListDto>>> GetMovements([FromQuery] StockMovementFilterDto filter)
    {
        var result = await _stockService.GetStockMovementsAsync(filter);
        return Ok(result);
    }

    [HttpPost("movements")]
    public async Task<ActionResult<StockMovementListDto>> CreateMovement([FromBody] StockMovementCreateDto dto)
    {
        var userId = Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : (Guid?)null;
        var result = await _stockService.CreateStockMovementAsync(dto, userId);
        return CreatedAtAction(nameof(GetMovements), result);
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<List<LowStockAlertDto>>> GetLowStock([FromQuery] int threshold = 5)
    {
        var result = await _stockService.GetLowStockAlertsAsync(threshold);
        return Ok(result);
    }
}
