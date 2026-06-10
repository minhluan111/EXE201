using System.Text;
using System.Text.Json;
using CafeReservation.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CafeReservation.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly IHttpClientFactory _httpClientFactory;

    // Thay đổi Constructor để nhận thêm IHttpClientFactory
    public EmailService(IConfiguration configuration, ILogger<EmailService> logger, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    public async Task SendReservationConfirmationAsync(
        string toEmail, string userName, string reservationCode, Guid reservationId,
        DateTime reservationDateTime, string seatingArea, CancellationToken ct = default)
    {
        var subject = $"[Yaki Café] Reservation Confirmed – {reservationCode}";
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
        var manageLink = $"{frontendUrl}/booking/{reservationId}";

        var body = $"""
            <h2>Reservation Confirmed 🎉</h2>
            <p>Dear {userName},</p>
            <p>Your reservation at <strong>Yaki Café</strong> has been confirmed.</p>
            <ul>
                <li><strong>Code:</strong> {reservationCode}</li>
                <li><strong>Date &amp; Time:</strong> {reservationDateTime:dddd, dd MMMM yyyy – HH:mm}</li>
                <li><strong>Area:</strong> {seatingArea}</li>
                <li><strong>Duration:</strong> 60 minutes</li>
            </ul>
            <p>
                <a href="{manageLink}" style="display:inline-block;padding:10px 20px;background-color:#4CAF50;color:white;text-decoration:none;border-radius:5px;">
                    Manage Your Booking
                </a>
            </p>
            <p>We look forward to seeing you!</p>
            """;

        await SendAsync(toEmail, userName, subject, body, ct);
    }

    public async Task SendCancellationNotificationAsync(
        string toEmail, string userName, string reservationCode, Guid reservationId, CancellationToken ct = default)
    {
        var subject = $"[Yaki Café] Reservation Cancelled – {reservationCode}";
        var body = $"""
            <h2>Reservation Cancelled</h2>
            <p>Dear {userName},</p>
            <p>Your reservation <strong>{reservationCode}</strong> has been cancelled.</p>
            <p>If you did not request this cancellation, please contact us immediately.</p>
            """;

        await SendAsync(toEmail, userName, subject, body, ct);
    }

    public async Task SendRescheduleConfirmationAsync(
        string toEmail, string userName, string reservationCode, Guid reservationId,
        DateTime newDateTime, CancellationToken ct = default)
    {
        var subject = $"[Yaki Café] Reservation Rescheduled – {reservationCode}";
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
        var manageLink = $"{frontendUrl}/booking/{reservationId}";

        var body = $"""
            <h2>Reservation Rescheduled</h2>
            <p>Dear {userName},</p>
            <p>Your reservation <strong>{reservationCode}</strong> has been rescheduled.</p>
            <ul>
                <li><strong>New Date &amp; Time:</strong> {newDateTime:dddd, dd MMMM yyyy – HH:mm}</li>
            </ul>
            <p>
                <a href="{manageLink}" style="display:inline-block;padding:10px 20px;background-color:#4CAF50;color:white;text-decoration:none;border-radius:5px;">
                    View Booking
                </a>
            </p>
            """;

        await SendAsync(toEmail, userName, subject, body, ct);
    }
    
    private async Task SendAsync(string toEmail, string toName, string subject, string htmlBody, CancellationToken ct)
    {
        try
        {
            var emailConfig = _configuration.GetSection("Email");
            var apiKey = emailConfig["ApiKey"] ?? string.Empty;
            var fromEmail = emailConfig["From"] ?? string.Empty;
            var fromName = emailConfig["FromName"] ?? "Yaki Café";

            // Tạo Payload JSON theo đúng đặc tả API của Brevo
            var payload = new
            {
                sender = new { name = fromName, email = fromEmail },
                to = new[] { new { email = toEmail, name = toName } },
                subject = subject,
                htmlContent = htmlBody
            };

            var jsonString = JsonSerializer.Serialize(payload);
            var httpContent = new StringContent(jsonString, Encoding.UTF8, "application/json");

            // Khởi tạo client thông qua factory
            using var client = _httpClientFactory.CreateClient();
            
            // Đính kèm API Key vào Header theo chuẩn của Brevo
            client.DefaultRequestHeaders.Clear();
            client.DefaultRequestHeaders.Add("api-key", apiKey);

            _logger.LogInformation("Sending email via Brevo API to {Email} with Subject: {Subject}", toEmail, subject);

            // Gửi qua HTTPS
            var response = await client.PostAsync("https://api.brevo.com/v3/smtp/email", httpContent, ct);

            if (!response.IsSuccessStatusCode)
            {
                var errorResponse = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("Brevo API returned error: {StatusCode} - {Error}", response.StatusCode, errorResponse);
            }
            else
            {
                _logger.LogInformation("Email sent successfully via Brevo API to {Email}", toEmail);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email via Brevo API to {Email}", toEmail);
            // Giữ nguyên logic cũ: Không rethrow ngoại lệ để tránh crash luồng chính
        }
    }
}
