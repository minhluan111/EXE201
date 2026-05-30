using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CafeReservation.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin,Staff")]
[Produces("application/json")]
public class AdminController : ControllerBase
{
    private readonly IReservationService _reservationService;
    private readonly ISeatingAreaService _seatingAreaService;

    public AdminController(IReservationService reservationService, ISeatingAreaService seatingAreaService)
    {
        _reservationService = reservationService;
        _seatingAreaService = seatingAreaService;
    }

// Get dashboard statistics (admin only)
    [HttpGet("stats")]
    [ProducesResponseType(typeof(DashboardStatsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats(CancellationToken ct)
    {
        var result = await _reservationService.GetDashboardStatsAsync(ct);
        return Ok(result);
    }

    // Get all reservations with optional filtering and pagination (admin only)
    [HttpGet("reservations")]
    [ProducesResponseType(typeof(PagedResult<ReservationResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] DateOnly? date,
        [FromQuery] string?   status,
        [FromQuery] string?   search,
        [FromQuery] int       page     = 1,
        [FromQuery] int       pageSize = 20,
        CancellationToken     ct       = default)
    {
        var filter = new ReservationFilterRequest
        {
            Date     = date,
            Status   = status,
            Search   = search,
            Page     = page,
            PageSize = pageSize
        };
        var result = await _reservationService.GetAllAsync(filter, ct);
        return Ok(result);
    }

    // Cancel any reservation (admin only)
    [HttpPatch("reservations/{id:guid}/cancel")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        await _reservationService.CancelAsync(id, ct);
        return NoContent();
    }

    //Update reservation status — Confirmed, Cancelled, Completed, NoShow (admin only)
    [HttpPatch("reservations/{id:guid}/status")]
    [ProducesResponseType(typeof(ReservationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateReservationStatusRequest request, CancellationToken ct)
    {
        var result = await _reservationService.UpdateStatusAsync(id, request, ct);
        return Ok(result);
    }

    // Seating Areas

    // Get all seating areas including inactive ones (admin only)
    [HttpGet("seating-areas")]
    [ProducesResponseType(typeof(IReadOnlyList<SeatingAreaResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllSeatingAreas(CancellationToken ct)
    {
        var result = await _seatingAreaService.GetAllAsync(ct);
        return Ok(result);
    }

    // Get a single seating area by id (admin only)
    [HttpGet("seating-areas/{id:guid}")]
    [ProducesResponseType(typeof(SeatingAreaResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSeatingArea(Guid id, CancellationToken ct)
    {
        var result = await _seatingAreaService.GetByIdAsync(id, ct);
        return Ok(result);
    }

    // Create a new seating area (admin only)
    [HttpPost("seating-areas")]
    [Authorize(Roles = "Admin")]   // Staff can view but only Admin can create
    [ProducesResponseType(typeof(SeatingAreaResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> CreateSeatingArea([FromBody] CreateSeatingAreaRequest request, CancellationToken ct)
    {
        var result = await _seatingAreaService.CreateAsync(request, ct);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    // Update a seating area (admin only)
    [HttpPut("seating-areas/{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(SeatingAreaResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSeatingArea(Guid id, [FromBody] UpdateSeatingAreaRequest request, CancellationToken ct)
    {
        var result = await _seatingAreaService.UpdateAsync(id, request, ct);
        return Ok(result);
    }

    // Deactivate (soft-delete) a seating area (admin only)
    [HttpDelete("seating-areas/{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSeatingArea(Guid id, CancellationToken ct)
    {
        await _seatingAreaService.DeleteAsync(id, ct);
        return NoContent();
    }
}
