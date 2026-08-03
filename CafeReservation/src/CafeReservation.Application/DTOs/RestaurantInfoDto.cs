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
    public int NoShowAfterMinutes { get; set; } = 15;
    public int CancelBeforeMinutes { get; set; } = 30;
    public int BookingLeadMinutes { get; set; } = 15;
    public int ConfirmationDeadlineMinutes { get; set; } = 30;
    public int HighRiskThresholdMinutes { get; set; } = 60;
    public int MediumRiskThresholdMinutes { get; set; } = 120;
    public int LowRiskThresholdMinutes { get; set; } = 180;
    public int AutoConfirmThresholdMinutes { get; set; } = 180;
    public TimeOnly OpeningTime { get; set; } = new(8, 0);
    public TimeOnly ClosingTime { get; set; } = new(20, 0);
}

public class UpdateRestaurantInfoRequest
{
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string OpeningHours { get; set; } = string.Empty;
    public string? MapUrl { get; set; }

    public int NoShowAfterMinutes { get; set; } = 15;
    public int CancelBeforeMinutes { get; set; } = 30;
    public int BookingLeadMinutes { get; set; } = 15;
    public int ConfirmationDeadlineMinutes { get; set; } = 30;
    public int HighRiskThresholdMinutes { get; set; } = 60;
    public int MediumRiskThresholdMinutes { get; set; } = 120;
    public int LowRiskThresholdMinutes { get; set; } = 180;
    public int AutoConfirmThresholdMinutes { get; set; } = 180;
    public TimeOnly OpeningTime { get; set; } = new(8, 0);
    public TimeOnly ClosingTime { get; set; } = new(20, 0);
}

public class ParseMapUrlRequest
{
    public string MapUrl { get; set; } = string.Empty;
}

public class ParseMapUrlResponse
{
    public bool Success { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? OpeningHours { get; set; }
    public TimeOnly? OpeningTime { get; set; }
    public TimeOnly? ClosingTime { get; set; }
    public string? Message { get; set; }
}

