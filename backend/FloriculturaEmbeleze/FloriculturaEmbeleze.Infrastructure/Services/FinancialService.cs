using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Financial;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using FloriculturaEmbeleze.Domain.Entities;
using FloriculturaEmbeleze.Domain.Enums;
using FloriculturaEmbeleze.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class FinancialService : IFinancialService
{
    private readonly AppDbContext _context;

    public FinancialService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<FinancialReportDto> GetFinancialReportAsync(DateTime startDate, DateTime endDate)
    {
        var orders = await _context.Orders
            .Where(o => o.Status != OrderStatus.Cancelado && o.CreatedAt >= startDate && o.CreatedAt <= endDate)
            .ToListAsync();

        var expenses = await _context.Expenses
            .Include(e => e.Category)
            .Where(e => e.ExpenseDate >= startDate && e.ExpenseDate <= endDate)
            .ToListAsync();

        var totalRevenue = orders.Sum(o => o.TotalAmount);
        var totalExpenses = expenses.Sum(e => e.Amount);
        var totalOrders = orders.Count;

        var revenueByDay = orders
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new RevenueByDayDto
            {
                Date = g.Key,
                Revenue = g.Sum(o => o.TotalAmount),
                OrderCount = g.Count()
            })
            .OrderBy(r => r.Date)
            .ToList();

        var expensesByCategory = expenses
            .GroupBy(e => new { e.CategoryId, e.Category.Name, e.Category.ColorHex })
            .Select(g => new CategoryExpenseDto
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.Name,
                ColorHex = g.Key.ColorHex,
                TotalAmount = g.Sum(e => e.Amount),
                Count = g.Count()
            })
            .OrderByDescending(c => c.TotalAmount)
            .ToList();

        var topProducts = await _context.OrderItems
            .Where(oi => oi.Order.Status != OrderStatus.Cancelado && oi.Order.CreatedAt >= startDate && oi.Order.CreatedAt <= endDate)
            .GroupBy(oi => new { oi.ProductId, oi.ProductName })
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.ProductName,
                QuantitySold = g.Sum(oi => oi.Quantity),
                TotalRevenue = g.Sum(oi => oi.Subtotal)
            })
            .OrderByDescending(t => t.TotalRevenue)
            .Take(10)
            .ToListAsync();

        return new FinancialReportDto
        {
            TotalRevenue = totalRevenue,
            TotalExpenses = totalExpenses,
            NetProfit = totalRevenue - totalExpenses,
            AverageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0,
            TotalOrders = totalOrders,
            RevenueByDay = revenueByDay,
            ExpensesByCategory = expensesByCategory,
            TopProducts = topProducts
        };
    }

    public async Task<PaginatedResultDto<ExpenseListDto>> GetExpensesAsync(ExpenseFilterDto filter)
    {
        var query = _context.Expenses.Include(e => e.Category).AsQueryable();

        if (filter.CategoryId.HasValue)
            query = query.Where(e => e.CategoryId == filter.CategoryId.Value);

        if (filter.DateFrom.HasValue)
            query = query.Where(e => e.ExpenseDate >= filter.DateFrom.Value);

        if (filter.DateTo.HasValue)
            query = query.Where(e => e.ExpenseDate <= filter.DateTo.Value);

        if (filter.IsRecurring.HasValue)
            query = query.Where(e => e.IsRecurring == filter.IsRecurring.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(e => e.ExpenseDate)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(e => new ExpenseListDto
            {
                Id = e.Id,
                CategoryId = e.CategoryId,
                CategoryName = e.Category.Name,
                CategoryColor = e.Category.ColorHex,
                Amount = e.Amount,
                Description = e.Description,
                ExpenseDate = e.ExpenseDate,
                IsRecurring = e.IsRecurring,
                RecurrenceInterval = e.RecurrenceInterval,
                CreatedAt = e.CreatedAt
            })
            .ToListAsync();

        return new PaginatedResultDto<ExpenseListDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<ExpenseListDto> CreateExpenseAsync(ExpenseCreateDto dto, Guid? userId)
    {
        var category = await _context.ExpenseCategories.FindAsync(dto.CategoryId)
            ?? throw new KeyNotFoundException("Categoria de despesa não encontrada.");

        var expense = new Expense
        {
            CategoryId = dto.CategoryId,
            Amount = dto.Amount,
            Description = dto.Description,
            ExpenseDate = dto.ExpenseDate,
            IsRecurring = dto.IsRecurring,
            RecurrenceInterval = dto.RecurrenceInterval,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        return new ExpenseListDto
        {
            Id = expense.Id,
            CategoryId = expense.CategoryId,
            CategoryName = category.Name,
            CategoryColor = category.ColorHex,
            Amount = expense.Amount,
            Description = expense.Description,
            ExpenseDate = expense.ExpenseDate,
            IsRecurring = expense.IsRecurring,
            RecurrenceInterval = expense.RecurrenceInterval,
            CreatedAt = expense.CreatedAt
        };
    }

    public async Task<ExpenseListDto> UpdateExpenseAsync(Guid id, ExpenseCreateDto dto)
    {
        var expense = await _context.Expenses.Include(e => e.Category).FirstOrDefaultAsync(e => e.Id == id)
            ?? throw new KeyNotFoundException("Despesa não encontrada.");

        var category = await _context.ExpenseCategories.FindAsync(dto.CategoryId)
            ?? throw new KeyNotFoundException("Categoria de despesa não encontrada.");

        expense.CategoryId = dto.CategoryId;
        expense.Amount = dto.Amount;
        expense.Description = dto.Description;
        expense.ExpenseDate = dto.ExpenseDate;
        expense.IsRecurring = dto.IsRecurring;
        expense.RecurrenceInterval = dto.RecurrenceInterval;
        expense.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ExpenseListDto
        {
            Id = expense.Id,
            CategoryId = expense.CategoryId,
            CategoryName = category.Name,
            CategoryColor = category.ColorHex,
            Amount = expense.Amount,
            Description = expense.Description,
            ExpenseDate = expense.ExpenseDate,
            IsRecurring = expense.IsRecurring,
            RecurrenceInterval = expense.RecurrenceInterval,
            CreatedAt = expense.CreatedAt
        };
    }

    public async Task DeleteExpenseAsync(Guid id)
    {
        var expense = await _context.Expenses.FindAsync(id)
            ?? throw new KeyNotFoundException("Despesa não encontrada.");

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();
    }

    public async Task<List<ExpenseCategoryListDto>> GetExpenseCategoriesAsync()
    {
        return await _context.ExpenseCategories
            .OrderBy(ec => ec.DisplayOrder)
            .Select(ec => new ExpenseCategoryListDto
            {
                Id = ec.Id,
                Name = ec.Name,
                ColorHex = ec.ColorHex,
                IconClass = ec.IconClass,
                DisplayOrder = ec.DisplayOrder,
                IsActive = ec.IsActive,
                ExpenseCount = ec.Expenses.Count,
                TotalAmount = ec.Expenses.Sum(e => e.Amount)
            })
            .ToListAsync();
    }

    public async Task<ExpenseCategoryListDto> CreateExpenseCategoryAsync(ExpenseCategoryCreateDto dto)
    {
        var category = new ExpenseCategory
        {
            Name = dto.Name,
            ColorHex = dto.ColorHex,
            IconClass = dto.IconClass,
            DisplayOrder = dto.DisplayOrder,
            CreatedAt = DateTime.UtcNow
        };

        _context.ExpenseCategories.Add(category);
        await _context.SaveChangesAsync();

        return new ExpenseCategoryListDto
        {
            Id = category.Id,
            Name = category.Name,
            ColorHex = category.ColorHex,
            IconClass = category.IconClass,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
            ExpenseCount = 0,
            TotalAmount = 0
        };
    }

    public async Task<ExpenseCategoryListDto> UpdateExpenseCategoryAsync(Guid id, ExpenseCategoryCreateDto dto)
    {
        var category = await _context.ExpenseCategories
            .Include(ec => ec.Expenses)
            .FirstOrDefaultAsync(ec => ec.Id == id)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        category.Name = dto.Name;
        category.ColorHex = dto.ColorHex;
        category.IconClass = dto.IconClass;
        category.DisplayOrder = dto.DisplayOrder;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ExpenseCategoryListDto
        {
            Id = category.Id,
            Name = category.Name,
            ColorHex = category.ColorHex,
            IconClass = category.IconClass,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
            ExpenseCount = category.Expenses.Count,
            TotalAmount = category.Expenses.Sum(e => e.Amount)
        };
    }

    public async Task DeleteExpenseCategoryAsync(Guid id)
    {
        var category = await _context.ExpenseCategories
            .Include(ec => ec.Expenses)
            .FirstOrDefaultAsync(ec => ec.Id == id)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        if (category.Expenses.Any())
            throw new InvalidOperationException("Não é possível excluir categoria com despesas vinculadas.");

        _context.ExpenseCategories.Remove(category);
        await _context.SaveChangesAsync();
    }

    public async Task ReorderExpenseCategoriesAsync(List<Guid> categoryIds)
    {
        for (int i = 0; i < categoryIds.Count; i++)
        {
            var category = await _context.ExpenseCategories.FindAsync(categoryIds[i]);
            if (category != null)
            {
                category.DisplayOrder = i;
            }
        }
        await _context.SaveChangesAsync();
    }
}
