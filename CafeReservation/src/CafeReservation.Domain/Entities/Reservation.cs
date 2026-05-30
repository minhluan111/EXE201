using CafeReservation.Domain.Enums;

namespace CafeReservation.Domain.Entities;

public class Reservation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ReservationCode { get; set; } = string.Empty;

    public string GuestName { get; set; } = string.Empty;
    public string GuestEmail { get; set; } = string.Empty;
    public string GuestPhone { get; set; } = string.Empty;

    public Guid SeatingAreaId { get; set; }
    public SeatingArea SeatingArea { get; set; } = null!;

    public DateOnly ReservationDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }

    public int GuestCount { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.Confirmed;
    public string? TableName { get; set; }
    public string? SpecialNote { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
