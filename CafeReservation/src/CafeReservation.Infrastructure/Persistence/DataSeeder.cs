using CafeReservation.Application.Interfaces;
using CafeReservation.Domain.Constants;
using CafeReservation.Domain.Entities;
using CafeReservation.Domain.Enums;
using CafeReservation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CafeReservation.Infrastructure.Persistence;

public class DataSeeder
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly ILogger<DataSeeder> _logger;

    public DataSeeder(AppDbContext db, IPasswordHasher hasher, ILogger<DataSeeder> logger)
    {
        _db = db;
        _hasher = hasher;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken ct = default)
    {
        await SeedAdminAsync(ct);
        await SeedSeatingAreasAsync(ct);
        await SeedRestaurantInfoAsync(ct);
        await SeedMenuItemsAsync(ct);
        await _db.SaveChangesAsync(ct);
    }

    // Admin account 

    private async Task SeedAdminAsync(CancellationToken ct)
    {
        const string adminEmail = "admin@yakicafe.com";

        if (await _db.Users.AnyAsync(u => u.Email == adminEmail, ct))
            return;

        var admin = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Yaki Café Admin",
            Email = adminEmail,
            Phone = "0900000000",
            PasswordHash = _hasher.Hash("Admin@123"),
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };

        await _db.Users.AddAsync(admin, ct);
        _logger.LogInformation("Seeded admin account: {Email}", adminEmail);
    }

    // Seating areas

    private async Task SeedSeatingAreasAsync(CancellationToken ct)
    {
        if (await _db.SeatingAreas.AnyAsync(ct))
            return;

        var areas = new List<SeatingArea>
        {
            new()
            {
                Id               = Guid.NewGuid(),
                TableType        = AppConstants.TableTypes.Window2Seat,
                Area             = "Window",
                TotalTables      = 6,
                ReservableTables = 5,
                Description      = "Bàn cạnh cửa sổ view đường phố, lãng mạn và yên tĩnh. Phù hợp cho 1–2 người.",
                IsActive         = true
            },
            new()
            {
                Id               = Guid.NewGuid(),
                TableType        = AppConstants.TableTypes.Corner2Seat,
                Area             = "Corner",
                TotalTables      = 4,
                ReservableTables = 4,
                Description      = "Góc khuất riêng tư, ánh sáng ấm cúng. Phù hợp cho các buổi trò chuyện hai người.",
                IsActive         = true
            },
            new()
            {
                Id               = Guid.NewGuid(),
                TableType        = AppConstants.TableTypes.Indoor4Seat,
                Area             = "Indoor",
                TotalTables      = 8,
                ReservableTables = 7,
                Description      = "Khu vực trong nhà có điều hòa, bàn rộng. Phù hợp cho nhóm 3–4 người.",
                IsActive         = true
            },
            new()
            {
                Id               = Guid.NewGuid(),
                TableType        = AppConstants.TableTypes.Outdoor4Seat,
                Area             = "Outdoor",
                TotalTables      = 6,
                ReservableTables = 5,
                Description      = "Khu vực ngoài trời thoáng mát, gần sân vườn. Phù hợp cho nhóm 3–4 người.",
                IsActive         = true
            }
        };

        await _db.SeatingAreas.AddRangeAsync(areas, ct);
        _logger.LogInformation("Seeded {Count} seating areas", areas.Count);
    }

    // Restaurant Info
    private async Task SeedRestaurantInfoAsync(CancellationToken ct)
    {
        if (await _db.RestaurantInfo.AnyAsync(ct))
            return;

        var info = new RestaurantInfo
        {
            Id = Guid.NewGuid(),
            Address = "123 Yaki Street, Coffee District, City",
            Phone = "0900000000",
            OpeningHours = "08:00 - 22:00",
            MapUrl = "https://maps.google.com"
        };

        await _db.RestaurantInfo.AddAsync(info, ct);
        _logger.LogInformation("Seeded restaurant info");
    }

    // Menu Items
    private async Task SeedMenuItemsAsync(CancellationToken ct)
    {
        if (await _db.MenuItems.AnyAsync(ct))
            return;

        var menuItems = new List<MenuItem>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Cà phê sữa đá",
                Category = MenuCategory.Drink,
                Price = 35000,
                Description = "Cà phê pha phin truyền thống với sữa đặc.",
                Tag = MenuTag.BestSeller,
                SalesCount = 150
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Bạc xỉu",
                Category = MenuCategory.Drink,
                Price = 40000,
                Description = "Nhiều sữa hơn cà phê, thơm béo.",
                Tag = MenuTag.Trending,
                SalesCount = 85
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Bánh sừng bò (Croissant)",
                Category = MenuCategory.Snack,
                Price = 45000,
                Description = "Bánh sừng bò nướng bơ Pháp thơm lừng.",
                Tag = MenuTag.Normal,
                SalesCount = 40
            }
        };

        await _db.MenuItems.AddRangeAsync(menuItems, ct);
        _logger.LogInformation("Seeded {Count} menu items", menuItems.Count);
    }
}
