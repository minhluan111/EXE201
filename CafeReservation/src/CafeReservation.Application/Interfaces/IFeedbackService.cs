using CafeReservation.Application.DTOs;

namespace CafeReservation.Application.Interfaces;

public interface IFeedbackService
{
    Task<FeedbackDto> CreateFeedbackAsync(CreateFeedbackRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<FeedbackDto>> GetAllAsync(CancellationToken ct = default);
    Task<FeedbackDto> ReplyFeedbackAsync(Guid id, string reply, CancellationToken ct = default);
    Task<IReadOnlyList<FeedbackDto>> GetMyFeedbacksAsync(string email, CancellationToken ct = default);
}
