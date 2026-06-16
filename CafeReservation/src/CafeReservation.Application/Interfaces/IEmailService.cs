namespace CafeReservation.Application.Interfaces;

public interface IEmailService
{
    Task SendReservationConfirmationAsync(string toEmail, string userName, string reservationCode, Guid reservationId, DateTime reservationDateTime, string seatingArea, CancellationToken ct = default);
    Task SendCancellationNotificationAsync(string toEmail, string userName, string reservationCode, Guid reservationId, CancellationToken ct = default);
    Task SendRescheduleConfirmationAsync(string toEmail, string userName, string reservationCode, Guid reservationId, DateTime newDateTime, CancellationToken ct = default);
    Task SendPasswordResetAsync(string toEmail, string userName, string resetLink, CancellationToken ct = default);
}
