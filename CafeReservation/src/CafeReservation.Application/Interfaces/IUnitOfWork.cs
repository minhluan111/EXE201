namespace CafeReservation.Application.Interfaces;

/// <summary>Unit of Work abstraction for flushing changes.</summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
