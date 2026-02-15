using FloriculturaEmbeleze.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FloriculturaEmbeleze.Infrastructure.Data.Configurations;

public class ProductVariationConfiguration : IEntityTypeConfiguration<ProductVariation>
{
    public void Configure(EntityTypeBuilder<ProductVariation> builder)
    {
        builder.ToTable("ProductVariations");

        builder.HasKey(pv => pv.Id);

        builder.Property(pv => pv.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(pv => pv.Price)
            .HasPrecision(10, 2);

        builder.HasOne(pv => pv.Product)
            .WithMany(p => p.Variations)
            .HasForeignKey(pv => pv.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
