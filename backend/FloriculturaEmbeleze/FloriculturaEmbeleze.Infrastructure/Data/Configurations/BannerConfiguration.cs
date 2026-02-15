using FloriculturaEmbeleze.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FloriculturaEmbeleze.Infrastructure.Data.Configurations;

public class BannerConfiguration : IEntityTypeConfiguration<Banner>
{
    public void Configure(EntityTypeBuilder<Banner> builder)
    {
        builder.ToTable("Banners");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.ImageUrl)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(b => b.LinkUrl)
            .HasMaxLength(500);

        builder.Property(b => b.Title)
            .HasMaxLength(200);

        builder.Property(b => b.Description)
            .HasMaxLength(500);

        builder.Property(b => b.CreatedAt)
            .IsRequired();

        builder.HasOne(b => b.Section)
            .WithMany(h => h.Banners)
            .HasForeignKey(b => b.HomePageSectionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
