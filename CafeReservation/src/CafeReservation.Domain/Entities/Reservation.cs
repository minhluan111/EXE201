using CafeReservation.Domain.Enums;

namespace CafeReservation.Domain.Entities;

public class Reservation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ReservationCode { get; set; } = string.Empty;

    // Multi-tenant
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public string GuestName { get; set; } = string.Empty;
    public string GuestEmail { get; set; } = string.Empty;
    public string GuestPhone { get; set; } = string.Empty;

    public Guid SeatingAreaId { get; set; }
    public SeatingArea SeatingArea { get; set; } = null!;

    public DateOnly ReservationDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }

    public int GuestCount { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.Reserved;
    public string? TableName { get; set; }
    public string? SpecialNote { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Decision Engine Snapshot (Persisted immutable snapshot at creation time)
    public string RiskLevel { get; set; } = "Available";
    public string DisplayType { get; set; } = "Available";
    public string ReviewStatus { get; set; } = "PendingReview";
    public int ReviewPriority { get; set; } = 5;
    public string ReviewBadge { get; set; } = "Bình thường";
    public string? ReviewExplanation { get; set; }
    public string BookingPriority { get; set; } = "Normal";
    public string BookingPriorityLabel { get; set; } = "⚪ Bình thường";
    public string? BookingPriorityExplanation { get; set; }
    public DateTime? DecisionEvaluatedAt { get; set; }

    // Staff confirmation audit
    public DateTime? ConfirmedAt { get; set; }
    public string? ConfirmedBy { get; set; }   // Staff email who confirmed

    // Check-in audit
    public DateTime? CheckedInAt { get; set; }
    public string? CheckedInBy { get; set; }   // Staff email who checked in
    public string? CheckInImageUrl { get; set; }
    public string? CheckInNote { get; set; }
}
