using CafeReservation.Application.Interfaces;
using CafeReservation.Domain.Constants;
using CafeReservation.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CafeReservation.Api.Workers;

public class AutoCancelReservationWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AutoCancelReservationWorker> _logger;

    public AutoCancelReservationWorker(IServiceProvider serviceProvider, ILogger<AutoCancelReservationWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AutoCancelReservationWorker is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessCancellationsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing auto-cancellations.");
            }

            // Run every 1 minute
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }

    private async Task ProcessCancellationsAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var reservationRepo = scope.ServiceProvider.GetRequiredService<IReservationRepository>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var notifier = scope.ServiceProvider.GetRequiredService<IAvailabilityNotifier>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
        
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var nowTime = TimeOnly.FromDateTime(DateTime.UtcNow);

        // GetFilteredAsync to get today's confirmed.
        var (items, _) = await reservationRepo.GetFilteredAsync(
            date: today,
            status: ReservationStatus.Confirmed.ToString(),
            search: null,
            page: 1,
            pageSize: 1000,
            ct: stoppingToken);

        var changed = false;

        foreach (var reservation in items)
        {
            // Calculate expiration time (StartTime + 45 mins)
            var expirationTime = reservation.StartTime.AddMinutes(AppConstants.HoldingTimeMinutes);

            // If it's past the expiration time, auto-cancel
            if (nowTime > expirationTime)
            {
                _logger.LogInformation("Auto-cancelling reservation {Code} (Guest didn't arrive after {Holding} mins)", 
                    reservation.ReservationCode, AppConstants.HoldingTimeMinutes);

                reservation.Status = ReservationStatus.NoShow;
                await reservationRepo.UpdateAsync(reservation, stoppingToken);
                changed = true;

                // Send email notification about cancellation
                _ = emailService.SendCancellationNotificationAsync(
                    reservation.GuestEmail, reservation.GuestName, reservation.ReservationCode, reservation.Id);
            }
        }

        if (changed)
        {
            await unitOfWork.SaveChangesAsync(stoppingToken);
            _ = notifier.NotifyAvailabilityChangedAsync(stoppingToken);
        }
    }
}
