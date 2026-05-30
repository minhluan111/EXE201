using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using CafeReservation.Domain.Entities;
using CafeReservation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

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
            Reply = feedback.Reply,
            ReplyAt = feedback.ReplyAt,
            CreatedAt = feedback.CreatedAt
        };
    }

    public async Task<IReadOnlyList<FeedbackDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.Feedbacks
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new FeedbackDto
            {
                Id = f.Id,
                GuestName = f.GuestName,
                Title = f.Title,
                Content = f.Content,
                Reply = f.Reply,
                ReplyAt = f.ReplyAt,
                CreatedAt = f.CreatedAt
            })
            .ToListAsync(ct);
    }

    public async Task<FeedbackDto> ReplyFeedbackAsync(Guid id, string reply, CancellationToken ct = default)
    {
        var feedback = await _db.Feedbacks.FindAsync(new object[] { id }, ct)
            ?? throw new KeyNotFoundException($"Feedback with ID '{id}' not found.");

        feedback.Reply = reply;
        feedback.ReplyAt = DateTime.UtcNow;

        _db.Feedbacks.Update(feedback);
        await _db.SaveChangesAsync(ct);

        return new FeedbackDto
        {
            Id = feedback.Id,
            GuestName = feedback.GuestName,
            Title = feedback.Title,
            Content = feedback.Content,
            Reply = feedback.Reply,
            ReplyAt = feedback.ReplyAt,
            CreatedAt = feedback.CreatedAt
        };
    }
}
