using CafeReservation.Application.Interfaces;
using CafeReservation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace CafeReservation.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _db;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(AppDbContext db) => _db = db;

    public async Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        await _db.SaveChangesAsync(ct);

    public async Task BeginTransactionAsync(CancellationToken ct = default)
    {
        _transaction = await _db.Database.BeginTransactionAsync(ct);
    }

    public async Task BeginTransactionAsync(System.Data.IsolationLevel isolationLevel, CancellationToken ct = default)
    {
        _transaction = await _db.Database.BeginTransactionAsync(isolationLevel, ct);
    }

    public async Task CommitAsync(CancellationToken ct = default)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(ct);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackAsync(CancellationToken ct = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(ct);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public Task ExecuteInTransactionAsync(Func<Task> operation, System.Data.IsolationLevel? isolationLevel = null, CancellationToken ct = default)
    {
        var strategy = _db.Database.CreateExecutionStrategy();
        return strategy.ExecuteAsync(async () =>
        {
            if (isolationLevel.HasValue)
                await BeginTransactionAsync(isolationLevel.Value, ct);
            else
                await BeginTransactionAsync(ct);
                
            try
            {
                await operation();
                await CommitAsync(ct);
            }
            catch
            {
                await RollbackAsync(ct);
                throw;
            }
        });
    }

    public Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> operation, System.Data.IsolationLevel? isolationLevel = null, CancellationToken ct = default)
    {
        var strategy = _db.Database.CreateExecutionStrategy();
        return strategy.ExecuteAsync(async () =>
        {
            if (isolationLevel.HasValue)
                await BeginTransactionAsync(isolationLevel.Value, ct);
            else
                await BeginTransactionAsync(ct);

            try
            {
                var result = await operation();
                await CommitAsync(ct);
                return result;
            }
            catch
            {
                await RollbackAsync(ct);
                throw;
            }
        });
    }
}
