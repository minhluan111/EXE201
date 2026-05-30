using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using CafeReservation.Domain.Entities;
using CafeReservation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CafeReservation.Infrastructure.Services;

public class ReviewService : IReviewService
{
    private readonly AppDbContext _db;

    public ReviewService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<ReviewDto>> GetReviewsAsync(Guid? menuItemId = null, CancellationToken ct = default)
    {
        var query = _db.Reviews.AsNoTracking().AsQueryable();

        if (menuItemId.HasValue)
        {
            query = query.Where(r => r.MenuItemId == menuItemId.Value);
        }
        else
        {
            query = query.Where(r => r.MenuItemId == null);
        }

        var reviews = await query.OrderByDescending(r => r.CreatedAt).ToListAsync(ct);

        return reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            GuestName = r.GuestName,
            MenuItemId = r.MenuItemId,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt
        });
    }

    public async Task<ReviewDto> CreateReviewAsync(CreateReviewRequest request, CancellationToken ct = default)
    {
        var review = new Review
        {
            Id = Guid.NewGuid(),
            GuestName = request.GuestName,
            GuestEmail = request.GuestEmail,
            GuestPhone = request.GuestPhone,
            MenuItemId = request.MenuItemId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync(ct);

        return new ReviewDto
        {
            Id = review.Id,
            GuestName = review.GuestName,
            MenuItemId = review.MenuItemId,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }
}
