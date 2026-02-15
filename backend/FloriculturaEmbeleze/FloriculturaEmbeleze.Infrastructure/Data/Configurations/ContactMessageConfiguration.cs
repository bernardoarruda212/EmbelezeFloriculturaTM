using FloriculturaEmbeleze.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FloriculturaEmbeleze.Infrastructure.Data.Configurations;

public class ContactMessageConfiguration : IEntityTypeConfiguration<ContactMessage>
{
    public void Configure(EntityTypeBuilder<ContactMessage> builder)
    {
        builder.ToTable("ContactMessages");

        builder.HasKey(cm => cm.Id);

        builder.Property(cm => cm.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(cm => cm.Phone)
            .HasMaxLength(20);

        builder.Property(cm => cm.Email)
            .HasMaxLength(256);

        builder.Property(cm => cm.Subject)
            .HasMaxLength(200);

        builder.Property(cm => cm.Message)
            .IsRequired();

        builder.Property(cm => cm.CreatedAt)
            .IsRequired();
    }
}
