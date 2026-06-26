namespace CafeReservation.Domain.Entities;

public class Review
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Multi-tenant
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public string GuestName { get; set; } = string.Empty;
    public string GuestEmail { get; set; } = string.Empty;
    public string GuestPhone { get; set; } = string.Empty;

    public Guid? MenuItemId { get; set; }
    public MenuItem? MenuItem { get; set; }

    public int Rating { get; set; } // 1 to 5
    public string? Comment { get; set; }

    public string? Reply { get; set; }
    public DateTime? ReplyAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
