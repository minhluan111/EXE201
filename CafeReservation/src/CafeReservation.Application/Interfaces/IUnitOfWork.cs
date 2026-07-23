namespace CafeReservation.Application.Interfaces;

/// <summary>Unit of Work abstraction for flushing changes.</summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
    Task BeginTransactionAsync(CancellationToken ct = default);
    Task CommitAsync(CancellationToken ct = default);
    Task RollbackAsync(CancellationToken ct = default);
    Task ExecuteInTransactionAsync(Func<Task> operation, System.Data.IsolationLevel? isolationLevel = null, CancellationToken ct = default);
    Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> operation, System.Data.IsolationLevel? isolationLevel = null, CancellationToken ct = default);
}
