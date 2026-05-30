using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CafeReservation.Api.Controllers;

[ApiController]
[Route("api/reservations")]
[Produces("application/json")]
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _reservationService;

    public ReservationsController(IReservationService reservationService) =>
        _reservationService = reservationService;

    // Create a new reservation.
    [HttpPost]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ReservationResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Create([FromBody] CreateReservationRequest request, CancellationToken ct)
    {
        var result = await _reservationService.CreateAsync(request, ct);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    // Get details of a specific reservation.
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ReservationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _reservationService.GetByIdAsync(id, ct);
        return Ok(result);
    }

    // Cancel a reservation.
    [HttpPatch("{id:guid}/cancel")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        await _reservationService.CancelAsync(id, ct);
        return Ok(new { message = "Reservation has been successfully cancelled." });
    }

    // Reschedule a confirmed reservation.
    [HttpPost("{id:guid}/reschedule")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ReservationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Reschedule(Guid id, [FromBody] RescheduleReservationRequest request, CancellationToken ct)
    {
        var result = await _reservationService.RescheduleAsync(id, request, ct);
        return Ok(result);
    }

}