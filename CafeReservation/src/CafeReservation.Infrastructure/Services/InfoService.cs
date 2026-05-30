using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using CafeReservation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CafeReservation.Infrastructure.Services;

public class InfoService : IInfoService
{
    private readonly AppDbContext _db;

    public InfoService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<RestaurantInfoDto?> GetRestaurantInfoAsync(CancellationToken ct = default)
    {
        var info = await _db.RestaurantInfo.AsNoTracking().FirstOrDefaultAsync(ct);
        
        if (info == null) return null;

        return new RestaurantInfoDto
        {
            Id = info.Id,
            Address = info.Address,
            Phone = info.Phone,
            OpeningHours = info.OpeningHours,
            MapUrl = info.MapUrl
        };
    }
}
