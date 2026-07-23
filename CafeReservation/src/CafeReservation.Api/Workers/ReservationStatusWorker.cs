using CafeReservation.Application.Interfaces;
using CafeReservation.Domain.Constants;
using CafeReservation.Domain.Enums;
using CafeReservation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CafeReservation.Api.Workers;

public class ReservationStatusWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ReservationStatusWorker> _logger;

    // UTC+7 Vietnam timezone
    private static readonly TimeZoneInfo VietnamTz =
        TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

    public ReservationStatusWorker(IServiceProvider serviceProvider, ILogger<ReservationStatusWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ReservationStatusWorker started. Checks every 1 minute for policies.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessReservationStatusesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing reservation statuses.");
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }

    private async Task ProcessReservationStatusesAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var db              = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var notifier        = scope.ServiceProvider.GetRequiredService<IAvailabilityNotifier>();
        var emailService    = scope.ServiceProvider.GetRequiredService<IEmailService>();

        var nowVietnam = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, VietnamTz);
        var today      = DateOnly.FromDateTime(nowVietnam);
        var nowTime    = TimeOnly.FromDateTime(nowVietnam);

        // Fetch Confirmed and Reserved reservations directly from DB bypassing Tenant filter
        var targetReservations = await db.Reservations
            .IgnoreQueryFilters()
            .Where(r => r.ReservationDate == today && 
                        (r.Status == ReservationStatus.Confirmed || r.Status == ReservationStatus.Reserved))
            .ToListAsync(stoppingToken);

        if (!targetReservations.Any()) return;

        // Group by Tenant to evaluate policies
        var tenantGroups = targetReservations.GroupBy(r => r.TenantId);
        var changedCount = 0;

        foreach (var group in tenantGroups)
        {
            var tenantId = group.Key;
            
            // Get tenant policy
            var info = await db.RestaurantInfo
                .IgnoreQueryFilters()
                .Where(x => x.TenantId == tenantId)
                .OrderByDescending(x => x.UpdatedAt)
                .FirstOrDefaultAsync(stoppingToken);

            int noShowMins = info?.NoShowAfterMinutes ?? 15;
            int confDeadlineMins = info?.ConfirmationDeadlineMinutes ?? 30;

            foreach (var reservation in group)
            {
                // 1. Process NoShow for Confirmed
                if (reservation.Status == ReservationStatus.Confirmed)
                {
                    var expirationTime = reservation.StartTime.AddMinutes(noShowMins);
                    if (nowTime > expirationTime)
                    {
                        _logger.LogInformation(
                            "Marking reservation {Code} (Tenant: {Tenant}) as NoShow. Guest didn't arrive within {Mins} mins of {Start}",
                            reservation.ReservationCode, tenantId, noShowMins, reservation.StartTime);

                        reservation.Status = ReservationStatus.NoShow;
                        changedCount++;
                    }
                }
                
                // 2. Process AutoCancel for Reserved if past Confirmation Deadline
                else if (reservation.Status == ReservationStatus.Reserved)
                {
                    var deadlineTime = reservation.StartTime.AddMinutes(-confDeadlineMins);
                    if (nowTime > deadlineTime)
                    {
                        _logger.LogInformation(
                            "Auto cancelling reservation {Code} (Tenant: {Tenant}). Not confirmed {Mins} mins before {Start}",
                            reservation.ReservationCode, tenantId, confDeadlineMins, reservation.StartTime);

                        reservation.Status = ReservationStatus.Cancelled;
                        changedCount++;
                        
                        _ = emailService.SendCancellationNotificationAsync(
                            reservation.GuestEmail, reservation.GuestName, reservation.ReservationCode, reservation.Id);
                    }
                }
            }
        }

        if (changedCount > 0)
        {
            await db.SaveChangesAsync(stoppingToken);
            _ = notifier.NotifyAvailabilityChangedAsync(stoppingToken);
        }
    }
}
