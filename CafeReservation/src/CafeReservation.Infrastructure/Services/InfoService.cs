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
        var info = await _db.RestaurantInfo.AsNoTracking().FirstOrDefaultAsync(ct);
        var tenant = await _db.Tenants.AsNoTracking().FirstOrDefaultAsync(t => t.Id == _tenantService.TenantId, ct);
        
        if (info == null) return null;

        return new RestaurantInfoDto
        {
            Id = info.Id,
            TenantName = tenant?.Name ?? string.Empty,
            Address = info.Address,
            Phone = info.Phone,
            OpeningHours = info.OpeningHours,
            MapUrl = info.MapUrl
        };
    }
}
