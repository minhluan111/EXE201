using CafeReservation.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace CafeReservation.Infrastructure.Services;

public class AppSettings : IAppSettings
{
    private readonly IConfiguration _configuration;

    public AppSettings(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string FrontendUrl => _configuration["FrontendUrl"] ?? "http://localhost:5173";
}
