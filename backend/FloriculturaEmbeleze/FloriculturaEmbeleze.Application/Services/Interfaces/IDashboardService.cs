using FloriculturaEmbeleze.Application.DTOs.Dashboard;

namespace FloriculturaEmbeleze.Application.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardDataAsync();
    Task<DashboardDto> GetDashboardAsync();
}
