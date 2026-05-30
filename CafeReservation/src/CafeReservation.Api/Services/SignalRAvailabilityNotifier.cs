using CafeReservation.Api.Hubs;
using CafeReservation.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace CafeReservation.Api.Services;

public class SignalRAvailabilityNotifier : IAvailabilityNotifier
{
    private readonly IHubContext<AvailabilityHub> _hubContext;

    public SignalRAvailabilityNotifier(IHubContext<AvailabilityHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyAvailabilityChangedAsync(CancellationToken ct = default)
    {
        await _hubContext.Clients.All.SendAsync("AvailabilityChanged", ct);
    }
}
