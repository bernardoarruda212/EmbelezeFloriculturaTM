using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Stock;

namespace FloriculturaEmbeleze.Application.Services.Interfaces;

public interface IStockService
{
    Task<PaginatedResultDto<StockMovementListDto>> GetStockMovementsAsync(StockMovementFilterDto filter);
    Task<StockMovementListDto> CreateStockMovementAsync(StockMovementCreateDto dto, Guid? userId);
    Task DeductStockForOrderAsync(Guid orderId, Guid? userId);
    Task RestoreStockForOrderAsync(Guid orderId, Guid? userId);
    Task<List<LowStockAlertDto>> GetLowStockAlertsAsync(int threshold = 5);
}
