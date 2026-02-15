namespace FloriculturaEmbeleze.Application.DTOs.Customers;

public class CustomerStatsDto
{
    public int TotalCustomers { get; set; }
    public int NewCustomers { get; set; }
    public int RegularCustomers { get; set; }
    public int VipCustomers { get; set; }
    public int InactiveCustomers { get; set; }
}
