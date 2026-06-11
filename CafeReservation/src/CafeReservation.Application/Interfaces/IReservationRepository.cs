using CafeReservation.Domain.Entities;
using CafeReservation.Domain.Enums;

namespace CafeReservation.Application.Interfaces;

public interface IReservationRepository
{
    Task<Reservation?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Reservation>> GetByGuestEmailAsync(string guestEmail, CancellationToken ct = default);
    Task<IReadOnlyList<Reservation>> GetAllAsync(CancellationToken ct = default);
    Task<(IReadOnlyList<Reservation> Items, int Total)> GetFilteredAsync(
        DateOnly? date, string? status, string? search, int page, int pageSize, CancellationToken ct = default);
    Task<int> CountOverlappingAsync(Guid seatingAreaId, DateOnly date, TimeOnly start, TimeOnly end, Guid? excludeId = null, CancellationToken ct = default);
    Task<bool> AnyOverlappingTableAsync(string tableName, DateOnly date, TimeOnly start, TimeOnly end, Guid? excludeId = null, CancellationToken ct = default);
    Task<IReadOnlyList<Reservation>> GetOverlappingReservationsAsync(DateOnly date, TimeOnly start, TimeOnly end, CancellationToken ct = default);
    Task<int> CountByStatusAsync(ReservationStatus status, CancellationToken ct = default);
    Task<int> CountTodayAsync(CancellationToken ct = default);
    Task<int> CountTotalAsync(CancellationToken ct = default);
    Task AddAsync(Reservation reservation, CancellationToken ct = default);
    Task UpdateAsync(Reservation reservation, CancellationToken ct = default);
}
