using CafeReservation.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;

namespace CafeReservation.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly HttpClient _httpClient;

    private string SenderEmail => _configuration["Email:From"] ?? "yakicafe.dev@gmail.com";
    private string SenderName  => _configuration["Email:FromName"] ?? "Yakishime Café";
    private string ApiKey      => _configuration["Email:ApiKey"] ?? string.Empty;
    private string FrontendUrl => _configuration["FrontendUrl"] ?? "http://localhost:5173";

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger, HttpClient httpClient)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClient;
    }

    public async Task SendReservationConfirmationAsync(
        string toEmail, string userName, string reservationCode, Guid reservationId,
        DateTime reservationDateTime, string seatingArea, CancellationToken ct = default)
    {
        var manageLink = $"{FrontendUrl}/booking/{reservationId}";

        var payload = new
        {
            sender = new { name = SenderName, email = SenderEmail },
            to = new[] { new { email = toEmail, name = userName } },
            subject = $"[Yakishime] Đặt bàn đã được xác nhận – {reservationCode}",
            htmlContent = $"""
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
                  <h2 style="color:#b45309">Đặt bàn đã xác nhận 🎉</h2>
                  <p>Xin chào <strong>{userName}</strong>,</p>
                  <p>Đặt bàn của bạn tại <strong>Yakishime Café</strong> đã được xác nhận bởi nhân viên.</p>
                  <ul>
                    <li><strong>Mã đặt bàn:</strong> {reservationCode}</li>
                    <li><strong>Thời gian:</strong> {reservationDateTime:dd/MM/yyyy HH:mm}</li>
                    <li><strong>Khu vực:</strong> {seatingArea}</li>
                    <li><strong>Thời lượng:</strong> 60 phút</li>
                  </ul>
                  <p style="text-align:center;margin:24px 0">
                    <a href="{manageLink}" style="background:#b45309;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none">
                      Xem chi tiết đặt bàn
                    </a>
                  </p>
                  <p>Chúng tôi rất mong được phục vụ bạn!</p>
                  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
                  <p style="color:#999;font-size:12px">Yakishime Café &bull; Cần Thơ, Việt Nam</p>
                </div>
            """
        };

        await SendAsync(payload, ct);
    }

    public async Task SendCancellationNotificationAsync(
        string toEmail, string userName, string reservationCode, Guid reservationId, CancellationToken ct = default)
    {
        var payload = new
        {
            sender = new { name = SenderName, email = SenderEmail },
            to = new[] { new { email = toEmail, name = userName } },
            subject = $"[Yakishime] Đặt bàn đã bị huỷ – {reservationCode}",
            htmlContent = $"""
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
                  <h2 style="color:#dc2626">Đặt bàn đã bị huỷ</h2>
                  <p>Xin chào <strong>{userName}</strong>,</p>
                  <p>Đặt bàn <strong>{reservationCode}</strong> của bạn đã bị huỷ.</p>
                  <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
                  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
                  <p style="color:#999;font-size:12px">Yakishime Café &bull; Cần Thơ, Việt Nam</p>
                </div>
            """
        };

        await SendAsync(payload, ct);
    }

    public async Task SendRescheduleConfirmationAsync(
        string toEmail, string userName, string reservationCode, Guid reservationId,
        DateTime newDateTime, CancellationToken ct = default)
    {
        var manageLink = $"{FrontendUrl}/booking/{reservationId}";

        var payload = new
        {
            sender = new { name = SenderName, email = SenderEmail },
            to = new[] { new { email = toEmail, name = userName } },
            subject = $"[Yakishime] Đặt bàn đã được đổi lịch – {reservationCode}",
            htmlContent = $"""
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
                  <h2 style="color:#b45309">Đổi lịch đặt bàn</h2>
                  <p>Xin chào <strong>{userName}</strong>,</p>
                  <p>Đặt bàn <strong>{reservationCode}</strong> của bạn đã được đổi lịch thành công.</p>
                  <ul>
                    <li><strong>Thời gian mới:</strong> {newDateTime:dd/MM/yyyy HH:mm}</li>
                  </ul>
                  <p style="text-align:center;margin:24px 0">
                    <a href="{manageLink}" style="background:#b45309;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none">
                      Xem chi tiết
                    </a>
                  </p>
                  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
                  <p style="color:#999;font-size:12px">Yakishime Café &bull; Cần Thơ, Việt Nam</p>
                </div>
            """
        };

        await SendAsync(payload, ct);
    }

    public async Task SendPasswordResetAsync(string toEmail, string userName, string resetLink, CancellationToken ct = default)
    {
        var payload = new
        {
            sender = new { name = SenderName, email = SenderEmail },
            to = new[] { new { email = toEmail, name = userName } },
            subject = "[Yakishime] Đặt lại mật khẩu của bạn",
            htmlContent = $"""
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
                  <h2 style="color:#b45309">Đặt lại mật khẩu – Yakishime Café</h2>
                  <p>Xin chào <strong>{userName}</strong>,</p>
                  <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                  <p>Nhấn vào nút bên dưới để đặt lại mật khẩu. Link này có hiệu lực trong <strong>10 phút</strong>.</p>
                  <p style="text-align:center;margin:32px 0">
                    <a href="{resetLink}" style="background:#b45309;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px">
                      Đặt lại mật khẩu
                    </a>
                  </p>
                  <p style="color:#666;font-size:13px">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
                  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
                  <p style="color:#999;font-size:12px">Yakishime Café &bull; Cần Thơ, Việt Nam</p>
                </div>
            """
        };

        await SendAsync(payload, ct);
    }

    // Shared HTTP sender
    private async Task SendAsync(object payload, CancellationToken ct)
    {
        try
        {
            if (string.IsNullOrEmpty(ApiKey))
            {
                _logger.LogWarning("Email sending bypassed. ApiKey is missing in Email configuration.");
                return;
            }

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email")
            {
                Content = content
            };
            request.Headers.Add("api-key", ApiKey);
            request.Headers.Add("accept", "application/json");

            var response = await _httpClient.SendAsync(request, ct);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Email sent successfully via Brevo");
            }
            else
            {
                var responseContent = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("Failed to send email. Status: {Status}, Response: {Response}",
                    response.StatusCode, responseContent);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while sending email");
        }
    }
}
