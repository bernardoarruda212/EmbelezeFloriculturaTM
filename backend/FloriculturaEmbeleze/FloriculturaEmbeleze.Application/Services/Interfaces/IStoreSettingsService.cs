using FloriculturaEmbeleze.Application.DTOs.StoreSettings;

namespace FloriculturaEmbeleze.Application.Services.Interfaces;

public interface IStoreSettingsService
{
    Task<StoreSettingsDto> GetSettingsAsync();
    Task<StoreSettingsDto> UpdateSettingsAsync(StoreSettingsDto dto);
}
