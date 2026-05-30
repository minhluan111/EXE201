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
    }
}
