using CafeReservation.Application.DTOs;

namespace CafeReservation.Application.Interfaces;

public interface IMenuService
{
    Task<IEnumerable<MenuItemDto>> GetAllAsync(string? category = null, string? tag = null, CancellationToken ct = default);
    Task<MenuItemDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
}
