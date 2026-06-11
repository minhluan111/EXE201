using CafeReservation.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace CafeReservation.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly HttpClient _httpClient;

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
            var apiKey = emailConfig["ApiKey"];
            var fromEmail = emailConfig["From"] ?? "yakicafe.dev@gmail.com";
            var fromName = emailConfig["FromName"] ?? "Yaki Café";

            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogWarning("Email sending bypassed. ApiKey is missing in Email configuration.");
                return;
            }

            var payload = new
            {
                sender = new { name = fromName, email = fromEmail },
                to = new[] { new { email = toEmail, name = toName } },
                subject = subject,
                htmlContent = htmlBody
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email")
            {
                Content = content
            };
            request.Headers.Add("api-key", apiKey);
            request.Headers.Add("accept", "application/json");

            var response = await _httpClient.SendAsync(request, ct);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Successfully sent email via Brevo HTTP API to {Email}", toEmail);
            }
            else
            {
                var responseContent = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("Failed to send email to {Email}. Status: {Status}, Response: {Response}", 
                    toEmail, response.StatusCode, responseContent);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
        }
    }
}
