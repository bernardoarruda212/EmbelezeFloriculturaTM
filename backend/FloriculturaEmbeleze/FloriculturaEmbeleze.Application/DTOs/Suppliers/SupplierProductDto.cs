namespace FloriculturaEmbeleze.Application.DTOs.Suppliers;

public class SupplierProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
}
