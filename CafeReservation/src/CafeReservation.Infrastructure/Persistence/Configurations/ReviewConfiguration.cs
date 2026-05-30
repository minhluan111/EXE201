using CafeReservation.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CafeReservation.Infrastructure.Persistence.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.GuestName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.GuestEmail).HasMaxLength(200).IsRequired();
        builder.Property(x => x.GuestPhone).HasMaxLength(20).IsRequired();
        
        builder.Property(x => x.Comment).HasMaxLength(1000);
        
        // Rating constraints
        builder.Property(x => x.Rating).IsRequired();
        
        // Relationships
        builder.HasOne(x => x.MenuItem)
            .WithMany(m => m.Reviews)
            .HasForeignKey(x => x.MenuItemId)
            .OnDelete(DeleteBehavior.SetNull); // If menu item deleted, keep review but set menu_id to null
            
        builder.HasIndex(x => x.MenuItemId);
    }
}
