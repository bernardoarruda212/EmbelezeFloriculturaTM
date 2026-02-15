using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Contact;
using FloriculturaEmbeleze.Application.Services.Interfaces;

namespace FloriculturaEmbeleze.API.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly IContactService _contactService;

    public ContactController(IContactService contactService)
    {
        _contactService = contactService;
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] ContactMessageCreateDto dto)
    {
        await _contactService.SendMessageAsync(dto);
        return Ok(new { message = "Mensagem enviada com sucesso." });
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<PaginatedResultDto<ContactMessageDto>>> GetMessages(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _contactService.GetMessagesAsync(page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<ContactMessageDto>> GetMessage(Guid id)
    {
        var result = await _contactService.GetMessageByIdAsync(id);
        return Ok(result);
    }

    [HttpPatch("{id:guid}/read")]
    [Authorize]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        await _contactService.MarkAsReadAsync(id);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteMessage(Guid id)
    {
        await _contactService.DeleteMessageAsync(id);
        return NoContent();
    }
}
