namespace CafeReservation.Domain.Entities;

public class RestaurantInfo
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Multi-tenant
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string OpeningHours { get; set; } = string.Empty;
    public string? MapUrl { get; set; }

    // Reservation Policy (Multi-tenant config)
    public int NoShowAfterMinutes { get; set; } = 15;
    public int CancelBeforeMinutes { get; set; } = 30;
    public int BookingLeadMinutes { get; set; } = 30;
    public int ConfirmationDeadlineMinutes { get; set; } = 30;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
