using FloriculturaEmbeleze.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FloriculturaEmbeleze.Infrastructure.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasIndex(o => o.OrderNumber)
            .IsUnique();

        builder.Property(o => o.CustomerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(o => o.CustomerPhone)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(o => o.CustomerEmail)
            .HasMaxLength(256);

        builder.Property(o => o.DeliveryAddress)
            .HasMaxLength(500);

        builder.Property(o => o.DeliveryNotes)
            .HasMaxLength(1000);

        builder.Property(o => o.TotalAmount)
            .HasPrecision(10, 2);

        builder.Property(o => o.DiscountAmount)
            .HasPrecision(10, 2);

        builder.Property(o => o.Subtotal)
            .HasPrecision(10, 2);

        builder.Property(o => o.Status)
            .IsRequired();

        builder.HasOne(o => o.Customer)
            .WithMany(c => c.Orders)
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(o => o.Coupon)
            .WithMany()
            .HasForeignKey(o => o.CouponId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(o => o.Items)
            .WithOne(oi => oi.Order)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
