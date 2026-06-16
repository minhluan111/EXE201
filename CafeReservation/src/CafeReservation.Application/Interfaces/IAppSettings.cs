namespace CafeReservation.Application.Interfaces;

/// <summary>
/// Abstraction for app-level settings accessible from the Application layer.
/// Implemented in Infrastructure to avoid IConfiguration leaking into Application.
/// </summary>
public interface IAppSettings
{
    string FrontendUrl { get; }
}
