using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using CafeReservation.Domain.Entities;
using CafeReservation.Infrastructure.Persistence;

namespace CafeReservation.Infrastructure.Services;

public class FeedbackService : IFeedbackService
{
    private readonly AppDbContext _db;

    public FeedbackService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<FeedbackDto> CreateFeedbackAsync(CreateFeedbackRequest request, CancellationToken ct = default)
    {
        var feedback = new Feedback
        {
            Id = Guid.NewGuid(),
            GuestName = request.GuestName,
            GuestEmail = request.GuestEmail,
            GuestPhone = request.GuestPhone,
            Title = request.Title,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow
        };

        _db.Feedbacks.Add(feedback);
        await _db.SaveChangesAsync(ct);

        return new FeedbackDto
        {
            Id = feedback.Id,
            GuestName = feedback.GuestName,
            Title = feedback.Title,
            Content = feedback.Content,
            CreatedAt = feedback.CreatedAt
        };
    }
}
