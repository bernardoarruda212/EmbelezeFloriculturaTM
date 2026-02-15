using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Contact;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using FloriculturaEmbeleze.Domain.Entities;
using FloriculturaEmbeleze.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class ContactService : IContactService
{
    private readonly AppDbContext _context;

    public ContactService(AppDbContext context)
    {
        _context = context;
    }

    public async Task SendMessageAsync(ContactMessageCreateDto dto)
    {
        var message = new ContactMessage
        {
            Name = dto.Name,
            Phone = dto.Phone,
            Email = dto.Email,
            Subject = dto.Subject,
            Message = dto.Message,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.ContactMessages.Add(message);
        await _context.SaveChangesAsync();
    }

    public async Task<PaginatedResultDto<ContactMessageDto>> GetMessagesAsync(int page, int pageSize)
    {
        var query = _context.ContactMessages
            .OrderByDescending(m => m.CreatedAt);

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new ContactMessageDto
            {
                Id = m.Id,
                Name = m.Name,
                Phone = m.Phone,
                Email = m.Email,
                Subject = m.Subject,
                Message = m.Message,
                IsRead = m.IsRead,
                CreatedAt = m.CreatedAt
            })
            .ToListAsync();

        return new PaginatedResultDto<ContactMessageDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ContactMessageDto?> GetMessageByIdAsync(Guid id)
    {
        return await _context.ContactMessages
            .Where(m => m.Id == id)
            .Select(m => new ContactMessageDto
            {
                Id = m.Id,
                Name = m.Name,
                Phone = m.Phone,
                Email = m.Email,
                Subject = m.Subject,
                Message = m.Message,
                IsRead = m.IsRead,
                CreatedAt = m.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task MarkAsReadAsync(Guid id)
    {
        var message = await _context.ContactMessages.FindAsync(id)
            ?? throw new KeyNotFoundException("Mensagem não encontrada.");

        message.IsRead = true;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteMessageAsync(Guid id)
    {
        var message = await _context.ContactMessages.FindAsync(id)
            ?? throw new KeyNotFoundException("Mensagem não encontrada.");

        _context.ContactMessages.Remove(message);
        await _context.SaveChangesAsync();
    }
}
