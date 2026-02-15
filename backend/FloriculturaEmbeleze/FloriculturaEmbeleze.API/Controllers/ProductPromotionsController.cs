using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Marketing;
using FloriculturaEmbeleze.Application.Services.Interfaces;

namespace FloriculturaEmbeleze.API.Controllers;

[ApiController]
[Route("api/product-promotions")]
[Authorize]
public class ProductPromotionsController : ControllerBase
{
    private readonly IProductPromotionService _promotionService;

    public ProductPromotionsController(IProductPromotionService promotionService)
    {
        _promotionService = promotionService;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResultDto<ProductPromotionListDto>>> GetPromotions(
        [FromQuery] Guid? productId,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _promotionService.GetPromotionsAsync(productId, isActive, page, pageSize);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ProductPromotionListDto>> CreatePromotion([FromBody] ProductPromotionCreateDto dto)
    {
        var promotion = await _promotionService.CreatePromotionAsync(dto);
        return Created($"api/product-promotions/{promotion.Id}", promotion);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProductPromotionListDto>> UpdatePromotion(Guid id, [FromBody] ProductPromotionCreateDto dto)
    {
        var promotion = await _promotionService.UpdatePromotionAsync(id, dto);
        return Ok(promotion);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePromotion(Guid id)
    {
        await _promotionService.DeletePromotionAsync(id);
        return NoContent();
    }
}
