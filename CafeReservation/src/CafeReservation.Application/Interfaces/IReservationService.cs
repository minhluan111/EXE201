using CafeReservation.Application.DTOs;

namespace CafeReservation.Application.Interfaces;

public interface IReservationService
{
    Task<ReservationResponse> CreateAsync(CreateReservationRequest request, CancellationToken ct = default);
    Task<ReservationResponse> GetByIdAsync(Guid reservationId, CancellationToken ct = default);
    Task<IReadOnlyList<ReservationResponse>> GetMyAsync(string guestEmail, CancellationToken ct = default);
    Task CancelAsync(Guid reservationId, CancellationToken ct = default);
    Task<ReservationResponse> RescheduleAsync(Guid reservationId, RescheduleReservationRequest request, CancellationToken ct = default);
    Task<PagedResult<ReservationResponse>> GetAllAsync(ReservationFilterRequest filter, CancellationToken ct = default);
    Task<IReadOnlyList<AvailabilityResponse>> GetAvailabilityAsync(AvailabilityRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<string>> GetOccupiedTablesAsync(DateOnly date, TimeOnly time, CancellationToken ct = default);
    Task<ReservationResponse> UpdateStatusAsync(Guid reservationId, UpdateReservationStatusRequest request, CancellationToken ct = default);
    Task<DashboardStatsResponse> GetDashboardStatsAsync(CancellationToken ct = default);
}
