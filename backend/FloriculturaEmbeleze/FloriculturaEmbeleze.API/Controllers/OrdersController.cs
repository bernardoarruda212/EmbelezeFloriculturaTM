using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Orders;
using FloriculturaEmbeleze.Application.Services.Interfaces;

namespace FloriculturaEmbeleze.API.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<ActionResult<OrderDetailDto>> CreateOrder([FromBody] OrderCreateDto dto)
    {
        var result = await _orderService.CreateOrderAsync(dto);
        return CreatedAtAction(nameof(GetOrder), new { id = result.Id }, result);
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<PaginatedResultDto<OrderListDto>>> GetOrders(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _orderService.GetOrdersAsync(status, search, dateFrom, dateTo, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<OrderDetailDto>> GetOrder(Guid id)
    {
        var result = await _orderService.GetOrderByIdAsync(id);
        return Ok(result);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] OrderStatusUpdateDto dto)
    {
        await _orderService.UpdateOrderStatusAsync(id, dto);
        return NoContent();
    }

    [HttpGet("stats")]
    [Authorize]
    public async Task<ActionResult<OrderStatsDto>> GetOrderStats()
    {
        var result = await _orderService.GetOrderStatsAsync();
        return Ok(result);
    }
}
