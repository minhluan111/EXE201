using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CafeReservation.Api.Controllers;

[ApiController]
[Route("api/public/feedbacks")]
public class FeedbackController : ControllerBase
{
    private readonly IFeedbackService _feedbackService;

    public FeedbackController(IFeedbackService feedbackService)
    {
        _feedbackService = feedbackService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateFeedback([FromBody] CreateFeedbackRequest request, CancellationToken ct)
    {
        var feedback = await _feedbackService.CreateFeedbackAsync(request, ct);
        return Ok(feedback);
    }

    [HttpGet]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> GetAllFeedbacks(CancellationToken ct)
    {
        var feedbacks = await _feedbackService.GetAllAsync(ct);
        return Ok(feedbacks);
    }

    [HttpPatch("{id:guid}/reply")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> ReplyFeedback(Guid id, [FromBody] ReplyFeedbackRequest request, CancellationToken ct)
    {
        var feedback = await _feedbackService.ReplyFeedbackAsync(id, request.Reply, ct);
        return Ok(feedback);
    }
}
