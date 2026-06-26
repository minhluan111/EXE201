namespace CafeReservation.Application.DTOs;

public class RestaurantInfoDto
{
    public Guid Id { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string OpeningHours { get; set; } = string.Empty;
    public string? MapUrl { get; set; }
}
