using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Financial;

namespace FloriculturaEmbeleze.Application.Services.Interfaces;

public interface IFinancialService
{
    Task<FinancialReportDto> GetFinancialReportAsync(DateTime startDate, DateTime endDate);
    Task<PaginatedResultDto<ExpenseListDto>> GetExpensesAsync(ExpenseFilterDto filter);
    Task<ExpenseListDto> CreateExpenseAsync(ExpenseCreateDto dto, Guid? userId);
    Task<ExpenseListDto> UpdateExpenseAsync(Guid id, ExpenseCreateDto dto);
    Task DeleteExpenseAsync(Guid id);
    Task<List<ExpenseCategoryListDto>> GetExpenseCategoriesAsync();
    Task<ExpenseCategoryListDto> CreateExpenseCategoryAsync(ExpenseCategoryCreateDto dto);
    Task<ExpenseCategoryListDto> UpdateExpenseCategoryAsync(Guid id, ExpenseCategoryCreateDto dto);
    Task DeleteExpenseCategoryAsync(Guid id);
    Task ReorderExpenseCategoriesAsync(List<Guid> categoryIds);
}
