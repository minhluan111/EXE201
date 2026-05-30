using CafeReservation.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CafeReservation.Api.Controllers;

[ApiController]
[Route("api/public/menu")]
public class MenuController : ControllerBase
{
    private readonly IMenuService _menuService;

    public MenuController(IMenuService menuService)
    {
        _menuService = menuService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category, [FromQuery] string? tag, CancellationToken ct)
    {
        var items = await _menuService.GetAllAsync(category, tag, ct);
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var item = await _menuService.GetByIdAsync(id, ct);
        if (item == null) return NotFound();
        return Ok(item);
    }
}
