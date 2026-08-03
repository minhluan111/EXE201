using CafeReservation.Application.DTOs;

namespace CafeReservation.Application.Interfaces;

public interface IInfoService
{
    Task<RestaurantInfoDto?> GetRestaurantInfoAsync(CancellationToken ct = default);
    Task<RestaurantInfoDto> UpdateRestaurantInfoAsync(UpdateRestaurantInfoRequest request, CancellationToken ct = default);
    Task<ParseMapUrlResponse> ParseMapUrlAsync(ParseMapUrlRequest request, CancellationToken ct = default);
}
