using CafeReservation.Application.Interfaces;
using CafeReservation.Application.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace CafeReservation.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IReservationService, ReservationService>();

        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        return services;
    }
}
