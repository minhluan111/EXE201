using CafeReservation.Application.Interfaces;
using CafeReservation.Domain.Entities;
using CafeReservation.Domain.Enums;
using CafeReservation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CafeReservation.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db) => _db = db;

    /// <summary>
    /// Tìm user theo Id — dùng query filter bình thường (đã filtered theo tenant).
    /// </summary>
    public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    /// <summary>
    /// Tìm user theo email để login — phải IgnoreQueryFilters() vì:
    /// 1. Auth middleware chạy TRƯỚC khi biết TenantId của user
    /// 2. SuperAdmin có TenantId = null, sẽ không qua được filter thông thường
    /// Sau khi lấy được user, middleware/service tự validate tenant context.
    /// </summary>
    public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        _db.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == email, ct);

    /// <summary>
    /// Tìm user theo reset token — cũng cần IgnoreQueryFilters() vì lúc reset
    /// password không có X-Tenant context bắt buộc.
    /// </summary>
    public Task<User?> GetByResetTokenAsync(string token, CancellationToken ct = default) =>
        _db.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.PasswordResetToken == token, ct);

    public Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default) =>
        _db.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email == email, ct);

    public async Task AddAsync(User user, CancellationToken ct = default) =>
        await _db.Users.AddAsync(user, ct);

    public Task UpdateAsync(User user, CancellationToken ct = default)
    {
        _db.Users.Update(user);
        return Task.CompletedTask;
    }

    public Task<int> CountAsync(CancellationToken ct = default) =>
        _db.Users.CountAsync(ct);
}
