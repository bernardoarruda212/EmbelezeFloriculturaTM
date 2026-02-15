using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FloriculturaEmbeleze.Application.DTOs.Categories;
using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.Services.Interfaces;

namespace FloriculturaEmbeleze.API.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetActiveCategories()
    {
        var result = await _categoryService.GetActiveCategoriesAsync();
        return Ok(result);
    }

    [HttpGet("all")]
    [Authorize]
    public async Task<ActionResult<List<CategoryDto>>> GetAllCategories()
    {
        var result = await _categoryService.GetAllCategoriesAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CategoryDto>> GetCategory(Guid id)
    {
        var result = await _categoryService.GetCategoryByIdAsync(id);
        return Ok(result);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CategoryCreateDto dto)
    {
        var result = await _categoryService.CreateCategoryAsync(dto);
        return CreatedAtAction(nameof(GetCategory), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<CategoryDto>> UpdateCategory(Guid id, [FromBody] CategoryCreateDto dto)
    {
        var result = await _categoryService.UpdateCategoryAsync(id, dto);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        await _categoryService.DeleteCategoryAsync(id);
        return NoContent();
    }

    [HttpPut("reorder")]
    [Authorize]
    public async Task<IActionResult> ReorderCategories([FromBody] ReorderRequestDto dto)
    {
        await _categoryService.ReorderCategoriesAsync(dto.Ids);
        return NoContent();
    }
}
