using CafeReservation.Application.Interfaces;
using CafeReservation.Domain.Entities;
using CafeReservation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CafeReservation.Infrastructure.Repositories;

public class SeatingAreaRepository : ISeatingAreaRepository
{
    private readonly AppDbContext _db;

    public SeatingAreaRepository(AppDbContext db) => _db = db;

    public async Task<SeatingArea?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _db.SeatingAreas
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<SeatingArea?> GetByIdForUpdateAsync(Guid id, CancellationToken ct = default) =>
        await _db.SeatingAreas
            .FromSqlRaw("SELECT * FROM seating_areas WHERE id = {0} FOR UPDATE", id)
            .SingleOrDefaultAsync(ct);

    public async Task<IReadOnlyList<SeatingArea>> GetAllAsync(CancellationToken ct = default) =>
        await _db.SeatingAreas
            .AsNoTracking()
            .OrderBy(s => s.Area)
            .ThenBy(s => s.TableType)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<SeatingArea>> GetActiveAsync(CancellationToken ct = default) =>
        await _db.SeatingAreas
            .AsNoTracking()
            .Where(s => s.IsActive)
            .OrderBy(s => s.Area)
            .ThenBy(s => s.TableType)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<SeatingArea>> GetByTableCapacityAsync(int requiredCapacity, CancellationToken ct = default)
    {
        var activeAreas = await _db.SeatingAreas
            .AsNoTracking()
            .Where(s => s.IsActive)
            .ToListAsync(ct);

        return activeAreas
            .Where(s => {
                var capacity = ParseCapacity(s.TableType);
                if (requiredCapacity == 2)
                {
                    return capacity >= 1 && capacity <= 3;
                }
                else
                {
                    return capacity >= 4;
                }
            })
            .ToList();
    }

    private static int ParseCapacity(string tableType)
    {
        if (string.IsNullOrWhiteSpace(tableType)) return 2;
        
        var matchSeat = System.Text.RegularExpressions.Regex.Match(tableType, @"^(\d+)-Seat", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        if (matchSeat.Success)
        {
            return int.Parse(matchSeat.Groups[1].Value);
        }
        
        var matchNguoi = System.Text.RegularExpressions.Regex.Match(tableType, @"Bàn\s+(?:lớn\s+)?(\d+)\s+người", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        if (matchNguoi.Success)
        {
            return int.Parse(matchNguoi.Groups[1].Value);
        }
        
        var matchDigits = System.Text.RegularExpressions.Regex.Match(tableType, @"(\d+)");
        if (matchDigits.Success)
        {
            return int.Parse(matchDigits.Value);
        }
        
        return 2;
    }

    public async Task AddAsync(SeatingArea area, CancellationToken ct = default) =>
        await _db.SeatingAreas.AddAsync(area, ct);

    public Task UpdateAsync(SeatingArea area, CancellationToken ct = default)
    {
        _db.SeatingAreas.Update(area);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(SeatingArea area, CancellationToken ct = default)
    {
        _db.SeatingAreas.Remove(area);
        return Task.CompletedTask;
    }
}
