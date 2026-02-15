using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Suppliers;

namespace FloriculturaEmbeleze.Application.Services.Interfaces;

public interface ISupplierService
{
    Task<PaginatedResultDto<SupplierListDto>> GetSuppliersAsync(string? search, bool? isActive, int page = 1, int pageSize = 20);
    Task<SupplierDetailDto?> GetSupplierByIdAsync(Guid id);
    Task<SupplierDetailDto> CreateSupplierAsync(SupplierCreateDto dto);
    Task<SupplierDetailDto> UpdateSupplierAsync(Guid id, SupplierCreateDto dto);
    Task DeleteSupplierAsync(Guid id);
    Task ToggleActiveAsync(Guid id);
}
