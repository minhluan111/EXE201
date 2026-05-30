using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
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
}
