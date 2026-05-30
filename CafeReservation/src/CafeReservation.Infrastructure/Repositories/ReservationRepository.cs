using CafeReservation.Application.Interfaces;
using CafeReservation.Domain.Entities;
using CafeReservation.Domain.Enums;
using CafeReservation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CafeReservation.Infrastructure.Repositories;

public class ReservationRepository : IReservationRepository
{
    private readonly AppDbContext _db;

    public ReservationRepository(AppDbContext db) => _db = db;

    public async Task<Reservation?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _db.Reservations
            .Include(r => r.SeatingArea)
            .FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<IReadOnlyList<Reservation>> GetAllAsync(CancellationToken ct = default) =>
        await _db.Reservations
            .Include(r => r.SeatingArea)
            .OrderByDescending(r => r.ReservationDate)
            .ThenByDescending(r => r.StartTime)
            .ToListAsync(ct);

    public async Task<(IReadOnlyList<Reservation> Items, int Total)> GetFilteredAsync(
        DateOnly? date, string? status, string? search, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _db.Reservations
            .Include(r => r.SeatingArea)
            .AsQueryable();

        if (date.HasValue)
            query = query.Where(r => r.ReservationDate == date.Value);

        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<ReservationStatus>(status, ignoreCase: true, out var parsedStatus))
            query = query.Where(r => r.Status == parsedStatus);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(r =>
                r.ReservationCode.ToLower().Contains(term) ||
                r.GuestName.ToLower().Contains(term) ||
                r.GuestEmail.ToLower().Contains(term));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(r => r.ReservationDate)
            .ThenByDescending(r => r.StartTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    /// <summary>
    /// Count overlapping CONFIRMED reservations using: newStart &lt; existingEnd AND newEnd &gt; existingStart
    /// </summary>
    public async Task<int> CountOverlappingAsync(
        Guid seatingAreaId,
        DateOnly date,
        TimeOnly start,
        TimeOnly end,
        Guid? excludeId = null,
        CancellationToken ct = default)
    {
        var query = _db.Reservations
            .Where(r =>
                r.SeatingAreaId == seatingAreaId &&
                r.ReservationDate == date &&
                r.Status == ReservationStatus.Confirmed &&
                start < r.EndTime &&
                end > r.StartTime);

        if (excludeId.HasValue)
            query = query.Where(r => r.Id != excludeId.Value);

        return await query.CountAsync(ct);
    }

    public Task<int> CountByStatusAsync(ReservationStatus status, CancellationToken ct = default) =>
        _db.Reservations.CountAsync(r => r.Status == status, ct);

    public Task<int> CountTodayAsync(CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return _db.Reservations.CountAsync(r => r.ReservationDate == today, ct);
    }

    public Task<int> CountTotalAsync(CancellationToken ct = default) =>
        _db.Reservations.CountAsync(ct);

    public async Task AddAsync(Reservation reservation, CancellationToken ct = default) =>
        await _db.Reservations.AddAsync(reservation, ct);

    public Task UpdateAsync(Reservation reservation, CancellationToken ct = default)
    {
        _db.Reservations.Update(reservation);
        return Task.CompletedTask;
    }
}
