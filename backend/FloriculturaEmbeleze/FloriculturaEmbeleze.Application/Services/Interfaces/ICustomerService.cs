using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Customers;

namespace FloriculturaEmbeleze.Application.Services.Interfaces;

public interface ICustomerService
{
    Task<PaginatedResultDto<CustomerListDto>> GetCustomersAsync(CustomerFilterDto filter);
    Task<CustomerDetailDto?> GetCustomerByIdAsync(Guid id);
    Task<CustomerDetailDto?> GetCustomerByPhoneAsync(string phone);
    Task<CustomerDetailDto> CreateCustomerAsync(CustomerCreateDto dto);
    Task<CustomerDetailDto> UpdateCustomerAsync(Guid id, CustomerUpdateDto dto);
    Task DeleteCustomerAsync(Guid id);
    Task<CustomerStatsDto> GetCustomerStatsAsync();
    Task<Guid> UpsertCustomerFromOrderAsync(string name, string phone, string? email, string? address);
    Task RecalculateCustomerMetricsAsync(Guid customerId);
}
