namespace CafeReservation.Application.Interfaces;

public interface IAvailabilityNotifier
{
    Task NotifyAvailabilityChangedAsync(CancellationToken ct = default);
}
