using CafeReservation.Application.Interfaces;
using CafeReservation.Application.Services;
using CafeReservation.Infrastructure.Persistence;
using CafeReservation.Infrastructure.Repositories;
using CafeReservation.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CafeReservation.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // HttpContextAccessor — cần cho CurrentTenantService
        services.AddHttpContextAccessor();

        // ICurrentTenantService — đọc TenantId từ HttpContext.Items
        services.AddScoped<ICurrentTenantService, CurrentTenantService>();

        // EF Core + PostgreSQL
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                npgsql => npgsql.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

        // Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IReservationRepository, ReservationRepository>();
        services.AddScoped<ISeatingAreaRepository, SeatingAreaRepository>();

        // Infrastructure services
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.AddSingleton<IAppSettings, AppSettings>();
        services.AddHttpClient<IEmailService, EmailService>();

        // Application services
        services.AddScoped<ISeatingAreaService, SeatingAreaService>();
        services.AddScoped<IMenuService, MenuService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<IFeedbackService, FeedbackService>();
        services.AddScoped<IInfoService, InfoService>();

        return services;
    }
}
