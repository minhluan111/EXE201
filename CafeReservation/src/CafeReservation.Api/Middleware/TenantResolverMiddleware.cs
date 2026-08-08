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

        var rawDomain = domainValues.First()!.Trim().ToLowerInvariant();
        var cleanDomain = rawDomain.Replace("https://", "").Replace("http://", "").Split(':')[0].Trim();
        var prefix = cleanDomain.Split('.')[0];

        // Thử lấy từ cache trước — tránh DB round-trip cho mỗi request
        var cacheKey = $"tenant:{cleanDomain}";
        if (!_cache.TryGetValue(cacheKey, out (Guid Id, string Domain) cached))
        {
            // Tra cứu tenant — hỗ trợ cả tên ngắn (emcoffee), localhost và full domain (emcoffee.localhost, emcoffee.vercel.app)
            var tenant = await db.Tenants
                .IgnoreQueryFilters()
                .AsNoTracking()
                .Where(t => (t.Domain == cleanDomain 
                          || t.Domain == rawDomain 
                          || t.Domain == prefix 
                          || t.Domain.StartsWith(prefix + ".") 
                          || (prefix == "comtam" && t.Domain.Contains("comtam"))
                          || (prefix == "samhouse" && t.Domain.Contains("samhouse"))
                          || (prefix == "monquanchat" && t.Domain.Contains("monquan"))
                          || (prefix == "hoatearoom" && t.Domain.Contains("hoa"))
                          || (prefix == "emcoffee" && t.Domain.Contains("emcoffee"))
                          || (prefix.Contains("taotao") && t.Domain.Contains("taotao"))
                          || (prefix == "matcha" && t.Domain.Contains("yaki")))
                          && t.Active)
                .Select(t => new { t.Id, t.Domain, t.Name })
                .FirstOrDefaultAsync();

            if (tenant is null)
            {
                _logger.LogWarning("Tenant không tồn tại hoặc đã bị vô hiệu hóa: {Domain}", rawDomain);
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(
                    $"{{\"error\":\"Tenant '{rawDomain}' không tồn tại hoặc đã bị vô hiệu hóa.\"}}");
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
