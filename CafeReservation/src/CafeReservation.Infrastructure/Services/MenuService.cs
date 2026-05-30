using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using CafeReservation.Domain.Enums;
using CafeReservation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CafeReservation.Infrastructure.Services;

public class MenuService : IMenuService
{
    private readonly AppDbContext _db;

    public MenuService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<MenuItemDto>> GetAllAsync(string? category = null, string? tag = null, CancellationToken ct = default)
    {
        var query = _db.MenuItems.AsNoTracking().Where(m => m.IsActive);

        if (!string.IsNullOrEmpty(category) && Enum.TryParse<MenuCategory>(category, true, out var catEnum))
        {
            query = query.Where(m => m.Category == catEnum);
        }

        if (!string.IsNullOrEmpty(tag) && Enum.TryParse<MenuTag>(tag, true, out var tagEnum))
        {
            query = query.Where(m => m.Tag == tagEnum);
        }

        var items = await query.ToListAsync(ct);

        return items.Select(m => new MenuItemDto
        {
            Id = m.Id,
            Name = m.Name,
            Category = m.Category.ToString(),
            ImageUrl = m.ImageUrl,
            Price = m.Price,
            Description = m.Description,
            Tag = m.Tag.ToString(),
            SalesCount = m.SalesCount
        });
    }

    public async Task<MenuItemDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var m = await _db.MenuItems.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && x.IsActive, ct);
        
        if (m == null) return null;

        return new MenuItemDto
        {
            Id = m.Id,
            Name = m.Name,
            Category = m.Category.ToString(),
            ImageUrl = m.ImageUrl,
            Price = m.Price,
            Description = m.Description,
            Tag = m.Tag.ToString(),
            SalesCount = m.SalesCount
        };
    }
}
