using FluentValidation;
using CafeReservation.Application.DTOs;
using CafeReservation.Domain.Constants;

namespace CafeReservation.Application.Validators;

public class CreateReservationRequestValidator : AbstractValidator<CreateReservationRequest>
{
    public CreateReservationRequestValidator()
    {
        RuleFor(x => x.SeatingAreaId)
            .NotEmpty().WithMessage("Seating area is required.");

        RuleFor(x => x.ReservationDate)
            .Must(date => date >= DateOnly.FromDateTime(DateTime.UtcNow.AddHours(7).Date))
            .WithMessage("Reservation date must be today or in the future.");


        RuleFor(x => x.GuestCount)
            .InclusiveBetween(1, AppConstants.GuestCountRules.LargeGroupMax)
            .WithMessage($"Guest count must be between 1 and {AppConstants.GuestCountRules.LargeGroupMax}.");

        RuleFor(x => x.SpecialNote)
            .MaximumLength(500).WithMessage("Special note must not exceed 500 characters.")
            .When(x => x.SpecialNote is not null);

        RuleFor(x => x.GuestEmail)
            .EmailAddress().WithMessage("Guest email must be a valid email address.")
            .When(x => !string.IsNullOrWhiteSpace(x.GuestEmail));

        RuleFor(x => x.GuestName)
            .MaximumLength(100).WithMessage("Guest name must not exceed 100 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.GuestName));

        RuleFor(x => x.GuestPhone)
            .MaximumLength(20).WithMessage("Guest phone must not exceed 20 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.GuestPhone));
    }
}

public class RescheduleReservationRequestValidator : AbstractValidator<RescheduleReservationRequest>
{
    public RescheduleReservationRequestValidator()
    {
        RuleFor(x => x.ReservationDate)
            .Must(date => date >= DateOnly.FromDateTime(DateTime.UtcNow.AddHours(7).Date))
            .WithMessage("Reservation date must be today or in the future.");

    }
}
