using CafeReservation.Application.Interfaces;
using CafeReservation.Domain.Entities;
using CafeReservation.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;

namespace CafeReservation.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    private readonly ICurrentTenantService _tenantService;

    public AppDbContext(
        DbContextOptions<AppDbContext> options,
        ICurrentTenantService tenantService)
        : base(options)
    {
        _tenantService = tenantService;
    }

    // ── DbSets ────────────────────────────────────────────────────────────────
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<SeatingArea> SeatingAreas => Set<SeatingArea>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Feedback> Feedbacks => Set<Feedback>();
    public DbSet<RestaurantInfo> RestaurantInfo => Set<RestaurantInfo>();

    // ── Model Configuration ───────────────────────────────────────────────────
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Entity Configurations
        modelBuilder.ApplyConfiguration(new TenantConfiguration());
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new SeatingAreaConfiguration());
        modelBuilder.ApplyConfiguration(new ReservationConfiguration());
        modelBuilder.ApplyConfiguration(new MenuItemConfiguration());
        modelBuilder.ApplyConfiguration(new ReviewConfiguration());
        modelBuilder.ApplyConfiguration(new FeedbackConfiguration());
        modelBuilder.ApplyConfiguration(new RestaurantInfoConfiguration());

        // ── Global Query Filters (Multi-Tenant) ───────────────────────────────
        // Tham chiếu trực tiếp _tenantService.TenantId (KHÔNG dùng var tenantId = ...)
        // vì EF Core cache model — nếu dùng biến local, giá trị bị đóng băng tại lúc
        // OnModelCreating chạy (= Guid.Empty) và tất cả query sau đều trả về rỗng.
        // Tham chiếu qua field _tenantService đảm bảo gọi lại đúng giá trị mỗi request.

        modelBuilder.Entity<Reservation>()
            .HasQueryFilter(x => x.TenantId == _tenantService.TenantId);

        modelBuilder.Entity<MenuItem>()
            .HasQueryFilter(x => x.TenantId == _tenantService.TenantId);

        modelBuilder.Entity<RestaurantInfo>()
            .HasQueryFilter(x => x.TenantId == _tenantService.TenantId);

        modelBuilder.Entity<Review>()
            .HasQueryFilter(x => x.TenantId == _tenantService.TenantId);

        modelBuilder.Entity<Feedback>()
            .HasQueryFilter(x => x.TenantId == _tenantService.TenantId);

        modelBuilder.Entity<SeatingArea>()
            .HasQueryFilter(x => x.TenantId == _tenantService.TenantId);

        // User: lọc theo TenantId — SuperAdmin (TenantId = null) sẽ không
        // hiển thị qua query thông thường; dùng IgnoreQueryFilters() để access.
        modelBuilder.Entity<User>()
            .HasQueryFilter(x => x.TenantId == _tenantService.TenantId);

    }

    // ── SaveChanges Override: Tự Động Gán TenantId ───────────────────────────
    /// <summary>
    /// Với mọi entity mới được thêm (EntityState.Added), tự động gán TenantId
    /// nếu chưa được set (Guid.Empty). DataSeeder gán tường minh nên sẽ không
    /// bị override ở đây.
    /// </summary>
    public override async Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        AutoAssignTenantId();
        return await base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        AutoAssignTenantId();
        return base.SaveChanges();
    }

    private void AutoAssignTenantId()
    {
        if (!_tenantService.IsResolved) return;

        var tenantId = _tenantService.TenantId;
        if (tenantId == Guid.Empty) return;

        // Reservation
        foreach (var entry in ChangeTracker.Entries<Reservation>()
                     .Where(e => e.State == EntityState.Added && e.Entity.TenantId == Guid.Empty))
            entry.Entity.TenantId = tenantId;

        // MenuItem
        foreach (var entry in ChangeTracker.Entries<MenuItem>()
                     .Where(e => e.State == EntityState.Added && e.Entity.TenantId == Guid.Empty))
            entry.Entity.TenantId = tenantId;

        // RestaurantInfo
        foreach (var entry in ChangeTracker.Entries<RestaurantInfo>()
                     .Where(e => e.State == EntityState.Added && e.Entity.TenantId == Guid.Empty))
            entry.Entity.TenantId = tenantId;

        // Review
        foreach (var entry in ChangeTracker.Entries<Review>()
                     .Where(e => e.State == EntityState.Added && e.Entity.TenantId == Guid.Empty))
            entry.Entity.TenantId = tenantId;

        // Feedback
        foreach (var entry in ChangeTracker.Entries<Feedback>()
                     .Where(e => e.State == EntityState.Added && e.Entity.TenantId == Guid.Empty))
            entry.Entity.TenantId = tenantId;

        // SeatingArea
        foreach (var entry in ChangeTracker.Entries<SeatingArea>()
                     .Where(e => e.State == EntityState.Added && e.Entity.TenantId == Guid.Empty))
            entry.Entity.TenantId = tenantId;

        // User (chỉ auto-assign nếu TenantId chưa set — SuperAdmin sẽ được gán null tường minh)
        foreach (var entry in ChangeTracker.Entries<User>()
                     .Where(e => e.State == EntityState.Added && e.Entity.TenantId == null))
        {
            // Chỉ set nếu không phải SuperAdmin
            if (entry.Entity.Role != Domain.Enums.UserRole.SuperAdmin)
                entry.Entity.TenantId = tenantId;
        }
    }
}
