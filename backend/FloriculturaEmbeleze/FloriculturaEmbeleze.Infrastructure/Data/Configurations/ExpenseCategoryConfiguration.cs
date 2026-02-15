using FloriculturaEmbeleze.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FloriculturaEmbeleze.Infrastructure.Data.Configurations;

public class ExpenseCategoryConfiguration : IEntityTypeConfiguration<ExpenseCategory>
{
    public void Configure(EntityTypeBuilder<ExpenseCategory> builder)
    {
        builder.ToTable("ExpenseCategories");
        builder.HasKey(ec => ec.Id);

        builder.Property(ec => ec.Name).IsRequired().HasMaxLength(100);
        builder.Property(ec => ec.ColorHex).HasMaxLength(7);
        builder.Property(ec => ec.IconClass).HasMaxLength(50);

        builder.HasMany(ec => ec.Expenses)
            .WithOne(e => e.Category)
            .HasForeignKey(e => e.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
