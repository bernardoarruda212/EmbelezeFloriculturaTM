using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Financial;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using System.Security.Claims;

namespace FloriculturaEmbeleze.API.Controllers;

[ApiController]
[Route("api/financial")]
[Authorize]
public class FinancialController : ControllerBase
{
    private readonly IFinancialService _financialService;

    public FinancialController(IFinancialService financialService)
    {
        _financialService = financialService;
    }

    [HttpGet("report")]
    public async Task<ActionResult<FinancialReportDto>> GetReport([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var report = await _financialService.GetFinancialReportAsync(startDate, endDate);
        return Ok(report);
    }

    [HttpGet("expenses")]
    public async Task<ActionResult<PaginatedResultDto<ExpenseListDto>>> GetExpenses([FromQuery] ExpenseFilterDto filter)
    {
        var result = await _financialService.GetExpensesAsync(filter);
        return Ok(result);
    }

    [HttpPost("expenses")]
    public async Task<ActionResult<ExpenseListDto>> CreateExpense([FromBody] ExpenseCreateDto dto)
    {
        var userId = Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : (Guid?)null;
        var expense = await _financialService.CreateExpenseAsync(dto, userId);
        return CreatedAtAction(nameof(GetExpenses), expense);
    }

    [HttpPut("expenses/{id:guid}")]
    public async Task<ActionResult<ExpenseListDto>> UpdateExpense(Guid id, [FromBody] ExpenseCreateDto dto)
    {
        var expense = await _financialService.UpdateExpenseAsync(id, dto);
        return Ok(expense);
    }

    [HttpDelete("expenses/{id:guid}")]
    public async Task<IActionResult> DeleteExpense(Guid id)
    {
        await _financialService.DeleteExpenseAsync(id);
        return NoContent();
    }

    [HttpGet("expense-categories")]
    public async Task<ActionResult<List<ExpenseCategoryListDto>>> GetExpenseCategories()
    {
        var categories = await _financialService.GetExpenseCategoriesAsync();
        return Ok(categories);
    }

    [HttpPost("expense-categories")]
    public async Task<ActionResult<ExpenseCategoryListDto>> CreateExpenseCategory([FromBody] ExpenseCategoryCreateDto dto)
    {
        var category = await _financialService.CreateExpenseCategoryAsync(dto);
        return CreatedAtAction(nameof(GetExpenseCategories), category);
    }

    [HttpPut("expense-categories/{id:guid}")]
    public async Task<ActionResult<ExpenseCategoryListDto>> UpdateExpenseCategory(Guid id, [FromBody] ExpenseCategoryCreateDto dto)
    {
        var category = await _financialService.UpdateExpenseCategoryAsync(id, dto);
        return Ok(category);
    }

    [HttpDelete("expense-categories/{id:guid}")]
    public async Task<IActionResult> DeleteExpenseCategory(Guid id)
    {
        await _financialService.DeleteExpenseCategoryAsync(id);
        return NoContent();
    }

    [HttpPut("expense-categories/reorder")]
    public async Task<IActionResult> ReorderExpenseCategories([FromBody] List<Guid> categoryIds)
    {
        await _financialService.ReorderExpenseCategoriesAsync(categoryIds);
        return NoContent();
    }
}
