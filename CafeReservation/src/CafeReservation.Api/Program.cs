using CafeReservation.Api.Hubs;
using CafeReservation.Api.Middleware;
using CafeReservation.Api.Services;
using CafeReservation.Application;
using CafeReservation.Application.Mappings;
using CafeReservation.Infrastructure;
using CafeReservation.Infrastructure.Persistence;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Routing;
using Serilog;
using System.Text;

// Register Mapster type adapters
MappingConfig.Configure();

var builder = WebApplication.CreateBuilder(args);

// Serilog 
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/cafe-reservation-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Application & Infrastructure layers  
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Real-time (SignalR) & Background Workers
builder.Services.AddSignalR();
builder.Services.AddScoped<CafeReservation.Application.Interfaces.IAvailabilityNotifier, SignalRAvailabilityNotifier>();
builder.Services.AddHostedService<CafeReservation.Api.Workers.AutoCancelReservationWorker>();

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new CafeReservation.Api.Converters.DateOnlyJsonConverter());
        options.JsonSerializerOptions.Converters.Add(new CafeReservation.Api.Converters.TimeOnlyJsonConverter());
    });

// FluentValidation 
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssembly(typeof(CafeReservation.Application.DependencyInjection).Assembly);

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey   = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is not configured.");

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtSettings["Issuer"],
            ValidAudience            = jwtSettings["Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew                = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Swagger 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "Yaki Café Reservation API",
        Version     = "v1",
        Description = "Production-ready reservation system for Yaki Japanese Café"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.Http,
        Scheme       = "Bearer",
        BearerFormat = "JWT",
        In           = ParameterLocation.Header,
        Description  = "Enter your JWT token (without 'Bearer' prefix)"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });

    // Thêm X-Tenant header vào tất cả endpoints trong Swagger UI
    c.AddSecurityDefinition("X-Tenant", new OpenApiSecurityScheme
    {
        Name        = "X-Tenant",
        Type        = SecuritySchemeType.ApiKey,
        In          = ParameterLocation.Header,
        Description = "Domain của nhà hàng. VD: yakicafe.localhost | comtamno.localhost | monquanchat.localhost"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "X-Tenant" }
            },
            Array.Empty<string>()
        }
    });
});

// CORS 
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy
            .SetIsOriginAllowed(_ => true)   // Allows all origins but still compatible with SignalR
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()));            // Required for SignalR WebSocket negotiation

var app = builder.Build();

// Auto-migrate on startup (chạy ở mọi môi trường)
using (var scope = app.Services.CreateScope())
{
    var db  = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var log = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();
    try
    {
        await db.Database.ExecuteSqlRawAsync("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS logo character varying(500) NULL;");
        await db.Database.ExecuteSqlRawAsync("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS theme_color character varying(20) NULL;");
        await db.Database.MigrateAsync();
        log.LogInformation("Database migration completed successfully.");
    }
    catch (Exception ex)
    {
        log.LogError(ex, "Database migration/seeding failed. The API will start but DB features may not work.");
    }
}


// Middleware pipeline
app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();

app.UseCors(); // <-- CHUYỂN LÊN ĐÂY ĐỂ TRÁNH LỖI PREFLIGHT OPTIONS
app.UseMiddleware<CafeReservation.Api.Middleware.TenantResolverMiddleware>();   // ← Multi-tenant: phải trước Auth

app.UseSwagger();
app.UseSwaggerUI();

app.UseSerilogRequestLogging();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<AvailabilityHub>("/hub/availability");

app.MapGet("/debug/endpoints", (EndpointDataSource endpointSource) =>
{
    return endpointSource.Endpoints.Select(e => e.DisplayName);
});
await app.RunAsync();
