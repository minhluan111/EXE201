namespace CafeReservation.Application.DTOs;

public class RestaurantInfoDto
{
    public Guid Id { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string OpeningHours { get; set; } = string.Empty;
    public string? MapUrl { get; set; }
    public string? ThemeColor { get; set; }
    public string? Logo { get; set; }

    // Reservation Policy
    public int NoShowAfterMinutes { get; set; }
    public int CancelBeforeMinutes { get; set; }
    public int BookingLeadMinutes { get; set; }
    public int ConfirmationDeadlineMinutes { get; set; }
}
