using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Marketing;
using FloriculturaEmbeleze.Application.Services.Interfaces;

namespace FloriculturaEmbeleze.API.Controllers;

[ApiController]
[Route("api/coupons")]
[Authorize]
public class CouponsController : ControllerBase
{
    private readonly ICouponService _couponService;

    public CouponsController(ICouponService couponService)
    {
        _couponService = couponService;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResultDto<CouponListDto>>> GetCoupons([FromQuery] string? search, [FromQuery] bool? isActive, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _couponService.GetCouponsAsync(search, isActive, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CouponListDto>> GetCouponById(Guid id)
    {
        var coupon = await _couponService.GetCouponByIdAsync(id);
        if (coupon == null) return NotFound();
        return Ok(coupon);
    }

    [HttpPost]
    public async Task<ActionResult<CouponListDto>> CreateCoupon([FromBody] CouponCreateDto dto)
    {
        var coupon = await _couponService.CreateCouponAsync(dto);
        return CreatedAtAction(nameof(GetCouponById), new { id = coupon.Id }, coupon);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CouponListDto>> UpdateCoupon(Guid id, [FromBody] CouponCreateDto dto)
    {
        var coupon = await _couponService.UpdateCouponAsync(id, dto);
        return Ok(coupon);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCoupon(Guid id)
    {
        await _couponService.DeleteCouponAsync(id);
        return NoContent();
    }

    [HttpPost("validate")]
    [AllowAnonymous]
    public async Task<ActionResult<CouponValidationResultDto>> ValidateCoupon([FromBody] CouponValidationDto dto)
    {
        var result = await _couponService.ValidateCouponAsync(dto);
        return Ok(result);
    }
}
