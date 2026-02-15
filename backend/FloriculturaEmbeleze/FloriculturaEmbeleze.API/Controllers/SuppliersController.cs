using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Suppliers;
using FloriculturaEmbeleze.Application.Services.Interfaces;

namespace FloriculturaEmbeleze.API.Controllers;

[ApiController]
[Route("api/suppliers")]
[Authorize]
public class SuppliersController : ControllerBase
{
    private readonly ISupplierService _supplierService;

    public SuppliersController(ISupplierService supplierService)
    {
        _supplierService = supplierService;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResultDto<SupplierListDto>>> GetSuppliers(
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _supplierService.GetSuppliersAsync(search, isActive, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SupplierDetailDto>> GetSupplierById(Guid id)
    {
        var supplier = await _supplierService.GetSupplierByIdAsync(id);
        if (supplier == null) return NotFound();
        return Ok(supplier);
    }

    [HttpPost]
    public async Task<ActionResult<SupplierDetailDto>> CreateSupplier([FromBody] SupplierCreateDto dto)
    {
        var supplier = await _supplierService.CreateSupplierAsync(dto);
        return CreatedAtAction(nameof(GetSupplierById), new { id = supplier.Id }, supplier);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SupplierDetailDto>> UpdateSupplier(Guid id, [FromBody] SupplierCreateDto dto)
    {
        var supplier = await _supplierService.UpdateSupplierAsync(id, dto);
        return Ok(supplier);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteSupplier(Guid id)
    {
        await _supplierService.DeleteSupplierAsync(id);
        return NoContent();
    }

    [HttpPatch("{id:guid}/toggle-active")]
    public async Task<IActionResult> ToggleActive(Guid id)
    {
        await _supplierService.ToggleActiveAsync(id);
        return NoContent();
    }
}
