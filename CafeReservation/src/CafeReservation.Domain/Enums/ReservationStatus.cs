namespace CafeReservation.Domain.Enums;

public enum ReservationStatus
{
    Confirmed = 0,
    Cancelled = 1,
    Completed = 2,
    NoShow    = 3,
    CheckedIn = 4, // renamed from Seated (value unchanged – no data migration needed)
    Reserved  = 5, // newly created booking awaiting Staff confirmation
}
