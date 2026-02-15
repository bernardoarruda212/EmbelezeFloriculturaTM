using FloriculturaEmbeleze.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FloriculturaEmbeleze.Infrastructure.Data.Configurations;

public class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.ToTable("StockMovements");
        builder.HasKey(sm => sm.Id);

        builder.Property(sm => sm.Type).IsRequired();
        builder.Property(sm => sm.Quantity).IsRequired();
        builder.Property(sm => sm.QuantityBefore).IsRequired();
        builder.Property(sm => sm.QuantityAfter).IsRequired();
        builder.Property(sm => sm.Reason).HasMaxLength(500);

        builder.HasOne(sm => sm.Product)
            .WithMany(p => p.StockMovements)
            .HasForeignKey(sm => sm.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(sm => sm.ProductVariation)
            .WithMany()
            .HasForeignKey(sm => sm.ProductVariationId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(sm => sm.Order)
            .WithMany()
            .HasForeignKey(sm => sm.OrderId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
