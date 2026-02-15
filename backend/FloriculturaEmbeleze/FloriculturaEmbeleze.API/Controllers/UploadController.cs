using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FloriculturaEmbeleze.Application.Services.Interfaces;

namespace FloriculturaEmbeleze.API.Controllers;

[ApiController]
[Route("api/upload")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IImageService _imageService;

    public UploadController(IImageService imageService)
    {
        _imageService = imageService;
    }

    [HttpPost("image")]
    public async Task<ActionResult> UploadImage(IFormFile file)
    {
        var imageUrl = await _imageService.UploadImageAsync(file.OpenReadStream(), file.FileName);
        return Ok(new { imageUrl });
    }

    [HttpPost("images")]
    public async Task<ActionResult> UploadImages([FromForm] List<IFormFile> files)
    {
        var imageUrls = new List<string>();
        foreach (var file in files)
        {
            var imageUrl = await _imageService.UploadImageAsync(file.OpenReadStream(), file.FileName);
            imageUrls.Add(imageUrl);
        }
        return Ok(new { imageUrls });
    }

    [HttpDelete("image")]
    public async Task<IActionResult> DeleteImage([FromBody] DeleteImageRequestDto dto)
    {
        await _imageService.DeleteImageAsync(dto.ImageUrl);
        return NoContent();
    }
}

public record DeleteImageRequestDto(string ImageUrl);
