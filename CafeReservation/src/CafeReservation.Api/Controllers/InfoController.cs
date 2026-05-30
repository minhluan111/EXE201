using CafeReservation.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CafeReservation.Api.Controllers;

[ApiController]
[Route("api/public/restaurant-info")]
public class InfoController : ControllerBase
{
    private readonly IInfoService _infoService;

    public InfoController(IInfoService infoService)
    {
        _infoService = infoService;
    }

    [HttpGet]
    public async Task<IActionResult> GetInfo(CancellationToken ct)
    {
        var info = await _infoService.GetRestaurantInfoAsync(ct);
        if (info == null) return NotFound();
        return Ok(info);
    }
}
