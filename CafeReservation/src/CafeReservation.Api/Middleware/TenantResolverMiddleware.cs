using CafeReservation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CafeReservation.Api.Middleware;

/// <summary>
/// Middleware đọc header X-Tenant, tra cứu tenant trong DB,
/// rồi lưu TenantId vào HttpContext.Items["TenantId"].
///
/// Pipeline order: TenantResolver → Auth → Controller
/// </summary>
public class TenantResolverMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantResolverMiddleware> _logger;

    // Các path không yêu cầu X-Tenant header (health check, swagger, debug)
    private static readonly HashSet<string> _excludedPrefixes = new(StringComparer.OrdinalIgnoreCase)
    {
        "/swagger",
        "/health",
        "/debug",
        "/hub"      // SignalR hub — tenant được truyền qua query param hoặc token
    };

    public TenantResolverMiddleware(
        RequestDelegate next,
        ILogger<TenantResolverMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, AppDbContext db)
    {
        var path = context.Request.Path.Value ?? string.Empty;

        // Bỏ qua các route không cần tenant
        if (_excludedPrefixes.Any(prefix => path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)))
        {
            await _next(context);
            return;
        }

        // Đọc header X-Tenant
        if (!context.Request.Headers.TryGetValue("X-Tenant", out var domainValues)
            || string.IsNullOrWhiteSpace(domainValues.FirstOrDefault()))
        {
            _logger.LogWarning("Request to {Path} bị từ chối: thiếu header X-Tenant", path);
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(
                """{"error":"Thiếu header X-Tenant. Vui lòng cung cấp domain của nhà hàng."}""");
            return;
        }

        var domain = domainValues.First()!.Trim().ToLowerInvariant();

        // Tra cứu tenant — bypass query filter vì chưa có TenantId context
        var tenant = await db.Tenants
            .IgnoreQueryFilters()
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Domain == domain && t.Active);

        if (tenant is null)
        {
            _logger.LogWarning("Tenant không tồn tại hoặc đã bị vô hiệu hóa: {Domain}", domain);
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(
                $$$"""{"error":"Tenant '{{{domain}}}' không tồn tại hoặc đã bị vô hiệu hóa."}""");
            return;
        }

        // Lưu TenantId và TenantDomain vào HttpContext để ICurrentTenantService đọc
        context.Items["TenantId"] = tenant.Id;
        context.Items["TenantDomain"] = tenant.Domain;
        _logger.LogDebug("Tenant resolved: {Name} ({Id}) cho request {Path}", tenant.Name, tenant.Id, path);

        await _next(context);
    }
}
