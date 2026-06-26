using CafeReservation.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CafeReservation.Infrastructure.Persistence.Configurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("tenants");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasColumnName("id");

        builder.Property(t => t.Name)
            .HasColumnName("name")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(t => t.Domain)
            .HasColumnName("domain")
            .HasMaxLength(253)   // RFC max domain length
            .IsRequired();

        // Domain phải là unique — mỗi nhà hàng có domain riêng
        builder.HasIndex(t => t.Domain)
            .IsUnique()
            .HasDatabaseName("ix_tenants_domain");

        builder.Property(t => t.Logo)
            .HasColumnName("logo")
            .HasMaxLength(500);

        builder.Property(t => t.ThemeColor)
            .HasColumnName("theme_color")
            .HasMaxLength(20);

        builder.Property(t => t.Active)
            .HasColumnName("active")
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(t => t.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();
    }
}
