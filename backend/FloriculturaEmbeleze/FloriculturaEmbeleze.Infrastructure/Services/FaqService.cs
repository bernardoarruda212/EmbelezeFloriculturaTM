using FloriculturaEmbeleze.Application.DTOs.Faqs;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using FloriculturaEmbeleze.Domain.Entities;
using FloriculturaEmbeleze.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class FaqService : IFaqService
{
    private readonly AppDbContext _context;

    public FaqService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<FaqDto>> GetActiveFaqsAsync()
    {
        return await _context.Faqs
            .Where(f => f.IsActive)
            .OrderBy(f => f.DisplayOrder)
            .Select(f => new FaqDto
            {
                Id = f.Id,
                Question = f.Question,
                Answer = f.Answer,
                DisplayOrder = f.DisplayOrder,
                IsActive = f.IsActive
            })
            .ToListAsync();
    }

    public async Task<List<FaqDto>> GetAllFaqsAsync()
    {
        return await _context.Faqs
            .OrderBy(f => f.DisplayOrder)
            .Select(f => new FaqDto
            {
                Id = f.Id,
                Question = f.Question,
                Answer = f.Answer,
                DisplayOrder = f.DisplayOrder,
                IsActive = f.IsActive
            })
            .ToListAsync();
    }

    public async Task<FaqDto> CreateFaqAsync(FaqCreateDto dto)
    {
        var maxOrder = await _context.Faqs
            .MaxAsync(f => (int?)f.DisplayOrder) ?? -1;

        var faq = new Faq
        {
            Question = dto.Question,
            Answer = dto.Answer,
            DisplayOrder = maxOrder + 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Faqs.Add(faq);
        await _context.SaveChangesAsync();

        return new FaqDto
        {
            Id = faq.Id,
            Question = faq.Question,
            Answer = faq.Answer,
            DisplayOrder = faq.DisplayOrder,
            IsActive = faq.IsActive
        };
    }

    public async Task<FaqDto> UpdateFaqAsync(Guid id, FaqDto dto)
    {
        var faq = await _context.Faqs.FindAsync(id)
            ?? throw new KeyNotFoundException("FAQ não encontrada.");

        faq.Question = dto.Question;
        faq.Answer = dto.Answer;
        faq.IsActive = dto.IsActive;
        faq.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new FaqDto
        {
            Id = faq.Id,
            Question = faq.Question,
            Answer = faq.Answer,
            DisplayOrder = faq.DisplayOrder,
            IsActive = faq.IsActive
        };
    }

    public async Task DeleteFaqAsync(Guid id)
    {
        var faq = await _context.Faqs.FindAsync(id)
            ?? throw new KeyNotFoundException("FAQ não encontrada.");

        _context.Faqs.Remove(faq);
        await _context.SaveChangesAsync();
    }

    public async Task ReorderFaqsAsync(List<Guid> faqIds)
    {
        var faqs = await _context.Faqs.ToListAsync();

        for (int i = 0; i < faqIds.Count; i++)
        {
            var faq = faqs.FirstOrDefault(f => f.Id == faqIds[i]);
            if (faq != null)
            {
                faq.DisplayOrder = i;
            }
        }

        await _context.SaveChangesAsync();
    }
}
