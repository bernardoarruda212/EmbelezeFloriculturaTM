namespace FloriculturaEmbeleze.Application.Services.Interfaces;

public interface IImageService
{
    Task<string> UploadImageAsync(Stream stream, string fileName);
    Task DeleteImageAsync(string imageUrl);
}
