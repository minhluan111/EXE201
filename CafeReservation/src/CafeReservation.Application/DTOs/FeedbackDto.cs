namespace CafeReservation.Application.DTOs;

public class FeedbackDto
{
    public Guid Id { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Reply { get; set; }
    public DateTime? ReplyAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateFeedbackRequest
{
    public string GuestName { get; set; } = string.Empty;
    public string GuestEmail { get; set; } = string.Empty;
    public string GuestPhone { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}

public class ReplyFeedbackRequest
{
    public string Reply { get; set; } = string.Empty;
}
