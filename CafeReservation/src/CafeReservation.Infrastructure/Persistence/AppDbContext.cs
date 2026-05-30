using CafeReservation.Domain.Entities;
using CafeReservation.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;

namespace CafeReservation.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<SeatingArea> SeatingAreas => Set<SeatingArea>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Feedback> Feedbacks => Set<Feedback>();
    public DbSet<RestaurantInfo> RestaurantInfo => Set<RestaurantInfo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new SeatingAreaConfiguration());
        modelBuilder.ApplyConfiguration(new ReservationConfiguration());
        modelBuilder.ApplyConfiguration(new MenuItemConfiguration());
        modelBuilder.ApplyConfiguration(new ReviewConfiguration());
        modelBuilder.ApplyConfiguration(new FeedbackConfiguration());
        modelBuilder.ApplyConfiguration(new RestaurantInfoConfiguration());
    }
}
