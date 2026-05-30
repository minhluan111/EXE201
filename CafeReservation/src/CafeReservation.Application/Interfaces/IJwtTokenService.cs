using CafeReservation.Domain.Entities;

namespace CafeReservation.Application.Interfaces;

/// <summary>Generates and validates JWT tokens.</summary>
public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(User user);
}
