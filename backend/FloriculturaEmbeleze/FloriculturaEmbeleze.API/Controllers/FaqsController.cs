using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Faqs;
using FloriculturaEmbeleze.Application.Services.Interfaces;

namespace FloriculturaEmbeleze.API.Controllers;

[ApiController]
[Route("api/faqs")]
public class FaqsController : ControllerBase
{
    private readonly IFaqService _faqService;

    public FaqsController(IFaqService faqService)
    {
        _faqService = faqService;
    }

    [HttpGet]
    public async Task<ActionResult<List<FaqDto>>> GetActiveFaqs()
    {
        var result = await _faqService.GetActiveFaqsAsync();
        return Ok(result);
    }

    [HttpGet("all")]
    [Authorize]
    public async Task<ActionResult<List<FaqDto>>> GetAllFaqs()
    {
        var result = await _faqService.GetAllFaqsAsync();
        return Ok(result);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<FaqDto>> CreateFaq([FromBody] FaqCreateDto dto)
    {
        var result = await _faqService.CreateFaqAsync(dto);
        return CreatedAtAction(nameof(GetActiveFaqs), result);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<FaqDto>> UpdateFaq(Guid id, [FromBody] FaqDto dto)
    {
        var result = await _faqService.UpdateFaqAsync(id, dto);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteFaq(Guid id)
    {
        await _faqService.DeleteFaqAsync(id);
        return NoContent();
    }

    [HttpPut("reorder")]
    [Authorize]
    public async Task<IActionResult> ReorderFaqs([FromBody] ReorderRequestDto dto)
    {
        await _faqService.ReorderFaqsAsync(dto.Ids);
        return NoContent();
    }
}
