namespace CafeReservation.Domain.Entities;

public class Feedback
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Multi-tenant
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public string GuestName { get; set; } = string.Empty;
    public string GuestEmail { get; set; } = string.Empty;
    public string GuestPhone { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;

    public string? Reply { get; set; }
    public DateTime? ReplyAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
