using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using CafeReservation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CafeReservation.Infrastructure.Services;

public class InfoService : IInfoService
{
    private readonly AppDbContext _db;
    private readonly ICurrentTenantService _tenantService;

    public InfoService(AppDbContext db, ICurrentTenantService tenantService)
    {
        _db = db;
        _tenantService = tenantService;
    }

    public async Task<RestaurantInfoDto?> GetRestaurantInfoAsync(CancellationToken ct = default)
    {
        var info = await _db.RestaurantInfo.AsNoTracking().OrderByDescending(x => x.UpdatedAt).FirstOrDefaultAsync(ct);
        var tenant = await _db.Tenants.AsNoTracking().FirstOrDefaultAsync(t => t.Id == _tenantService.TenantId, ct);
        
        if (tenant == null) return null;

        return new RestaurantInfoDto
        {
            Id = info?.Id ?? Guid.Empty,
            TenantName = tenant.Name,
            Address = info?.Address ?? "Việt Nam",
            Phone = info?.Phone ?? string.Empty,
            OpeningHours = info?.OpeningHours ?? string.Empty,
            MapUrl = info?.MapUrl,
            ThemeColor = tenant.ThemeColor,
            Logo = tenant.Logo,
            NoShowAfterMinutes = info?.NoShowAfterMinutes ?? 15,
            CancelBeforeMinutes = info?.CancelBeforeMinutes ?? 30,
            BookingLeadMinutes = info?.BookingLeadMinutes ?? 30,
            ConfirmationDeadlineMinutes = info?.ConfirmationDeadlineMinutes ?? 30
        };
    }
}
