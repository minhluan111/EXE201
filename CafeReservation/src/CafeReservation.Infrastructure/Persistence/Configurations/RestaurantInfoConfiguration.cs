using CafeReservation.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CafeReservation.Infrastructure.Persistence.Configurations;

public class RestaurantInfoConfiguration : IEntityTypeConfiguration<RestaurantInfo>
{
    public void Configure(EntityTypeBuilder<RestaurantInfo> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Address).HasMaxLength(500).IsRequired();
        builder.Property(x => x.Phone).HasMaxLength(20).IsRequired();
        builder.Property(x => x.OpeningHours).HasMaxLength(200).IsRequired();
        builder.Property(x => x.MapUrl).HasMaxLength(1000);

        builder.Property(x => x.HighRiskThresholdMinutes).HasDefaultValue(60);
        builder.Property(x => x.MediumRiskThresholdMinutes).HasDefaultValue(120);
        builder.Property(x => x.LowRiskThresholdMinutes).HasDefaultValue(180);
    }
}
