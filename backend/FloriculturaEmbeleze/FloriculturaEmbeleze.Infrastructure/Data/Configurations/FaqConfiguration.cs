using FloriculturaEmbeleze.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FloriculturaEmbeleze.Infrastructure.Data.Configurations;

public class FaqConfiguration : IEntityTypeConfiguration<Faq>
{
    public void Configure(EntityTypeBuilder<Faq> builder)
    {
        builder.ToTable("Faqs");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.Question)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(f => f.Answer)
            .IsRequired();

        builder.Property(f => f.IsActive)
            .IsRequired();
    }
}
