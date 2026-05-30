using CafeReservation.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CafeReservation.Infrastructure.Persistence.Configurations;

public class FeedbackConfiguration : IEntityTypeConfiguration<Feedback>
{
    public void Configure(EntityTypeBuilder<Feedback> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.GuestName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.GuestEmail).HasMaxLength(200).IsRequired();
        builder.Property(x => x.GuestPhone).HasMaxLength(20).IsRequired();
        
        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Content).HasMaxLength(2000).IsRequired();
    }
}
