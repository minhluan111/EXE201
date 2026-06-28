using CafeReservation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace CafeReservation.Api.Middleware;

/// <summary>
/// Middleware đọc header X-Tenant, tra cứu tenant trong DB (có cache),
/// rồi lưu TenantId vào HttpContext.Items["TenantId"].
///
/// Pipeline order: TenantResolver → Auth → Controller
/// </summary>
public class TenantResolverMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantResolverMiddleware> _logger;
    private readonly IMemoryCache _cache;

    // Thời gian cache tenant lookup — giảm DB hit cho mỗi request
    private static readonly TimeSpan TenantCacheDuration = TimeSpan.FromMinutes(5);

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
        ILogger<TenantResolverMiddleware> logger,
        IMemoryCache cache)
    {
        _next = next;
        _logger = logger;
        _cache = cache;
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

        // Thử lấy từ cache trước — tránh DB round-trip cho mỗi request
        var cacheKey = $"tenant:{domain}";
        if (!_cache.TryGetValue(cacheKey, out (Guid Id, string Domain) cached))
        {
            // Tra cứu tenant — bypass query filter vì chưa có TenantId context
            // Dùng projection (.Select) để chỉ lấy các field cần thiết thay vì toàn bộ Tenant entity
            var tenant = await db.Tenants
                .IgnoreQueryFilters()
                .AsNoTracking()
                .Where(t => t.Domain == domain && t.Active)
                .Select(t => new { t.Id, t.Domain, t.Name })
                .FirstOrDefaultAsync();

            if (tenant is null)
            {
                _logger.LogWarning("Tenant không tồn tại hoặc đã bị vô hiệu hóa: {Domain}", domain);
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(
                    $"{{\"error\":\"Tenant '{domain}' không tồn tại hoặc đã bị vô hiệu hóa.\"}}");
                return;
            }

            cached = (tenant.Id, tenant.Domain);
            _cache.Set(cacheKey, cached, TenantCacheDuration);
            _logger.LogDebug("Tenant resolved from DB: {Name} ({Id}) cho request {Path}", tenant.Name, cached.Id, path);
        }
        else
        {
            _logger.LogDebug("Tenant resolved from cache: {Domain} ({Id}) cho request {Path}", cached.Domain, cached.Id, path);
        }

        // Lưu TenantId và TenantDomain vào HttpContext để ICurrentTenantService đọc
        context.Items["TenantId"] = cached.Id;
        context.Items["TenantDomain"] = cached.Domain;

        await _next(context);
    }
}
