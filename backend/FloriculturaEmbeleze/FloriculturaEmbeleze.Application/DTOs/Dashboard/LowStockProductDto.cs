namespace FloriculturaEmbeleze.Application.DTOs.Dashboard;

public class LowStockProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
}
