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
        await _db.SeatingAreas.FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<SeatingArea?> GetByIdForUpdateAsync(Guid id, CancellationToken ct = default) =>
        await _db.SeatingAreas
            .FromSqlRaw("SELECT * FROM seating_areas WHERE id = {0} FOR UPDATE", id)
            .SingleOrDefaultAsync(ct);

    public async Task<IReadOnlyList<SeatingArea>> GetAllAsync(CancellationToken ct = default) =>
        await _db.SeatingAreas
            .OrderBy(s => s.Area)
            .ThenBy(s => s.TableType)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<SeatingArea>> GetActiveAsync(CancellationToken ct = default) =>
        await _db.SeatingAreas
            .Where(s => s.IsActive)
            .OrderBy(s => s.Area)
            .ThenBy(s => s.TableType)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<SeatingArea>> GetByTableCapacityAsync(int requiredCapacity, CancellationToken ct = default) =>
        await _db.SeatingAreas
            .Where(s => s.IsActive && s.TableType.StartsWith(requiredCapacity.ToString()))
            .ToListAsync(ct);

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
