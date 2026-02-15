using System.Text.Json;
using FloriculturaEmbeleze.Application.DTOs.StoreSettings;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using FloriculturaEmbeleze.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class StoreSettingsService : IStoreSettingsService
{
    private readonly AppDbContext _context;

    public StoreSettingsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<StoreSettingsDto> GetSettingsAsync()
    {
        var settings = await _context.StoreSettings.FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("Configurações da loja não encontradas.");

        return MapToDto(settings);
    }

    public async Task<StoreSettingsDto> UpdateSettingsAsync(StoreSettingsDto dto)
    {
        var settings = await _context.StoreSettings.FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("Configurações da loja não encontradas.");

        settings.BusinessName = dto.BusinessName;
        settings.WhatsAppNumber = dto.WhatsAppNumber;
        settings.PhoneNumber = dto.PhoneNumber;
        settings.Email = dto.Email;
        settings.Address = dto.Address;
        settings.City = dto.City;
        settings.State = dto.State;
        settings.ZipCode = dto.ZipCode;
        settings.AboutContent = dto.AboutContent;
        settings.InstagramUrl = dto.InstagramUrl;
        settings.FacebookUrl = dto.FacebookUrl;
        settings.GoogleMapsEmbedUrl = dto.GoogleMapsEmbedUrl;
        settings.BusinessHoursJson = JsonSerializer.Serialize(dto.BusinessHours);
        settings.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(settings);
    }

    private static StoreSettingsDto MapToDto(Domain.Entities.StoreSetting settings)
    {
        var businessHours = new List<BusinessHoursItemDto>();

        if (!string.IsNullOrWhiteSpace(settings.BusinessHoursJson))
        {
            try
            {
                businessHours = JsonSerializer.Deserialize<List<BusinessHoursItemDto>>(
                    settings.BusinessHoursJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                    ?? new List<BusinessHoursItemDto>();
            }
            catch
            {
                // If deserialization fails, return empty list
            }
        }

        return new StoreSettingsDto
        {
            Id = settings.Id,
            BusinessName = settings.BusinessName,
            WhatsAppNumber = settings.WhatsAppNumber,
            PhoneNumber = settings.PhoneNumber,
            Email = settings.Email,
            Address = settings.Address,
            City = settings.City,
            State = settings.State,
            ZipCode = settings.ZipCode,
            AboutContent = settings.AboutContent,
            InstagramUrl = settings.InstagramUrl,
            FacebookUrl = settings.FacebookUrl,
            GoogleMapsEmbedUrl = settings.GoogleMapsEmbedUrl,
            BusinessHours = businessHours
        };
    }
}
