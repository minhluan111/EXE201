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
        await SeedStaffAsync(ct);
        await SeedManagerAsync(ct);
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

    // Staff account

    private async Task SeedStaffAsync(CancellationToken ct)
    {
        const string staffEmail = "staff@yakicafe.com";

        if (await _db.Users.AnyAsync(u => u.Email == staffEmail, ct))
            return;

        var staff = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Yaki Café Staff",
            Email = staffEmail,
            Phone = "0911111111",
            PasswordHash = _hasher.Hash("Staff@123"),
            Role = UserRole.Staff,
            CreatedAt = DateTime.UtcNow
        };

        await _db.Users.AddAsync(staff, ct);
        _logger.LogInformation("Seeded staff account: {Email}", staffEmail);
    }

    // Manager account
    private async Task SeedManagerAsync(CancellationToken ct)
    {
        const string managerEmail = "manager@yakicafe.com";

        if (await _db.Users.AnyAsync(u => u.Email == managerEmail, ct))
            return;

        var manager = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Yaki Café Manager",
            Email = managerEmail,
            Phone = "0922222222",
            PasswordHash = _hasher.Hash("Manager@123"),
            Role = UserRole.Manager,
            CreatedAt = DateTime.UtcNow
        };

        await _db.Users.AddAsync(manager, ct);
        _logger.LogInformation("Seeded manager account: {Email}", managerEmail);
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
        var info = await _db.RestaurantInfo.FirstOrDefaultAsync(ct);
        if (info != null)
        {
            info.Address = "57 Nguyễn Cư Trinh, Thới Bình, Ninh Kiều, Cần Thơ";
            info.Phone = "0945781173";
            info.OpeningHours = "08:00 - 22:00";
            info.MapUrl = "https://maps.google.com/maps?q=Yakishime%20C%E1%BA%A7n%20Th%C6%A1&t=&z=17&ie=UTF8&iwloc=&output=embed";
            _db.RestaurantInfo.Update(info);
            _logger.LogInformation("Updated restaurant info for Yakishime Cần Thơ");
        }
        else
        {
            info = new RestaurantInfo
            {
                Id = Guid.NewGuid(),
                Address = "57 Nguyễn Cư Trinh, Thới Bình, Ninh Kiều, Cần Thơ",
                Phone = "0945781173",
                OpeningHours = "08:00 - 22:00",
                MapUrl = "https://maps.google.com/maps?q=Yakishime%20C%E1%BA%A7n%20Th%C6%A1&t=&z=17&ie=UTF8&iwloc=&output=embed"
            };
            await _db.RestaurantInfo.AddAsync(info, ct);
            _logger.LogInformation("Seeded restaurant info for Yakishime Cần Thơ");
        }
    }

    // Menu Items
    private async Task SeedMenuItemsAsync(CancellationToken ct)
    {
        // Clear old mock menu items if they exist
        var existing = await _db.MenuItems.ToListAsync(ct);
        if (existing.Any(m => m.Name == "Cà phê sữa đá"))
        {
            _db.MenuItems.RemoveRange(existing);
            await _db.SaveChangesAsync(ct);
            existing = await _db.MenuItems.ToListAsync(ct);
        }

        var menuItems = new List<MenuItem>
        {
            new()
            {
                Name = "Matcha Matsu (Premium Ceremonial Matcha)",
                Category = MenuCategory.Drink,
                ImageUrl = "https://imgs.search.brave.com/CBa6zUwbdQumxGeJeb64XvCRYy8S1px8NNVGlGB7-y4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tYXRj/aGFtYXRjaGEubmV0/L2Nkbi9zaG9wL2Zp/bGVzL1VKSU1BVENI/QS5wbmc_dj0xNzc1/MTA3OTkwJndpZHRo/PTE0NDU",
                Price = 95000,
                Description = "Bột Matcha loại lễ hội cao cấp nhất từ Uji, Kyoto. Hương thơm thanh khiết, hậu vị ngọt sâu dịu dàng.",
                Tag = MenuTag.New,
                SalesCount = 120
            },
            new()
            {
                Name = "Matcha Oat Latte",
                Category = MenuCategory.Drink,
                ImageUrl = "https://imgs.search.brave.com/UHX8B3XPAfYOqBcEspKwzMVBB7jeAF0rAAFDy9Q_hhI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93aG9s/ZWZvb2Rzb3VsZm9v/ZGtpdGNoZW4uY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDIy/LzA1L29hdC1taWxr/LW1hdGNoYS1sYXR0/ZS5qcGc",
                Price = 75000,
                Description = "Matcha Uji hảo hạng kết hợp cùng sữa yến mạch béo bùi thanh nhẹ. Thức uống hoàn hảo cho ngày tĩnh lặng.",
                Tag = MenuTag.BestSeller,
                SalesCount = 280
            },
            new()
            {
                Name = "Hojicha Roasted Latte",
                Category = MenuCategory.Drink,
                ImageUrl = "https://imgs.search.brave.com/BsvaTCKK6zQ17LiQi-nng3ZGRwl4kk78Rw5Q29ZsD4o/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9mbHlt/ZXRvdGhldmVnYW5i/dWZmZXQuY29tL3dw/LWNvbnRlbnQvdXBs/b2Fkcy8yMDIzLzAx/L0hvamljaGEtTGF0/dGUtdmVnYW4tMS04/MTl4MTAyNC5qcGc",
                Price = 70000,
                Description = "Trà xanh rang Hojicha thơm nồng hương khói tự nhiên kết hợp sữa tươi, mang lại cảm giác ấm áp dễ chịu.",
                Tag = MenuTag.Trending,
                SalesCount = 160
            },
            new()
            {
                Name = "Mizu Shingen Mochi (Mochi Giọt Nước)",
                Category = MenuCategory.Dessert,
                ImageUrl = "https://imgs.search.brave.com/8FFP7626euFBp8qmJTS4Ogj8p2MjKWf7SdnGEvdWWVY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/cGV0cm90aW1lcy52/bi9zdG9yZXMvbmV3/c19kYXRhaW1hZ2Vz/L2xldGh1dHJhbmcv/MDQyMDIxLzAyLzE5/L2JhbmgtbW9jaGkt/Z2lvdC1udW9jLXN1/LXNhbmctdGFvLWFu/LXRyb25nLXZhbi1o/b2EtYW0tdGh1Yy1u/aGF0LWJhbl80Lmpw/Zz9ydD0yMDIxMDQw/MjE5NTk0Mw",
                Price = 55000,
                Description = "Mochi trong suốt như giọt nước sương mai, ăn kèm với siro đường đen Okinawa và bột đậu nành Kinako thơm bùi.",
                Tag = MenuTag.Normal,
                SalesCount = 90
            },
            new()
            {
                Name = "Warabi Mochi Matcha",
                Category = MenuCategory.Dessert,
                ImageUrl = "https://imgs.search.brave.com/uDAh2tcJm3ZObZMcthTRFrqSfD9ALAz0M7QbGCp8DVA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9qYXBh/bmhhdWwuY29tL2Nk/bi9zaG9wL2ZpbGVz/LzQ1ODA1ODA3NjI2/NTAxX2xhcmdlLmpw/Zz92PTE3NDg1MDY3/NjQ",
                Price = 65000,
                Description = "Mochi dẻo mịn làm từ tinh bột củ sen, phủ ngập lớp bột Matcha xanh ngát và siro mật ong đen ngọt thanh.",
                Tag = MenuTag.BestSeller,
                SalesCount = 210
            },
            new()
            {
                Name = "Zen Uji Parfait",
                Category = MenuCategory.Dessert,
                ImageUrl = "https://imgs.search.brave.com/-mdftk1wdDfIoVeY_lX63gN5L7yV3dPnlk3PG5WyGFU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zb3Jh/bmV3czI0LmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvc2l0ZXMv/My8yMDIwLzA5L01h/dGNoYS1pY2UtY3Jl/YW0taXRvaGt5dWVt/b24tSmFwYW4tcGFy/ZmFpdC1KYXBhbmVz/ZS1zYWt1cmEtZnJ1/aXQtc3dlZXRzLXN1/bW1lci1LeW90by0z/NS5qcGc_dz02NDA",
                Price = 85000,
                Description = "Parfait nhiều tầng xa hoa với kem matcha Uji, thạch Kanten, đậu đỏ ngọt và bánh gạo Shiratama dẻo dai.",
                Tag = MenuTag.Trending,
                SalesCount = 145
            },
            new()
            {
                Name = "Matcha Tiramisu",
                Category = MenuCategory.Dessert,
                ImageUrl = "https://imgs.search.brave.com/dBfX0iXqINMivqIhzfDXsHdHU1gkP_iJB5ZACPcxF20/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/anVzdG9uZWNvb2ti/b29rLmNvbS9zcGFp/L3FfZ2xvc3N5K3Jl/dF9pbWcrdG9fYXV0/by93d3cuanVzdG9u/ZWNvb2tib29rLmNv/bS93cC1jb250ZW50/L3VwbG9hZHMvMjAx/OS8xMS9NYXRjaGEt/VGlyYW1pc3UtNjM3/OS1JLTMuanBn",
                Price = 75000,
                Description = "Bánh Tiramisu Ý được biến tấu đầy tinh tế với các lớp kem phô mai Mascarpone mềm mịn và cốt bánh đẫm hương Matcha Uji.",
                Tag = MenuTag.Normal,
                SalesCount = 95
            }
        };

        foreach (var item in menuItems)
        {
            var dbItem = existing.FirstOrDefault(m => m.Name == item.Name);
            if (dbItem != null)
            {
                dbItem.ImageUrl = item.ImageUrl;
                dbItem.Price = item.Price;
                dbItem.Description = item.Description;
                dbItem.Tag = item.Tag;
                dbItem.Category = item.Category;
                _db.MenuItems.Update(dbItem);
            }
            else
            {
                item.Id = Guid.NewGuid();
                await _db.MenuItems.AddAsync(item, ct);
            }
        }
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Synced {Count} menu items in database", menuItems.Count);
    }
}
