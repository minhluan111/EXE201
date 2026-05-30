using CafeReservation.Application.DTOs;

namespace CafeReservation.Application.Interfaces;

public interface ISeatingAreaService
{
    // Public
    Task<IReadOnlyList<SeatingAreaResponse>> GetAllActiveAsync(CancellationToken ct = default);

    // Admin
    Task<IReadOnlyList<SeatingAreaResponse>> GetAllAsync(CancellationToken ct = default);
    Task<SeatingAreaResponse> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<SeatingAreaResponse> CreateAsync(CreateSeatingAreaRequest request, CancellationToken ct = default);
    Task<SeatingAreaResponse> UpdateAsync(Guid id, UpdateSeatingAreaRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
