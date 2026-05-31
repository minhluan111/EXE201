namespace CafeReservation.Application.DTOs;

public class ReviewDto
{
    public Guid Id { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public Guid? MenuItemId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string? Reply { get; set; }
    public DateTime? ReplyAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateReviewRequest
{
    public string GuestName { get; set; } = string.Empty;
    public string GuestEmail { get; set; } = string.Empty;
    public string GuestPhone { get; set; } = string.Empty;
    public Guid? MenuItemId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

public class ReplyReviewRequest
{
    public string Reply { get; set; } = string.Empty;
}
