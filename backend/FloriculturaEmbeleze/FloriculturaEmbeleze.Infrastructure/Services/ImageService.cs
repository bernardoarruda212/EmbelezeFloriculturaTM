using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using Microsoft.Extensions.Configuration;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class ImageService : IImageService
{
    private readonly Cloudinary _cloudinary;

    public ImageService(IConfiguration configuration)
    {
        var cloudName = configuration["Cloudinary:CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"];

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> UploadImageAsync(Stream stream, string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(uniqueFileName, stream),
            Folder = "embeleze/products",
            PublicId = Path.GetFileNameWithoutExtension(uniqueFileName),
            Overwrite = true,
            Transformation = new Transformation().Quality("auto").FetchFormat("auto")
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error != null)
            throw new InvalidOperationException($"Erro ao fazer upload da imagem: {result.Error.Message}");

        return result.SecureUrl.ToString();
    }

    public async Task DeleteImageAsync(string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            return;

        // Extract public ID from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud}/image/upload/v123/embeleze/products/{id}.ext
        try
        {
            var uri = new Uri(imageUrl);
            var segments = uri.AbsolutePath.Split('/');
            var uploadIndex = Array.IndexOf(segments, "upload");
            if (uploadIndex < 0) return;

            // Join everything after "upload/vXXX/" as the public ID (without extension)
            var publicIdParts = segments.Skip(uploadIndex + 2).ToArray();
            var publicId = string.Join("/", publicIdParts);
            publicId = Path.ChangeExtension(publicId, null); // remove extension

            await _cloudinary.DestroyAsync(new DeletionParams(publicId));
        }
        catch
        {
            // If URL parsing fails, skip deletion
        }
    }
}
