using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Suppliers;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using FloriculturaEmbeleze.Domain.Entities;
using FloriculturaEmbeleze.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class SupplierService : ISupplierService
{
    private readonly AppDbContext _context;

    public SupplierService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResultDto<SupplierListDto>> GetSuppliersAsync(string? search, bool? isActive, int page = 1, int pageSize = 20)
    {
        var query = _context.Suppliers
            .Include(s => s.ProductSuppliers)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(s => s.Name.ToLower().Contains(searchLower) || (s.ContactPerson != null && s.ContactPerson.ToLower().Contains(searchLower)));
        }

        if (isActive.HasValue)
            query = query.Where(s => s.IsActive == isActive.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new SupplierListDto
            {
                Id = s.Id,
                Name = s.Name,
                ContactPerson = s.ContactPerson,
                Phone = s.Phone,
                Email = s.Email,
                IsActive = s.IsActive,
                ProductCount = s.ProductSuppliers.Count,
                CreatedAt = s.CreatedAt
            })
            .ToListAsync();

        return new PaginatedResultDto<SupplierListDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<SupplierDetailDto?> GetSupplierByIdAsync(Guid id)
    {
        var supplier = await _context.Suppliers
            .Include(s => s.ProductSuppliers)
            .ThenInclude(ps => ps.Product)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (supplier == null) return null;

        return new SupplierDetailDto
        {
            Id = supplier.Id,
            Name = supplier.Name,
            ContactPerson = supplier.ContactPerson,
            Phone = supplier.Phone,
            Email = supplier.Email,
            Address = supplier.Address,
            Notes = supplier.Notes,
            IsActive = supplier.IsActive,
            CreatedAt = supplier.CreatedAt,
            Products = supplier.ProductSuppliers.Select(ps => new SupplierProductDto
            {
                Id = ps.Product.Id,
                Name = ps.Product.Name,
                StockQuantity = ps.Product.StockQuantity
            }).ToList()
        };
    }

    public async Task<SupplierDetailDto> CreateSupplierAsync(SupplierCreateDto dto)
    {
        var supplier = new Supplier
        {
            Name = dto.Name,
            ContactPerson = dto.ContactPerson,
            Phone = dto.Phone,
            Email = dto.Email,
            Address = dto.Address,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        if (dto.ProductIds.Any())
        {
            foreach (var productId in dto.ProductIds)
            {
                supplier.ProductSuppliers.Add(new ProductSupplier
                {
                    ProductId = productId,
                    SupplierId = supplier.Id
                });
            }
        }

        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync();

        return (await GetSupplierByIdAsync(supplier.Id))!;
    }

    public async Task<SupplierDetailDto> UpdateSupplierAsync(Guid id, SupplierCreateDto dto)
    {
        var supplier = await _context.Suppliers
            .Include(s => s.ProductSuppliers)
            .FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new KeyNotFoundException("Fornecedor não encontrado.");

        supplier.Name = dto.Name;
        supplier.ContactPerson = dto.ContactPerson;
        supplier.Phone = dto.Phone;
        supplier.Email = dto.Email;
        supplier.Address = dto.Address;
        supplier.Notes = dto.Notes;
        supplier.UpdatedAt = DateTime.UtcNow;

        // Update product associations
        supplier.ProductSuppliers.Clear();
        foreach (var productId in dto.ProductIds)
        {
            supplier.ProductSuppliers.Add(new ProductSupplier
            {
                ProductId = productId,
                SupplierId = supplier.Id
            });
        }

        await _context.SaveChangesAsync();

        return (await GetSupplierByIdAsync(id))!;
    }

    public async Task DeleteSupplierAsync(Guid id)
    {
        var supplier = await _context.Suppliers.FindAsync(id)
            ?? throw new KeyNotFoundException("Fornecedor não encontrado.");

        _context.Suppliers.Remove(supplier);
        await _context.SaveChangesAsync();
    }

    public async Task ToggleActiveAsync(Guid id)
    {
        var supplier = await _context.Suppliers.FindAsync(id)
            ?? throw new KeyNotFoundException("Fornecedor não encontrado.");

        supplier.IsActive = !supplier.IsActive;
        supplier.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
}
