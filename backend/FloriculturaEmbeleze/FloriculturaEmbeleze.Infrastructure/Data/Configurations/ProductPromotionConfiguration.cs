using FloriculturaEmbeleze.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FloriculturaEmbeleze.Infrastructure.Data.Configurations;

public class ProductPromotionConfiguration : IEntityTypeConfiguration<ProductPromotion>
{
    public void Configure(EntityTypeBuilder<ProductPromotion> builder)
    {
        builder.ToTable("ProductPromotions");
        builder.HasKey(pp => pp.Id);
        builder.Property(pp => pp.PromotionalPrice).HasPrecision(10, 2);

        builder.HasOne(pp => pp.Product)
            .WithMany(p => p.ProductPromotions)
            .HasForeignKey(pp => pp.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pp => pp.Campaign)
            .WithMany(c => c.ProductPromotions)
            .HasForeignKey(pp => pp.CampaignId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
