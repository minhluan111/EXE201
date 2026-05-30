using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CafeReservation.Api.Controllers;

// Fully public endpoints — no authentication required.
// Used by the customer-facing web UI.
[ApiController]
[Route("api/public")]
[Produces("application/json")]
public class PublicController : ControllerBase
{
    private readonly ISeatingAreaService  _seatingAreaService;
    private readonly IReservationService  _reservationService;

    public PublicController(ISeatingAreaService seatingAreaService, IReservationService reservationService)
    {
        _seatingAreaService = seatingAreaService;
        _reservationService = reservationService;
    }

    //Get all active seating areas
    [HttpGet("seating-areas")]
    [ProducesResponseType(typeof(IReadOnlyList<SeatingAreaResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSeatingAreas(CancellationToken ct)
    {
        var result = await _seatingAreaService.GetAllActiveAsync(ct);
        return Ok(result);
    }

    //Get available time slots for a given date and guest count
    [HttpGet("availability")]
    [ProducesResponseType(typeof(IReadOnlyList<AvailabilityResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> GetAvailability(
        [FromQuery] DateOnly date,
        [FromQuery] int guestCount,
        CancellationToken ct)
    {
        var request = new AvailabilityRequest { Date = date, GuestCount = guestCount };
        var result  = await _reservationService.GetAvailabilityAsync(request, ct);
        return Ok(result);
    }
}
