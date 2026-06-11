using CafeReservation.Domain.Entities;

namespace CafeReservation.Application.Interfaces;

public interface ISeatingAreaRepository
{
    Task<SeatingArea?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<SeatingArea?> GetByIdForUpdateAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<SeatingArea>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<SeatingArea>> GetActiveAsync(CancellationToken ct = default);
    Task<IReadOnlyList<SeatingArea>> GetByTableCapacityAsync(int requiredCapacity, CancellationToken ct = default);
    Task AddAsync(SeatingArea area, CancellationToken ct = default);
    Task UpdateAsync(SeatingArea area, CancellationToken ct = default);
    Task DeleteAsync(SeatingArea area, CancellationToken ct = default);
}
