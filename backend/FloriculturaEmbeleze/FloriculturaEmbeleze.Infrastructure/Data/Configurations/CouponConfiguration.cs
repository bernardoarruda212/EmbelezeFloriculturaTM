using FloriculturaEmbeleze.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FloriculturaEmbeleze.Infrastructure.Data.Configurations;

public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.ToTable("Coupons");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Code).IsRequired().HasMaxLength(50);
        builder.HasIndex(c => c.Code).IsUnique();
        builder.Property(c => c.Description).HasMaxLength(500);
        builder.Property(c => c.DiscountValue).HasPrecision(10, 2);
        builder.Property(c => c.MinOrderAmount).HasPrecision(10, 2);

        builder.HasOne(c => c.Campaign)
            .WithMany(ca => ca.Coupons)
            .HasForeignKey(c => c.CampaignId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
