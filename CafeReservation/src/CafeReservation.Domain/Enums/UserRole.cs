namespace CafeReservation.Domain.Enums;

public enum UserRole
{
    User = 0,
    Admin = 1,
    Staff = 2,
    Manager = 3,
    SuperAdmin = 4   // Platform-level, không thuộc tenant nào (TenantId = null)
}
