using CafeReservation.Application.DTOs;

namespace CafeReservation.Application.Interfaces;

public interface IFeedbackService
{
    Task<FeedbackDto> CreateFeedbackAsync(CreateFeedbackRequest request, CancellationToken ct = default);
}
