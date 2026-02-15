using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Customers;
using FloriculturaEmbeleze.Application.Services.Interfaces;

namespace FloriculturaEmbeleze.API.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResultDto<CustomerListDto>>> GetCustomers([FromQuery] CustomerFilterDto filter)
    {
        var result = await _customerService.GetCustomersAsync(filter);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CustomerDetailDto>> GetCustomerById(Guid id)
    {
        var customer = await _customerService.GetCustomerByIdAsync(id);
        if (customer == null) return NotFound();
        return Ok(customer);
    }

    [HttpGet("by-phone/{phone}")]
    public async Task<ActionResult<CustomerDetailDto>> GetCustomerByPhone(string phone)
    {
        var customer = await _customerService.GetCustomerByPhoneAsync(phone);
        if (customer == null) return NotFound();
        return Ok(customer);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDetailDto>> CreateCustomer([FromBody] CustomerCreateDto dto)
    {
        var customer = await _customerService.CreateCustomerAsync(dto);
        return CreatedAtAction(nameof(GetCustomerById), new { id = customer.Id }, customer);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CustomerDetailDto>> UpdateCustomer(Guid id, [FromBody] CustomerUpdateDto dto)
    {
        var customer = await _customerService.UpdateCustomerAsync(id, dto);
        return Ok(customer);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        await _customerService.DeleteCustomerAsync(id);
        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<ActionResult<CustomerStatsDto>> GetStats()
    {
        var stats = await _customerService.GetCustomerStatsAsync();
        return Ok(stats);
    }
}
