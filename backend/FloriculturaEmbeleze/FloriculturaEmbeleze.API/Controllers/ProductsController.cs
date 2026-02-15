using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Products;
using FloriculturaEmbeleze.Application.Services.Interfaces;

namespace FloriculturaEmbeleze.API.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IImageService _imageService;

    public ProductsController(IProductService productService, IImageService imageService)
    {
        _productService = productService;
        _imageService = imageService;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResultDto<ProductListDto>>> GetProducts([FromQuery] ProductFilterDto filter)
    {
        var result = await _productService.GetProductsAsync(filter);
        return Ok(result);
    }

    [HttpGet("featured")]
    public async Task<ActionResult<List<ProductListDto>>> GetFeaturedProducts([FromQuery] int count = 8)
    {
        var result = await _productService.GetFeaturedProductsAsync(count);
        return Ok(result);
    }

    [HttpGet("{slugOrId}")]
    public async Task<ActionResult<ProductDetailDto>> GetProduct(string slugOrId)
    {
        ProductDetailDto result;

        if (Guid.TryParse(slugOrId, out var id))
        {
            result = await _productService.GetProductByIdAsync(id);
        }
        else
        {
            result = await _productService.GetProductBySlugAsync(slugOrId);
        }

        return Ok(result);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ProductDetailDto>> CreateProduct([FromBody] ProductCreateDto dto)
    {
        var result = await _productService.CreateProductAsync(dto);
        return CreatedAtAction(nameof(GetProduct), new { slugOrId = result.Slug }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<ProductDetailDto>> UpdateProduct(Guid id, [FromBody] ProductUpdateDto dto)
    {
        var result = await _productService.UpdateProductAsync(id, dto);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        await _productService.DeleteProductAsync(id);
        return NoContent();
    }

    [HttpPatch("{id:guid}/toggle-active")]
    [Authorize]
    public async Task<IActionResult> ToggleActive(Guid id)
    {
        await _productService.ToggleActiveAsync(id);
        return NoContent();
    }

    [HttpPatch("{id:guid}/toggle-featured")]
    [Authorize]
    public async Task<IActionResult> ToggleFeatured(Guid id)
    {
        await _productService.ToggleFeaturedAsync(id);
        return NoContent();
    }

    [HttpPost("{id:guid}/images")]
    [Authorize]
    public async Task<ActionResult> UploadProductImage(Guid id, IFormFile file)
    {
        var imageUrl = await _imageService.UploadImageAsync(file.OpenReadStream(), file.FileName);
        await _productService.AddProductImageAsync(id, imageUrl);
        return Ok(new { imageUrl });
    }

    [HttpPost("{id:guid}/images/url")]
    [Authorize]
    public async Task<ActionResult> AddProductImageByUrl(Guid id, [FromBody] AddImageUrlDto dto)
    {
        await _productService.AddProductImageAsync(id, dto.ImageUrl);
        return Ok(new { imageUrl = dto.ImageUrl });
    }

    [HttpDelete("{id:guid}/images/{imageId:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteProductImage(Guid id, Guid imageId)
    {
        await _productService.RemoveProductImageAsync(id, imageId);
        return NoContent();
    }

    [HttpPut("{id:guid}/images/reorder")]
    [Authorize]
    public async Task<IActionResult> ReorderProductImages(Guid id, [FromBody] ReorderRequestDto dto)
    {
        await _productService.ReorderProductImagesAsync(id, dto.Ids);
        return NoContent();
    }

    [HttpPatch("{id:guid}/images/{imageId:guid}/set-main")]
    [Authorize]
    public async Task<IActionResult> SetMainImage(Guid id, Guid imageId)
    {
        await _productService.SetMainImageAsync(id, imageId);
        return NoContent();
    }
}

public record AddImageUrlDto(string ImageUrl);
