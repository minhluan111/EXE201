using CafeReservation.Domain.Enums;

namespace CafeReservation.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Multi-tenant — nullable vì SuperAdmin không thuộc tenant nào (TenantId = null)
    public Guid? TenantId { get; set; }
    public Tenant? Tenant { get; set; }

    // Forgot password
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }
}
