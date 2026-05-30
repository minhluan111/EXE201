namespace CafeReservation.Application.Interfaces;

/// <summary>Abstracts password hashing so Application stays infrastructure-free.</summary>
public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}
