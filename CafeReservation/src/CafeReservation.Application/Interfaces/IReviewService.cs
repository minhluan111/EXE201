using CafeReservation.Application.DTOs;

namespace CafeReservation.Application.Interfaces;

public interface IReviewService
{
    Task<IEnumerable<ReviewDto>> GetReviewsAsync(Guid? menuItemId = null, CancellationToken ct = default);
    Task<ReviewDto> CreateReviewAsync(CreateReviewRequest request, CancellationToken ct = default);
}
