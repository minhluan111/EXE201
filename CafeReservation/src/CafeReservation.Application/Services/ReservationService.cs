using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using CafeReservation.Domain.Constants;
using CafeReservation.Domain.Entities;
using CafeReservation.Domain.Enums;
using CafeReservation.Domain.Exceptions;
using Mapster;
using Microsoft.Extensions.Logging;
using System.Threading;

namespace CafeReservation.Application.Services;

public class ReservationService : IReservationService
{
    private static readonly SemaphoreSlim _reservationLock = new(1, 1);

    private readonly IReservationRepository _reservationRepository;
    private readonly ISeatingAreaRepository _seatingAreaRepository;
    private readonly IEmailService _emailService;
    private readonly IAvailabilityNotifier _availabilityNotifier;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ReservationService> _logger;

    public ReservationService(
        IReservationRepository reservationRepository,
        ISeatingAreaRepository seatingAreaRepository,
        IEmailService emailService,
        IAvailabilityNotifier availabilityNotifier,
        IUnitOfWork unitOfWork,
        ILogger<ReservationService> logger)
    {
        _reservationRepository = reservationRepository;
        _seatingAreaRepository = seatingAreaRepository;
        _emailService = emailService;
        _availabilityNotifier = availabilityNotifier;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ReservationResponse> CreateAsync(CreateReservationRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.GuestName) ||
            string.IsNullOrWhiteSpace(request.GuestEmail) ||
            string.IsNullOrWhiteSpace(request.GuestPhone))
        {
            throw new DomainException("Guest name, email, and phone are required.");
        }

        if (request.StartTime < AppConstants.OpeningHour || request.StartTime > AppConstants.ClosingHour)
        {
            throw new DomainException($"Reservations are only available between {AppConstants.OpeningHour:HH:mm} and {AppConstants.ClosingHour:HH:mm}.");
        }

        var nowVietnam = DateTime.UtcNow.AddHours(7);
        var reservationDateTime = request.ReservationDate.ToDateTime(request.StartTime);
        if (reservationDateTime < nowVietnam.AddMinutes(30))
        {
            throw new DomainException("Thời gian đặt bàn phải trước khi đến quán ít nhất 30 phút.");
        }

        var area = await _seatingAreaRepository.GetByIdAsync(request.SeatingAreaId, ct)
            ?? throw new NotFoundException(nameof(SeatingArea), request.SeatingAreaId);

        if (!area.IsActive)
            throw new DomainException("The selected seating area is not available.");

        // Validate guest count matches area capacity
        var requiredCapacity = request.GuestCount <= AppConstants.GuestCountRules.SmallGroupMax ? 2 : 4;
        if (!area.TableType.StartsWith(requiredCapacity.ToString()))
            throw new DomainException($"This seating area does not support {request.GuestCount} guest(s). Please select an appropriate area.");

        var startTime = request.StartTime;
        var endTime = request.StartTime.AddMinutes(AppConstants.ReservationDurationMinutes);

        await _reservationLock.WaitAsync(ct);
        try
        {
            // Overbooking prevention via overlap check
            var overlapping = await _reservationRepository.CountOverlappingAsync(
                area.Id, request.ReservationDate, startTime, endTime, null, ct);

            if (overlapping >= area.ReservableTables)
                throw new ConflictException("No tables are available for the selected time slot.");

            if (!string.IsNullOrEmpty(request.TableName))
            {
                var occupied = await GetOccupiedTablesAsync(request.ReservationDate, startTime, ct);
                if (occupied.Contains(request.TableName))
                {
                    throw new ConflictException($"Bàn '{request.TableName}' đã được đặt bởi người khác trong khung giờ này. Vui lòng chọn bàn khác.");
                }
            }

            var reservation = new Reservation
            {
                Id = Guid.NewGuid(),
                ReservationCode = GenerateCode(),
                GuestName = request.GuestName,
                GuestEmail = request.GuestEmail,
                GuestPhone = request.GuestPhone,
                SeatingAreaId = area.Id,
                ReservationDate = request.ReservationDate,
                StartTime = startTime,
                EndTime = endTime,
                GuestCount = request.GuestCount,
                Status = ReservationStatus.Confirmed,
                TableName = request.TableName,
                SpecialNote = request.SpecialNote,
                CreatedAt = DateTime.UtcNow
            };

            await _reservationRepository.AddAsync(reservation, ct);
            await _unitOfWork.SaveChangesAsync(ct);

            _logger.LogInformation("Reservation {Code} created for guest {GuestName}", reservation.ReservationCode, request.GuestName);

            // Notify clients about availability change
            _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);

            // Fire-and-forget email notification
            _ = _emailService.SendReservationConfirmationAsync(
                reservation.GuestEmail, reservation.GuestName, reservation.ReservationCode, reservation.Id,
                reservation.ReservationDate.ToDateTime(reservation.StartTime),
                $"{area.TableType} - {area.Area}");

            reservation.SeatingArea = area;

            return MapToResponse(reservation);
        }
        finally
        {
            _reservationLock.Release();
        }
    }

    public async Task<ReservationResponse> GetByIdAsync(Guid reservationId, CancellationToken ct = default)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId, ct)
            ?? throw new NotFoundException(nameof(Reservation), reservationId);

        return MapToResponse(reservation);
    }

    public async Task<IReadOnlyList<ReservationResponse>> GetMyAsync(string guestEmail, CancellationToken ct = default)
    {
        var reservations = await _reservationRepository.GetByGuestEmailAsync(guestEmail.Trim().ToLowerInvariant(), ct);
        return reservations.Select(MapToResponse).ToList();
    }

    public async Task CancelAsync(Guid reservationId, CancellationToken ct = default)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId, ct)
            ?? throw new NotFoundException(nameof(Reservation), reservationId);

        if (reservation.Status == ReservationStatus.Cancelled)
            throw new DomainException("Reservation is already cancelled.");

        if (reservation.Status == ReservationStatus.Completed)
            throw new DomainException("Completed reservations cannot be cancelled.");

        reservation.Status = ReservationStatus.Cancelled;

        await _reservationRepository.UpdateAsync(reservation, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Reservation {Code} cancelled", reservation.ReservationCode);

        _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);

        _ = _emailService.SendCancellationNotificationAsync(
            reservation.GuestEmail, reservation.GuestName, reservation.ReservationCode, reservation.Id);
    }

    public async Task<ReservationResponse> RescheduleAsync(Guid reservationId, RescheduleReservationRequest request, CancellationToken ct = default)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId, ct)
            ?? throw new NotFoundException(nameof(Reservation), reservationId);

        if (reservation.Status != ReservationStatus.Confirmed)
            throw new DomainException("Only confirmed reservations can be rescheduled.");

        if (request.StartTime < AppConstants.OpeningHour || request.StartTime > AppConstants.ClosingHour)
        {
            throw new DomainException($"Reservations are only available between {AppConstants.OpeningHour:HH:mm} and {AppConstants.ClosingHour:HH:mm}.");
        }

        var nowVietnam = DateTime.UtcNow.AddHours(7);
        var reservationDateTime = request.ReservationDate.ToDateTime(request.StartTime);
        if (reservationDateTime < nowVietnam.AddMinutes(30))
        {
            throw new DomainException("Thời gian đặt bàn phải trước khi đến quán ít nhất 30 phút.");
        }

        var newEnd = request.StartTime.AddMinutes(AppConstants.ReservationDurationMinutes);

        await _reservationLock.WaitAsync(ct);
        try
        {
            var overlapping = await _reservationRepository.CountOverlappingAsync(
                reservation.SeatingAreaId, request.ReservationDate, request.StartTime, newEnd, reservationId, ct);

            if (overlapping >= reservation.SeatingArea.ReservableTables)
                throw new ConflictException("No tables are available for the selected time slot.");

            if (!string.IsNullOrEmpty(reservation.TableName))
            {
                var overlappingReservations = await _reservationRepository.GetOverlappingReservationsAsync(request.ReservationDate, request.StartTime, newEnd, ct);
                var isOccupiedByOther = overlappingReservations.Any(r => r.Id != reservationId && r.TableName == reservation.TableName);
                if (isOccupiedByOther)
                {
                    throw new ConflictException($"Bàn '{reservation.TableName}' đã được đặt bởi người khác trong khung giờ này. Vui lòng chọn bàn khác.");
                }
            }

            reservation.ReservationDate = request.ReservationDate;
            reservation.StartTime = request.StartTime;
            reservation.EndTime = newEnd;

            await _reservationRepository.UpdateAsync(reservation, ct);
            await _unitOfWork.SaveChangesAsync(ct);

            _logger.LogInformation("Reservation {Code} rescheduled", reservation.ReservationCode);

            _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);

            _ = _emailService.SendRescheduleConfirmationAsync(
                reservation.GuestEmail, reservation.GuestName, reservation.ReservationCode, reservation.Id,
                request.ReservationDate.ToDateTime(request.StartTime));

            return MapToResponse(reservation);
        }
        finally
        {
            _reservationLock.Release();
        }
    }

    public async Task<PagedResult<ReservationResponse>> GetAllAsync(ReservationFilterRequest filter, CancellationToken ct = default)
    {
        var (items, total) = await _reservationRepository.GetFilteredAsync(
            filter.Date, filter.Status, filter.Search, filter.Page, filter.PageSize, ct);

        return new PagedResult<ReservationResponse>
        {
            Items = items.Select(MapToResponse).ToList(),
            TotalCount = total,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<ReservationResponse> UpdateStatusAsync(Guid reservationId, UpdateReservationStatusRequest request, CancellationToken ct = default)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId, ct)
            ?? throw new NotFoundException(nameof(Reservation), reservationId);

        if (!Enum.TryParse<ReservationStatus>(request.Status, ignoreCase: true, out var newStatus))
            throw new DomainException($"Invalid status '{request.Status}'. Valid values: Confirmed, Cancelled, Completed, NoShow, Seated.");

        reservation.Status = newStatus;
        await _reservationRepository.UpdateAsync(reservation, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);

        _logger.LogInformation("Reservation {Code} status updated to {Status}", reservation.ReservationCode, newStatus);
        return MapToResponse(reservation);
    }

    public async Task<DashboardStatsResponse> GetDashboardStatsAsync(CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var total = await _reservationRepository.CountTotalAsync(ct);
        var todayCount = await _reservationRepository.CountTodayAsync(ct);
        var confirmed = await _reservationRepository.CountByStatusAsync(ReservationStatus.Confirmed, ct);
        var cancelled = await _reservationRepository.CountByStatusAsync(ReservationStatus.Cancelled, ct);
        var completed = await _reservationRepository.CountByStatusAsync(ReservationStatus.Completed, ct);
        var noShow = await _reservationRepository.CountByStatusAsync(ReservationStatus.NoShow, ct);

        return new DashboardStatsResponse
        {
            TotalReservations = total,
            TodayReservations = todayCount,
            ConfirmedReservations = confirmed,
            CancelledReservations = cancelled,
            CompletedReservations = completed,
            NoShowReservations = noShow
        };
    }

    public async Task<IReadOnlyList<AvailabilityResponse>> GetAvailabilityAsync(AvailabilityRequest request, CancellationToken ct = default)
    {
        var requiredCapacity = request.GuestCount <= AppConstants.GuestCountRules.SmallGroupMax ? 2 : 4;
        var areas = await _seatingAreaRepository.GetByTableCapacityAsync(requiredCapacity, ct);

        var result = new List<AvailabilityResponse>();

        // Generate slots from 08:00 to 20:00 at 60-minute intervals
        var slots = GenerateTimeSlots();

        foreach (var area in areas)
        {
            var available = new List<TimeSlot>();

            foreach (var (start, end) in slots)
            {
                var count = await _reservationRepository.CountOverlappingAsync(
                    area.Id, request.Date, start, end, null, ct);

                if (count < area.ReservableTables)
                    available.Add(new TimeSlot { StartTime = start, EndTime = end });
            }

            result.Add(new AvailabilityResponse
            {
                SeatingAreaId = area.Id,
                TableType = area.TableType,
                Area = area.Area,
                PreviewImage = area.PreviewImage,
                Description = area.Description,
                AvailableSlots = available
            });
        }

        return result;
    }

    // --- helpers ---

    private static string GenerateCode()
    {
        var number = Random.Shared.Next(1000, 9999);
        return $"{AppConstants.ReservationCodePrefix}-{number}";
    }

    private static IEnumerable<(TimeOnly Start, TimeOnly End)> GenerateTimeSlots()
    {
        var current = new TimeOnly(8, 0);
        var limit = new TimeOnly(20, 0);

        while (current <= limit)
        {
            var end = current.AddMinutes(AppConstants.ReservationDurationMinutes);
            yield return (current, end);
            current = current.AddMinutes(60);
        }
    }

    private static ReservationResponse MapToResponse(Reservation r) => new()
    {
        Id = r.Id,
        ReservationCode = r.ReservationCode,
        GuestName = r.GuestName,
        GuestEmail = r.GuestEmail,
        GuestPhone = r.GuestPhone,
        SeatingAreaId = r.SeatingAreaId,
        SeatingAreaTableType = r.SeatingArea?.TableType ?? string.Empty,
        SeatingAreaArea = r.SeatingArea?.Area ?? string.Empty,
        ReservationDate = r.ReservationDate,
        StartTime = r.StartTime,
        EndTime = r.EndTime,
        GuestCount = r.GuestCount,
        Status = r.Status.ToString(),
        TableName = r.TableName,
        SpecialNote = r.SpecialNote,
        CreatedAt = r.CreatedAt
    };

    public async Task<IReadOnlyList<string>> GetOccupiedTablesAsync(DateOnly date, TimeOnly time, CancellationToken ct = default)
    {
        var end = time.AddMinutes(AppConstants.ReservationDurationMinutes);
        var overlapping = await _reservationRepository.GetOverlappingReservationsAsync(date, time, end, ct);
        
        return overlapping
            .Where(r => !string.IsNullOrEmpty(r.TableName))
            .Select(r => r.TableName!)
            .ToList();
    }
}
