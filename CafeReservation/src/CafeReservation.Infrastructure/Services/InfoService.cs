using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using CafeReservation.Domain.Entities;
using CafeReservation.Domain.Exceptions;
using CafeReservation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CafeReservation.Infrastructure.Services;

public class InfoService : IInfoService
{
    private readonly AppDbContext _db;
    private readonly ICurrentTenantService _tenantService;

    public InfoService(AppDbContext db, ICurrentTenantService tenantService)
    {
        _db = db;
        _tenantService = tenantService;
    }

    public async Task<RestaurantInfoDto?> GetRestaurantInfoAsync(CancellationToken ct = default)
    {
        var info = await _db.RestaurantInfo.AsNoTracking().OrderByDescending(x => x.UpdatedAt).FirstOrDefaultAsync(ct);
        var tenant = await _db.Tenants.AsNoTracking().FirstOrDefaultAsync(t => t.Id == _tenantService.TenantId, ct);
        
        if (tenant == null) return null;

        return new RestaurantInfoDto
        {
            Id = info?.Id ?? Guid.Empty,
            TenantName = tenant.Name,
            Address = info?.Address ?? "Việt Nam",
            Phone = info?.Phone ?? string.Empty,
            OpeningHours = info?.OpeningHours ?? string.Empty,
            MapUrl = info?.MapUrl,
            ThemeColor = tenant.ThemeColor,
            Logo = tenant.Logo,
            NoShowAfterMinutes = info?.NoShowAfterMinutes ?? 15,
            CancelBeforeMinutes = info?.CancelBeforeMinutes ?? 30,
            BookingLeadMinutes = info?.BookingLeadMinutes ?? 15,
            ConfirmationDeadlineMinutes = info?.ConfirmationDeadlineMinutes ?? 30,
            HighRiskThresholdMinutes = info?.HighRiskThresholdMinutes ?? 60,
            MediumRiskThresholdMinutes = info?.MediumRiskThresholdMinutes ?? 120,
            LowRiskThresholdMinutes = info?.LowRiskThresholdMinutes ?? 180,
            AutoConfirmThresholdMinutes = info?.AutoConfirmThresholdMinutes ?? 180,
            OpeningTime = info?.OpeningTime ?? new TimeOnly(8, 0),
            ClosingTime = info?.ClosingTime ?? new TimeOnly(20, 0)
        };
    }

    public async Task<RestaurantInfoDto> UpdateRestaurantInfoAsync(UpdateRestaurantInfoRequest request, CancellationToken ct = default)
    {
        if (request.HighRiskThresholdMinutes <= 0 ||
            request.MediumRiskThresholdMinutes <= 0 ||
            request.LowRiskThresholdMinutes <= 0)
        {
            throw new ConfigurationException("Dynamic Booking Policy thresholds must be greater than 0.");
        }

        if (request.HighRiskThresholdMinutes >= request.MediumRiskThresholdMinutes ||
            request.MediumRiskThresholdMinutes >= request.LowRiskThresholdMinutes)
        {
            throw new ConfigurationException("Dynamic Booking Policy thresholds must be ordered: High < Medium < Low.");
        }

        var info = await _db.RestaurantInfo.FirstOrDefaultAsync(ct);
        if (info == null)
        {
            info = new RestaurantInfo
            {
                Id = Guid.NewGuid(),
                TenantId = _tenantService.TenantId
            };
            await _db.RestaurantInfo.AddAsync(info, ct);
        }

        info.Address = request.Address ?? string.Empty;
        info.Phone = request.Phone ?? string.Empty;
        info.OpeningHours = request.OpeningHours ?? string.Empty;
        info.MapUrl = request.MapUrl;

        info.NoShowAfterMinutes = request.NoShowAfterMinutes;
        info.CancelBeforeMinutes = request.CancelBeforeMinutes;
        info.BookingLeadMinutes = request.BookingLeadMinutes;
        info.ConfirmationDeadlineMinutes = request.ConfirmationDeadlineMinutes;
        info.HighRiskThresholdMinutes = request.HighRiskThresholdMinutes;
        info.MediumRiskThresholdMinutes = request.MediumRiskThresholdMinutes;
        info.LowRiskThresholdMinutes = request.LowRiskThresholdMinutes;
        info.AutoConfirmThresholdMinutes = request.AutoConfirmThresholdMinutes;
        info.OpeningTime = request.OpeningTime;
        info.ClosingTime = request.ClosingTime;
        info.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return (await GetRestaurantInfoAsync(ct))!;
    }

    public async Task<ParseMapUrlResponse> ParseMapUrlAsync(ParseMapUrlRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.MapUrl) || !Uri.IsWellFormedUriString(request.MapUrl, UriKind.Absolute))
        {
            return new ParseMapUrlResponse { Success = false, Message = "Đường dẫn Google Maps không hợp lệ." };
        }

        try
        {
            using var handler = new HttpClientHandler { AllowAutoRedirect = true };
            using var client = new HttpClient(handler);
            client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            client.Timeout = TimeSpan.FromSeconds(8);

            var response = await client.GetAsync(request.MapUrl, ct);
            var finalUrl = response.RequestMessage?.RequestUri?.ToString() ?? request.MapUrl;
            var html = await response.Content.ReadAsStringAsync(ct);

            string? address = null;
            string? phone = null;
            string? openingHours = null;
            TimeOnly? openingTime = null;
            TimeOnly? closingTime = null;

            // 1. Try parse from meta property="og:description"
            var ogDescMatch = System.Text.RegularExpressions.Regex.Match(html, @"<meta[^>]+property=""og:description""[^>]+content=""([^""]+)""", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            if (!ogDescMatch.Success)
            {
                ogDescMatch = System.Text.RegularExpressions.Regex.Match(html, @"<meta[^>]+content=""([^""]+)""[^>]+property=""og:description""", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            }

            if (ogDescMatch.Success)
            {
                var content = System.Net.WebUtility.HtmlDecode(ogDescMatch.Groups[1].Value);
                var parts = content.Split(new[] { '·', '•', '|' }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var part in parts)
                {
                    var trimmed = part.Trim();
                    var phoneMatch = System.Text.RegularExpressions.Regex.Match(trimmed, @"(0|\+84)[3|5|7|8|9]\d{8}");
                    if (phoneMatch.Success && phone == null)
                    {
                        phone = phoneMatch.Value;
                    }

                    var timeMatch = System.Text.RegularExpressions.Regex.Match(trimmed, @"(\d{1,2}:\d{2})\s*[-–—−]\s*(\d{1,2}:\d{2})");
                    if (timeMatch.Success && openingHours == null)
                    {
                        openingHours = timeMatch.Value;
                    }
                    else if (address == null && (trimmed.Contains(",") || trimmed.ToLower().Contains("đường") || trimmed.ToLower().Contains("phường") || trimmed.ToLower().Contains("quận") || trimmed.ToLower().Contains("tp")))
                    {
                        address = trimmed;
                    }
                }
            }

            // 2. Fallback: Parse Place Name & Address from URL / HTML title
            if (string.IsNullOrEmpty(address))
            {
                var placeMatch = System.Text.RegularExpressions.Regex.Match(finalUrl, @"/place/([^/@]+)");
                if (placeMatch.Success)
                {
                    var rawPlace = System.Uri.UnescapeDataString(placeMatch.Groups[1].Value.Replace('+', ' '));
                    address = rawPlace;
                }
            }

            // 3. Fallback: Parse Phone number from entire HTML if not found yet
            if (string.IsNullOrEmpty(phone))
            {
                var phoneMatch = System.Text.RegularExpressions.Regex.Match(html, @"(0|\+84)[3|5|7|8|9]\d{8}");
                if (phoneMatch.Success)
                {
                    phone = phoneMatch.Value;
                }
            }

            // 4. Fallback: Parse Hours from entire HTML if not found yet
            if (string.IsNullOrEmpty(openingHours))
            {
                var timeMatch = System.Text.RegularExpressions.Regex.Match(html, @"(\d{1,2}:\d{2})\s*[-–—−]\s*(\d{1,2}:\d{2})");
                if (timeMatch.Success)
                {
                    openingHours = timeMatch.Value;
                }
            }

            // Extract OpeningTime and ClosingTime if openingHours string is found
            if (!string.IsNullOrEmpty(openingHours))
            {
                var timeMatch = System.Text.RegularExpressions.Regex.Match(openingHours, @"(\d{1,2}:\d{2})\s*[-–—−]\s*(\d{1,2}:\d{2})");
                if (timeMatch.Success)
                {
                    if (TimeOnly.TryParse(timeMatch.Groups[1].Value, out var st)) openingTime = st;
                    if (TimeOnly.TryParse(timeMatch.Groups[2].Value, out var et)) closingTime = et;
                }
            }

            if (string.IsNullOrEmpty(address) && string.IsNullOrEmpty(phone) && string.IsNullOrEmpty(openingHours))
            {
                return new ParseMapUrlResponse { Success = false, Message = "Không thể đọc tự động thông tin từ link Google Maps này." };
            }

            return new ParseMapUrlResponse
            {
                Success = true,
                Address = address,
                Phone = phone,
                OpeningHours = openingHours,
                OpeningTime = openingTime,
                ClosingTime = closingTime
            };
        }
        catch (Exception ex)
        {
            return new ParseMapUrlResponse { Success = false, Message = "Lỗi khi đọc link Google Maps: " + ex.Message };
        }
    }
}

