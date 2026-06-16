using CafeReservation.Domain.Enums;

namespace CafeReservation.Application.DTOs;

public class CreateReservationRequest
{
    public Guid SeatingAreaId { get; set; }
    public DateOnly ReservationDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public int GuestCount { get; set; }
    public string? SpecialNote { get; set; }

    public string? GuestName { get; set; }
    public string? GuestEmail { get; set; }
    public string? GuestPhone { get; set; }
    public string? TableName { get; set; }
}

public class RescheduleReservationRequest
{
    public DateOnly ReservationDate { get; set; }
    public TimeOnly StartTime { get; set; }
}

public class CheckInRequest
{
    public string? CheckInImageUrl { get; set; }
    public string? CheckInNote { get; set; }
}

public class ReservationResponse
{
    public Guid Id { get; set; }
    public string ReservationCode { get; set; } = string.Empty;
    public string GuestName { get; set; } = string.Empty;
    public string GuestEmail { get; set; } = string.Empty;
    public string GuestPhone { get; set; } = string.Empty;
    public Guid SeatingAreaId { get; set; }
    public string SeatingAreaTableType { get; set; } = string.Empty;
    public string SeatingAreaArea { get; set; } = string.Empty;
    public DateOnly ReservationDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int GuestCount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? TableName { get; set; }
    public string? SpecialNote { get; set; }
    public DateTime CreatedAt { get; set; }

    // Audit fields
    public DateTime? ConfirmedAt { get; set; }
    public string? ConfirmedBy { get; set; }
    public DateTime? CheckedInAt { get; set; }
    public string? CheckedInBy { get; set; }
    public string? CheckInImageUrl { get; set; }
    public string? CheckInNote { get; set; }
}

public class AvailabilityRequest
{
    public DateOnly Date { get; set; }
    public int GuestCount { get; set; }
}

public class AvailabilityResponse
{
    public Guid SeatingAreaId { get; set; }
    public string TableType { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public string? PreviewImage { get; set; }
    public string? Description { get; set; }
    public List<TimeSlot> AvailableSlots { get; set; } = new();
}

public class TimeSlot
{
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}

// Admin Filtering & Pagination

public class ReservationFilterRequest
{
    public DateOnly? Date { get; set; }
    public string? Status { get; set; }
    public string? Search { get; set; }  // reservation code or guest name
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasNext => Page < TotalPages;
    public bool HasPrev => Page > 1;
}

public class UpdateReservationStatusRequest
{
    public string Status { get; set; } = string.Empty;  // Completed | NoShow | Confirmed | Cancelled | Reserved | CheckedIn
}

// Dashboard Stats

public class DashboardStatsResponse
{
    public int TotalReservations { get; set; }
    public int TodayReservations { get; set; }
    public int ReservedReservations { get; set; }
    public int ConfirmedReservations { get; set; }
    public int CancelledReservations { get; set; }
    public int CompletedReservations { get; set; }
    public int CheckedInReservations { get; set; }
    public int NoShowReservations { get; set; }
    public int TotalUsers { get; set; }
}
