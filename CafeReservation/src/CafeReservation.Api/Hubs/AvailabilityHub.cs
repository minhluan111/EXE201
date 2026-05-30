using Microsoft.AspNetCore.SignalR;

namespace CafeReservation.Api.Hubs;

public class AvailabilityHub : Hub
{
    // Clients can connect to this hub to receive real-time notifications
    // No specific methods needed here right now; we just push from the server.
}
