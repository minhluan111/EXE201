using CafeReservation.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace CafeReservation.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
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
            var smtp = _configuration.GetSection("Email");
            var host = smtp["Host"] ?? "smtp.gmail.com";
            var port = int.Parse(smtp["Port"] ?? "587");
            var username = smtp["Username"] ?? string.Empty;
            var password = smtp["Password"] ?? string.Empty;
            var from = smtp["From"] ?? username;
            var fromName = smtp["FromName"] ?? "Yaki Café";

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, from));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = htmlBody };

            using var client = new SmtpClient();
            _logger.LogInformation(
                "SMTP => Host={Host}, Port={Port}, User={User}",
                host,
                port,
                username
            );            
            await client.ConnectAsync(host, port, SecureSocketOptions.SslOnConnect, ct);
            await client.AuthenticateAsync(username, password, ct);
            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            // Non-critical: do not rethrow — email failure must not break the main flow
        }
    }
}
