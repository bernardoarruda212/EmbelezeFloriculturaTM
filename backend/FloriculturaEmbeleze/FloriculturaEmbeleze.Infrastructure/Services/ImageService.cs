using FloriculturaEmbeleze.Application.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class ImageService : IImageService
{
    private readonly IWebHostEnvironment _environment;

    public ImageService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<string> UploadImageAsync(Stream stream, string fileName)
    {
        var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");

        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await stream.CopyToAsync(fileStream);
        }

        return $"/uploads/{uniqueFileName}";
    }

    public Task DeleteImageAsync(string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            return Task.CompletedTask;

        // Remove leading slash for path combination
        var relativePath = imageUrl.TrimStart('/');
        var filePath = Path.Combine(_environment.WebRootPath, relativePath);

        if (File.Exists(filePath))
            File.Delete(filePath);

        return Task.CompletedTask;
    }
}
