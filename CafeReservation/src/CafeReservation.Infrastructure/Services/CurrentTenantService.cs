using CafeReservation.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace CafeReservation.Infrastructure.Services;

/// <summary>
/// Đọc TenantId đã được TenantResolverMiddleware lưu vào HttpContext.Items.
/// Lifetime: Scoped — mỗi request có một instance riêng.
/// </summary>
public class CurrentTenantService : ICurrentTenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentTenantService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid TenantId
    {
        get
        {
            var context = _httpContextAccessor.HttpContext;
            if (context?.Items.TryGetValue("TenantId", out var value) == true
                && value is Guid tenantId)
            {
                return tenantId;
            }

            // Trả về Guid.Empty nếu chưa resolve (ví dụ: background job, migration)
            return Guid.Empty;
        }
    }

    public bool IsResolved
    {
        get
        {
            var context = _httpContextAccessor.HttpContext;
            return context?.Items.ContainsKey("TenantId") == true;
        }
    }

    public string TenantDomain
    {
        get
        {
            var context = _httpContextAccessor.HttpContext;
            if (context?.Items.TryGetValue("TenantDomain", out var value) == true
                && value is string domain)
            {
                return domain;
            }

            return string.Empty;
        }
    }
}
