using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Orders;

namespace FloriculturaEmbeleze.Application.Services.Interfaces;

public interface IOrderService
{
    Task<OrderDetailDto> CreateOrderAsync(OrderCreateDto dto);
    Task<PaginatedResultDto<OrderListDto>> GetOrdersAsync(
        string? status,
        string? search,
        DateTime? dateFrom,
        DateTime? dateTo,
        int page,
        int pageSize);
    Task<OrderDetailDto?> GetOrderByIdAsync(Guid id);
    Task UpdateOrderStatusAsync(Guid id, OrderStatusUpdateDto dto);
    Task<OrderStatsDto> GetOrderStatsAsync();
}
