using FloriculturaEmbeleze.Application.DTOs.Faqs;

namespace FloriculturaEmbeleze.Application.Services.Interfaces;

public interface IFaqService
{
    Task<List<FaqDto>> GetActiveFaqsAsync();
    Task<List<FaqDto>> GetAllFaqsAsync();
    Task<FaqDto> CreateFaqAsync(FaqCreateDto dto);
    Task<FaqDto> UpdateFaqAsync(Guid id, FaqDto dto);
    Task DeleteFaqAsync(Guid id);
    Task ReorderFaqsAsync(List<Guid> faqIds);
}
