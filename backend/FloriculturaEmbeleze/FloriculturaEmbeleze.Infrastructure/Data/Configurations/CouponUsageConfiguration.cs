using FloriculturaEmbeleze.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FloriculturaEmbeleze.Infrastructure.Data.Configurations;

public class CouponUsageConfiguration : IEntityTypeConfiguration<CouponUsage>
{
    public void Configure(EntityTypeBuilder<CouponUsage> builder)
    {
        builder.ToTable("CouponUsages");
        builder.HasKey(cu => cu.Id);
        builder.Property(cu => cu.DiscountAmount).HasPrecision(10, 2);

        builder.HasOne(cu => cu.Coupon)
            .WithMany(c => c.Usages)
            .HasForeignKey(cu => cu.CouponId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(cu => cu.Order)
            .WithMany()
            .HasForeignKey(cu => cu.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
