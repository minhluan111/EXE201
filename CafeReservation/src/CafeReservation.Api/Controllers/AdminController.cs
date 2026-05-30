using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using CafeReservation.Infrastructure.Persistence;
using CafeReservation.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CafeReservation.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin,Staff,Manager")]
[Produces("application/json")]
public class AdminController : ControllerBase
{
    private readonly IReservationService _reservationService;
    private readonly ISeatingAreaService _seatingAreaService;
    private readonly AppDbContext _db;

    public AdminController(IReservationService reservationService, ISeatingAreaService seatingAreaService, AppDbContext db)
    {
        _reservationService = reservationService;
        _seatingAreaService = seatingAreaService;
        _db = db;
    }

// Get dashboard statistics (Manager only)
    [HttpGet("stats")]
    [Authorize(Roles = "Manager")]
    [ProducesResponseType(typeof(DashboardStatsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats(CancellationToken ct)
    {
        var result = await _reservationService.GetDashboardStatsAsync(ct);
        return Ok(result);
    }

    // Get all reservations with optional filtering and pagination (Staff & Manager only)
    [HttpGet("reservations")]
    [Authorize(Roles = "Staff,Manager")]
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

    // Cancel any reservation (Staff & Manager only)
    [HttpPatch("reservations/{id:guid}/cancel")]
    [Authorize(Roles = "Staff,Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        await _reservationService.CancelAsync(id, ct);
        return NoContent();
    }

    //Update reservation status — Confirmed, Cancelled, Completed, NoShow (Staff & Manager only)
    [HttpPatch("reservations/{id:guid}/status")]
    [Authorize(Roles = "Staff,Manager")]
    [ProducesResponseType(typeof(ReservationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateReservationStatusRequest request, CancellationToken ct)
    {
        var result = await _reservationService.UpdateStatusAsync(id, request, ct);
        return Ok(result);
    }

    // Seating Areas

    // Get all seating areas including inactive ones (Manager only)
    [HttpGet("seating-areas")]
    [Authorize(Roles = "Manager")]
    [ProducesResponseType(typeof(IReadOnlyList<SeatingAreaResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllSeatingAreas(CancellationToken ct)
    {
        var result = await _seatingAreaService.GetAllAsync(ct);
        return Ok(result);
    }

    // Get a single seating area by id (Manager only)
    [HttpGet("seating-areas/{id:guid}")]
    [Authorize(Roles = "Manager")]
    [ProducesResponseType(typeof(SeatingAreaResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSeatingArea(Guid id, CancellationToken ct)
    {
        var result = await _seatingAreaService.GetByIdAsync(id, ct);
        return Ok(result);
    }

    // Create a new seating area (Manager only)
    [HttpPost("seating-areas")]
    [Authorize(Roles = "Manager")]
    [ProducesResponseType(typeof(SeatingAreaResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> CreateSeatingArea([FromBody] CreateSeatingAreaRequest request, CancellationToken ct)
    {
        var result = await _seatingAreaService.CreateAsync(request, ct);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    // Update a seating area (Manager only)
    [HttpPut("seating-areas/{id:guid}")]
    [Authorize(Roles = "Manager")]
    [ProducesResponseType(typeof(SeatingAreaResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSeatingArea(Guid id, [FromBody] UpdateSeatingAreaRequest request, CancellationToken ct)
    {
        var result = await _seatingAreaService.UpdateAsync(id, request, ct);
        return Ok(result);
    }

    // Deactivate (soft-delete) a seating area (Manager only)
    [HttpDelete("seating-areas/{id:guid}")]
    [Authorize(Roles = "Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSeatingArea(Guid id, CancellationToken ct)
    {
        await _seatingAreaService.DeleteAsync(id, ct);
        return NoContent();
    }

    // User Accounts management (admin only)
    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers(CancellationToken ct)
    {
        var users = await _db.Users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new {
                u.Id,
                u.FullName,
                u.Email,
                u.Phone,
                Role = u.Role.ToString(),
                u.CreatedAt
            })
            .ToListAsync(ct);
        return Ok(users);
    }

    [HttpPatch("users/{id:guid}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleRequest request, CancellationToken ct)
    {
        var user = await _db.Users.FindAsync(new object[] { id }, ct);
        if (user == null) return NotFound();

        if (Enum.TryParse<UserRole>(request.Role, true, out var parsedRole))
        {
            user.Role = parsedRole;
            _db.Users.Update(user);
            await _db.SaveChangesAsync(ct);
            return Ok(new {
                user.Id,
                user.FullName,
                user.Email,
                user.Phone,
                Role = user.Role.ToString(),
                user.CreatedAt
            });
        }
        return BadRequest("Invalid role");
    }

    [HttpDelete("users/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(Guid id, CancellationToken ct)
    {
        var user = await _db.Users.FindAsync(new object[] { id }, ct);
        if (user == null) return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ==========================================
    // MENU CRUD ENDPOINTS (Manager only)
    // ==========================================

    [HttpGet("menu")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> GetAdminMenu(CancellationToken ct)
    {
        var items = await _db.MenuItems
            .OrderBy(m => m.Category)
            .ThenBy(m => m.Name)
            .Select(m => new {
                m.Id,
                m.Name,
                Category = m.Category.ToString(),
                m.ImageUrl,
                m.Price,
                m.Description,
                Tag = m.Tag.ToString(),
                m.SalesCount,
                m.IsActive
            })
            .ToListAsync(ct);
        return Ok(items);
    }

    [HttpPost("menu")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> CreateMenuItem([FromBody] CreateMenuItemAdminRequest request, CancellationToken ct)
    {
        if (!Enum.TryParse<MenuCategory>(request.Category, true, out var category))
            return BadRequest("Invalid category. Must be Drink, MainCourse, Dessert, or Snack.");

        var tag = MenuTag.Normal;
        if (!string.IsNullOrEmpty(request.Tag))
        {
            Enum.TryParse<MenuTag>(request.Tag, true, out tag);
        }

        var menuItem = new CafeReservation.Domain.Entities.MenuItem
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Category = category,
            ImageUrl = request.ImageUrl,
            Price = request.Price,
            Description = request.Description,
            Tag = tag,
            SalesCount = 0,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.MenuItems.Add(menuItem);
        await _db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetAdminMenu), new { id = menuItem.Id }, new {
            menuItem.Id,
            menuItem.Name,
            Category = menuItem.Category.ToString(),
            menuItem.ImageUrl,
            menuItem.Price,
            menuItem.Description,
            Tag = menuItem.Tag.ToString(),
            menuItem.SalesCount,
            menuItem.IsActive
        });
    }

    [HttpPut("menu/{id:guid}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> UpdateMenuItem(Guid id, [FromBody] CreateMenuItemAdminRequest request, CancellationToken ct)
    {
        var item = await _db.MenuItems.FindAsync(new object[] { id }, ct);
        if (item == null) return NotFound();

        if (!Enum.TryParse<MenuCategory>(request.Category, true, out var category))
            return BadRequest("Invalid category.");

        var tag = MenuTag.Normal;
        if (!string.IsNullOrEmpty(request.Tag))
        {
            Enum.TryParse<MenuTag>(request.Tag, true, out tag);
        }

        item.Name = request.Name;
        item.Category = category;
        item.ImageUrl = request.ImageUrl;
        item.Price = request.Price;
        item.Description = request.Description;
        item.Tag = tag;

        _db.MenuItems.Update(item);
        await _db.SaveChangesAsync(ct);

        return Ok(new {
            item.Id,
            item.Name,
            Category = item.Category.ToString(),
            item.ImageUrl,
            item.Price,
            item.Description,
            Tag = item.Tag.ToString(),
            item.SalesCount,
            item.IsActive
        });
    }

    [HttpDelete("menu/{id:guid}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> DeleteMenuItem(Guid id, CancellationToken ct)
    {
        var item = await _db.MenuItems.FindAsync(new object[] { id }, ct);
        if (item == null) return NotFound();

        // Hard delete since we have a database
        _db.MenuItems.Remove(item);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    // ==========================================
    // REVIEWS MANAGEMENT (Manager only)
    // ==========================================

    [HttpGet("reviews")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> GetAdminReviews(CancellationToken ct)
    {
        var reviews = await _db.Reviews
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new {
                r.Id,
                r.GuestName,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                MenuItemId = r.MenuItemId,
                MenuItemName = r.MenuItemId != null ? _db.MenuItems.Where(m => m.Id == r.MenuItemId).Select(m => m.Name).FirstOrDefault() : null
            })
            .ToListAsync(ct);
        return Ok(reviews);
    }
}

public class UpdateUserRoleRequest
{
    public string Role { get; set; } = string.Empty;
}

public class CreateMenuItemAdminRequest
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public string? Tag { get; set; }
}
