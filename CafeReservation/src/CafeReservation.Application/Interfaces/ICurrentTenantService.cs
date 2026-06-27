namespace CafeReservation.Application.Interfaces;

/// <summary>
/// Cung cấp thông tin tenant hiện tại cho request đang xử lý.
/// Được inject vào AppDbContext để áp dụng query filter tự động.
/// </summary>
public interface ICurrentTenantService
{
    /// <summary>TenantId được resolve từ header X-Tenant.</summary>
    Guid TenantId { get; }

    /// <summary>true nếu middleware đã tìm thấy và set TenantId thành công.</summary>
    bool IsResolved { get; }

    /// <summary>Domain của tenant hiện tại (dùng để tạo link URL động).</summary>
    string TenantDomain { get; }
}
