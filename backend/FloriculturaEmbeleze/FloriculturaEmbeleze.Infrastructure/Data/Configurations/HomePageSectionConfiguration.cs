using FloriculturaEmbeleze.Domain.Entities;
using FloriculturaEmbeleze.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FloriculturaEmbeleze.Infrastructure.Data.Configurations;

public class HomePageSectionConfiguration : IEntityTypeConfiguration<HomePageSection>
{
    public void Configure(EntityTypeBuilder<HomePageSection> builder)
    {
        builder.ToTable("HomePageSections");

        builder.HasKey(h => h.Id);

        builder.Property(h => h.SectionType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(h => h.Title)
            .HasMaxLength(200);

        builder.Property(h => h.Subtitle)
            .HasMaxLength(500);

        builder.Property(h => h.IsVisible)
            .IsRequired();

        builder.HasMany(h => h.Banners)
            .WithOne(b => b.Section)
            .HasForeignKey(b => b.HomePageSectionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
