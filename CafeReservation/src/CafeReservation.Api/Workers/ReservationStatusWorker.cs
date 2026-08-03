using CafeReservation.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CafeReservation.Api.Workers;

public class ReservationStatusWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ReservationStatusWorker> _logger;

    public ReservationStatusWorker(IServiceProvider serviceProvider, ILogger<ReservationStatusWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ReservationStatusWorker started. Running checks every 1 minute.");

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
        var reservationService = scope.ServiceProvider.GetRequiredService<IReservationService>();
        await reservationService.ProcessAutomatedStatusTransitionsAsync(stoppingToken);
    }
}
