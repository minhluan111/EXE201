using CafeReservation.Application.DTOs;

namespace CafeReservation.Application.Interfaces;

public interface IInfoService
{
    Task<RestaurantInfoDto?> GetRestaurantInfoAsync(CancellationToken ct = default);
}
