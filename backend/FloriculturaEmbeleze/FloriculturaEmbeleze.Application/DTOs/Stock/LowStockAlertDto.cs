namespace FloriculturaEmbeleze.Application.DTOs.Stock;

public class LowStockAlertDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int Threshold { get; set; }
    public bool HasVariations { get; set; }
}
