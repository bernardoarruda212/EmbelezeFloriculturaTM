using FloriculturaEmbeleze.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FloriculturaEmbeleze.Infrastructure.Data.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customers");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name).IsRequired().HasMaxLength(200);
        builder.Property(c => c.Phone).IsRequired().HasMaxLength(20);
        builder.HasIndex(c => c.Phone).IsUnique();
        builder.Property(c => c.Email).HasMaxLength(256);
        builder.Property(c => c.Address).HasMaxLength(500);
        builder.Property(c => c.Notes).HasMaxLength(2000);
        builder.Property(c => c.TotalSpent).HasPrecision(10, 2);
        builder.Property(c => c.Segment).IsRequired();

        builder.HasMany(c => c.Orders)
            .WithOne(o => o.Customer)
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
