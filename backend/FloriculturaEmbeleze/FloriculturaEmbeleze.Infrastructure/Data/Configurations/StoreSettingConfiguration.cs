using FloriculturaEmbeleze.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FloriculturaEmbeleze.Infrastructure.Data.Configurations;

public class StoreSettingConfiguration : IEntityTypeConfiguration<StoreSetting>
{
    public void Configure(EntityTypeBuilder<StoreSetting> builder)
    {
        builder.ToTable("StoreSettings");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.BusinessName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.WhatsAppNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(s => s.PhoneNumber)
            .HasMaxLength(20);

        builder.Property(s => s.Email)
            .HasMaxLength(256);

        builder.Property(s => s.Address)
            .HasMaxLength(500);

        builder.Property(s => s.City)
            .HasMaxLength(100);

        builder.Property(s => s.State)
            .HasMaxLength(2);

        builder.Property(s => s.ZipCode)
            .HasMaxLength(10);

        builder.Property(s => s.InstagramUrl)
            .HasMaxLength(500);

        builder.Property(s => s.FacebookUrl)
            .HasMaxLength(500);

        builder.Property(s => s.GoogleMapsEmbedUrl)
            .HasMaxLength(1000);
    }
}
