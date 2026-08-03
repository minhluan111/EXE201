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

    private Guid? _manualTenantId;

    public Guid TenantId
    {
        get
        {
            if (_manualTenantId.HasValue) return _manualTenantId.Value;

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

    public void SetTenantId(Guid tenantId) => _manualTenantId = tenantId;

    public bool IsResolved
    {
        get
        {
            if (_manualTenantId.HasValue && _manualTenantId.Value != Guid.Empty) return true;
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
