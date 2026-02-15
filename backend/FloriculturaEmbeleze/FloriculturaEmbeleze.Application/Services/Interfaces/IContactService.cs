using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Contact;

namespace FloriculturaEmbeleze.Application.Services.Interfaces;

public interface IContactService
{
    Task SendMessageAsync(ContactMessageCreateDto dto);
    Task<PaginatedResultDto<ContactMessageDto>> GetMessagesAsync(int page, int pageSize);
    Task<ContactMessageDto?> GetMessageByIdAsync(Guid id);
    Task MarkAsReadAsync(Guid id);
    Task DeleteMessageAsync(Guid id);
}
