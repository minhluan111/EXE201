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

    // UTC+7 Vietnam timezone
    private static readonly TimeZoneInfo VietnamTz =
        TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

    public AutoCancelReservationWorker(IServiceProvider serviceProvider, ILogger<AutoCancelReservationWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AutoCancelReservationWorker started. Checks every 1 minute for NoShow reservations.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessNoShowAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing NoShow reservations.");
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }

    private async Task ProcessNoShowAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var reservationRepo = scope.ServiceProvider.GetRequiredService<IReservationRepository>();
        var unitOfWork      = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var notifier        = scope.ServiceProvider.GetRequiredService<IAvailabilityNotifier>();
        var emailService    = scope.ServiceProvider.GetRequiredService<IEmailService>();

        // Use Vietnam local time (UTC+7) – the restaurant operates in VN
        var nowVietnam = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, VietnamTz);
        var today      = DateOnly.FromDateTime(nowVietnam);
        var nowTime    = TimeOnly.FromDateTime(nowVietnam);

        // Only Confirmed reservations can become NoShow.
        // Reserved reservations are intentionally excluded – they haven't been confirmed yet.
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
            // Mark NoShow if guest didn't arrive within the holding window
            var expirationTime = reservation.StartTime.AddMinutes(AppConstants.HoldingTimeMinutes);

            if (nowTime > expirationTime)
            {
                _logger.LogInformation(
                    "Marking reservation {Code} as NoShow – guest didn't arrive within {Holding} mins of {Start} (VN time)",
                    reservation.ReservationCode, AppConstants.HoldingTimeMinutes, reservation.StartTime);

                reservation.Status = ReservationStatus.NoShow;
                await reservationRepo.UpdateAsync(reservation, stoppingToken);
                changed = true;

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
