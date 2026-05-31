using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CafeReservation.Api.Controllers;

[ApiController]
[Route("api/public/reviews")]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet]
    public async Task<IActionResult> GetReviews([FromQuery] Guid? menuItemId, CancellationToken ct)
    {
        var reviews = await _reviewService.GetReviewsAsync(menuItemId, ct);
        return Ok(reviews);
    }

    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request, CancellationToken ct)
    {
        var review = await _reviewService.CreateReviewAsync(request, ct);
        return Ok(review);
    }

    [HttpPatch("{id:guid}/reply")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> ReplyReview(Guid id, [FromBody] ReplyReviewRequest request, CancellationToken ct)
    {
        var review = await _reviewService.ReplyReviewAsync(id, request.Reply, ct);
        return Ok(review);
    }
}
