using CafeReservation.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CafeReservation.Infrastructure.Persistence.Configurations;

public class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> builder)
    {
        builder.ToTable("reservations");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Id).HasColumnName("id");

        builder.Property(r => r.ReservationCode)
            .HasColumnName("reservation_code")
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(r => r.ReservationCode)
            .IsUnique()
            .HasDatabaseName("ix_reservations_code");

        builder.Property(r => r.GuestName).HasColumnName("guest_name").HasMaxLength(100).IsRequired();
        builder.Property(r => r.GuestEmail).HasColumnName("guest_email").HasMaxLength(200).IsRequired();
        builder.Property(r => r.GuestPhone).HasColumnName("guest_phone").HasMaxLength(20).IsRequired();
        builder.Property(r => r.SeatingAreaId).HasColumnName("seating_area_id");

        builder.Property(r => r.ReservationDate)
            .HasColumnName("reservation_date")
            .IsRequired();

        builder.Property(r => r.StartTime)
            .HasColumnName("start_time")
            .IsRequired();

        builder.Property(r => r.EndTime)
            .HasColumnName("end_time")
            .IsRequired();

        builder.Property(r => r.GuestCount)
            .HasColumnName("guest_count")
            .IsRequired();

        builder.Property(r => r.Status)
            .HasColumnName("status")
            .IsRequired();
            
        builder.Property(r => r.TableName)
            .HasColumnName("table_name")
            .HasMaxLength(50);

        builder.Property(r => r.SpecialNote)
            .HasColumnName("special_note")
            .HasMaxLength(500);

        builder.Property(r => r.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        // Relationships


        builder.HasOne(r => r.SeatingArea)
            .WithMany(s => s.Reservations)
            .HasForeignKey(r => r.SeatingAreaId)
            .OnDelete(DeleteBehavior.Restrict);

        // Composite index for availability queries
        builder.HasIndex(r => new { r.SeatingAreaId, r.ReservationDate, r.Status })
            .HasDatabaseName("ix_reservations_area_date_status");
    }
}
