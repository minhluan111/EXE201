using CafeReservation.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CafeReservation.Infrastructure.Persistence.Configurations;

public class SeatingAreaConfiguration : IEntityTypeConfiguration<SeatingArea>
{
    public void Configure(EntityTypeBuilder<SeatingArea> builder)
    {
        builder.ToTable("seating_areas");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id).HasColumnName("id");

        builder.Property(s => s.TableType)
            .HasColumnName("table_type")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(s => s.Area)
            .HasColumnName("area")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(s => s.TotalTables)
            .HasColumnName("total_tables")
            .IsRequired();

        builder.Property(s => s.ReservableTables)
            .HasColumnName("reservable_tables")
            .IsRequired();

        builder.Property(s => s.PreviewImage)
            .HasColumnName("preview_image")
            .HasMaxLength(500);

        builder.Property(s => s.Description)
            .HasColumnName("description")
            .HasMaxLength(1000);

        builder.Property(s => s.IsActive)
            .HasColumnName("is_active")
            .IsRequired()
            .HasDefaultValue(true);

        // ── Indexes ──────────────────────────────────────────────────────────
        // Tất cả query đều filter theo tenant_id (global query filter).
        // Index đơn trên tenant_id phục vụ GetAllAsync.
        builder.HasIndex(s => s.TenantId)
            .HasDatabaseName("ix_seating_areas_tenant_id");

        // Index tổng hợp (tenant_id, is_active) phục vụ GetActiveAsync —
        // query phổ biến nhất từ public endpoint /api/public/seating-areas.
        builder.HasIndex(s => new { s.TenantId, s.IsActive })
            .HasDatabaseName("ix_seating_areas_tenant_active");

        // Index tổng hợp cho trường hợp tìm kiếm chi tiết theo (tenant_id, area, table_type)
        builder.HasIndex(s => new { s.TenantId, s.Area, s.TableType })
            .HasDatabaseName("ix_seating_areas_tenant_area_type");
    }
}
