using CafeReservation.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;

namespace CafeReservation.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly HttpClient _httpClient;
    private readonly IServiceScopeFactory _scopeFactory;

    private string SenderEmail => _configuration["Email:From"] ?? "yakicafe.dev@gmail.com";
    private string DefaultSenderName => _configuration["Email:FromName"] ?? "Yakishime Café";
    private string ApiKey      => _configuration["Email:ApiKey"] ?? string.Empty;
    private string FrontendUrl => _configuration["FrontendUrl"] ?? "http://localhost:5173";

    public EmailService(
        IConfiguration configuration,
        ILogger<EmailService> logger,
        HttpClient httpClient,
        IServiceScopeFactory scopeFactory)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClient;
        _scopeFactory = scopeFactory;
    }

    private async Task<(string Name, string Address)> GetRestaurantInfoAsync(CancellationToken ct)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var infoService = scope.ServiceProvider.GetRequiredService<IInfoService>();
            var info = await infoService.GetRestaurantInfoAsync(CancellationToken.None);
            var name = info?.TenantName ?? DefaultSenderName;
            var address = info?.Address ?? "Việt Nam";
            return (name, address);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not fetch restaurant info for email notification; using defaults.");
            return (DefaultSenderName, "Việt Nam");
        }
    }

    public async Task SendReservationConfirmationAsync(
        string toEmail, string userName, string reservationCode, Guid reservationId,
        DateTime reservationDateTime, string seatingArea, CancellationToken ct = default)
    {
        var (rName, rAddress) = await GetRestaurantInfoAsync(ct);
        var manageLink = $"{FrontendUrl}/booking/history";
        var rescheduleLink = $"{FrontendUrl}/booking/history?reschedule={reservationId}";
        var subject = $"Đặt bàn đã được xác nhận – {reservationCode}";
        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
              <h2 style="color:#b45309">Đặt bàn đã xác nhận 🎉</h2>
              <p>Xin chào <strong>{userName}</strong>,</p>
              <p>Đặt bàn của bạn tại <strong>{rName}</strong> đã được xác nhận bởi nhân viên.</p>
              <ul>
                <li><strong>Mã đặt bàn:</strong> {reservationCode}</li>
                <li><strong>Thời gian:</strong> {reservationDateTime:dd/MM/yyyy HH:mm}</li>
                <li><strong>Khu vực:</strong> {seatingArea}</li>
                <li><strong>Thời lượng:</strong> 60 phút</li>
              </ul>
              <p style="text-align:center;margin:24px 0">
                <a href="{manageLink}" style="background:#b45309;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block;margin:4px">
                  Xem chi tiết đặt bàn
                </a>
                <a href="{rescheduleLink}" style="background:transparent;color:#b45309;border:1px solid #b45309;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block;margin:4px">
                  Đổi lịch
                </a>
              </p>
              <p>Chúng tôi rất mong được phục vụ bạn!</p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
              <p style="color:#999;font-size:12px">{rName} &bull; {rAddress}</p>
            </div>
        """;

        var payload = new
        {
            sender = new { name = rName, email = SenderEmail },
            to = new[] { new { email = toEmail, name = userName } },
            subject,
            htmlContent = html
        };

        await SendEmailInternalAsync(toEmail, userName, subject, html, payload, ct);
    }

    public async Task SendCancellationNotificationAsync(
        string toEmail, string userName, string reservationCode, Guid reservationId, CancellationToken ct = default)
    {
        var (rName, rAddress) = await GetRestaurantInfoAsync(ct);
        var subject = $"Đặt bàn đã bị huỷ – {reservationCode}";
        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
              <h2 style="color:#dc2626">Đặt bàn đã bị huỷ</h2>
              <p>Xin chào <strong>{userName}</strong>,</p>
              <p>Đặt bàn <strong>{reservationCode}</strong> của bạn đã bị huỷ.</p>
              <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
              <p style="color:#999;font-size:12px">{rName} &bull; {rAddress}</p>
            </div>
        """;

        var payload = new
        {
            sender = new { name = rName, email = SenderEmail },
            to = new[] { new { email = toEmail, name = userName } },
            subject,
            htmlContent = html
        };

        await SendEmailInternalAsync(toEmail, userName, subject, html, payload, ct);
    }

    public async Task SendNoShowNotificationAsync(
        string toEmail, string userName, string reservationCode, Guid reservationId, CancellationToken ct = default)
    {
        var (rName, rAddress) = await GetRestaurantInfoAsync(ct);
        var subject = $"Thông báo vắng mặt (No-Show) – {reservationCode}";
        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
              <h2 style="color:#ea580c">Thông báo vắng mặt (No-Show)</h2>
              <p>Xin chào <strong>{userName}</strong>,</p>
              <p>Chúng tôi rất tiếc vì bạn đã không đến đúng giờ cho lịch đặt bàn <strong>{reservationCode}</strong> và lịch đặt bàn đã được chuyển sang trạng thái No-Show theo quy định của quán.</p>
              <p>Hẹn gặp lại bạn trong những lần trải nghiệm tiếp theo!</p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
              <p style="color:#999;font-size:12px">{rName} &bull; {rAddress}</p>
            </div>
        """;

        var payload = new
        {
            sender = new { name = rName, email = SenderEmail },
            to = new[] { new { email = toEmail, name = userName } },
            subject,
            htmlContent = html
        };

        await SendEmailInternalAsync(toEmail, userName, subject, html, payload, ct);
    }

    public async Task SendRescheduleConfirmationAsync(
        string toEmail, string userName, string reservationCode, Guid reservationId,
        DateTime newDateTime, CancellationToken ct = default)
    {
        var (rName, rAddress) = await GetRestaurantInfoAsync(ct);
        var manageLink = $"{FrontendUrl}/booking/history";
        var subject = $"Đặt bàn đã được đổi lịch – {reservationCode}";
        var html = $"""
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
              <p style="color:#999;font-size:12px">{rName} &bull; {rAddress}</p>
            </div>
        """;

        var payload = new
        {
            sender = new { name = rName, email = SenderEmail },
            to = new[] { new { email = toEmail, name = userName } },
            subject,
            htmlContent = html
        };

        await SendEmailInternalAsync(toEmail, userName, subject, html, payload, ct);
    }

    public async Task SendPasswordResetAsync(string toEmail, string userName, string resetLink, CancellationToken ct = default)
    {
        var (rName, rAddress) = await GetRestaurantInfoAsync(ct);
        var subject = "Đặt lại mật khẩu của bạn";
        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
              <h2 style="color:#b45309">Đặt lại mật khẩu – {rName}</h2>
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
              <p style="color:#999;font-size:12px">{rName} &bull; {rAddress}</p>
            </div>
        """;

        var payload = new
        {
            sender = new { name = rName, email = SenderEmail },
            to = new[] { new { email = toEmail, name = userName } },
            subject,
            htmlContent = html
        };

        await SendEmailInternalAsync(toEmail, userName, subject, html, payload, ct);
    }

    private async Task SendViaSmtpAsync(string toEmail, string toName, string subject, string htmlContent, CancellationToken ct)
    {
        var host = _configuration["Email:Smtp:Host"] ?? "smtp.gmail.com";
        var portStr = _configuration["Email:Smtp:Port"] ?? "587";
        int.TryParse(portStr, out var port);
        if (port <= 0) port = 587;

        var username = _configuration["Email:Smtp:Username"] ?? SenderEmail;
        var password = _configuration["Email:Smtp:Password"] ?? string.Empty;
        var enableSsl = _configuration.GetValue<bool>("Email:Smtp:EnableSsl", true);

        using var message = new System.Net.Mail.MailMessage();
        message.From = new System.Net.Mail.MailAddress(SenderEmail, DefaultSenderName);
        message.To.Add(new System.Net.Mail.MailAddress(toEmail, toName));
        message.Subject = subject;
        message.Body = htmlContent;
        message.IsBodyHtml = true;

        using var client = new System.Net.Mail.SmtpClient(host, port)
        {
            Credentials = new System.Net.NetworkCredential(username, password),
            EnableSsl = enableSsl
        };

        await client.SendMailAsync(message, ct);
        _logger.LogInformation("Email sent successfully via SMTP to {ToEmail}", toEmail);
    }

    // Shared sender method supporting Brevo API and standard SMTP fallback
    private async Task SendEmailInternalAsync(string toEmail, string toName, string subject, string htmlContent, object brevoPayload, CancellationToken ct)
    {
        try
        {
            // 1. Try Brevo HTTP API first if ApiKey is configured
            if (!string.IsNullOrEmpty(ApiKey))
            {
                var jsonPayload = JsonSerializer.Serialize(brevoPayload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email")
                {
                    Content = content
                };
                request.Headers.Add("api-key", ApiKey);
                request.Headers.Add("accept", "application/json");

                var response = await _httpClient.SendAsync(request, CancellationToken.None);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Email sent successfully via Brevo API to {ToEmail}", toEmail);
                }
                else
                {
                    var responseContent = await response.Content.ReadAsStringAsync(CancellationToken.None);
                    _logger.LogError("Failed to send email via Brevo API. Status: {Status}, Response: {Response}",
                        response.StatusCode, responseContent);
                }
                return;
            }

            // 2. Fallback to Standard SMTP if Email:Smtp is configured
            var smtpHost = _configuration["Email:Smtp:Host"];
            var smtpPassword = _configuration["Email:Smtp:Password"];
            if (!string.IsNullOrEmpty(smtpHost) && !string.IsNullOrEmpty(smtpPassword))
            {
                await SendViaSmtpAsync(toEmail, toName, subject, htmlContent, ct);
                return;
            }

            _logger.LogWarning("Email sending bypassed. Neither Email:ApiKey nor Email:Smtp credentials are configured in appsettings.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while sending email to {ToEmail}", toEmail);
        }
    }
}

