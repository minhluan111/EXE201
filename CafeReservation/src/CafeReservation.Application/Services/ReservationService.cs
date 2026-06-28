using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using CafeReservation.Domain.Constants;
using CafeReservation.Domain.Entities;
using CafeReservation.Domain.Enums;
using CafeReservation.Domain.Exceptions;
using Mapster;
using Microsoft.Extensions.Logging;

namespace CafeReservation.Application.Services;

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _reservationRepository;
    private readonly ISeatingAreaRepository _seatingAreaRepository;
    private readonly IEmailService _emailService;
    private readonly IAvailabilityNotifier _availabilityNotifier;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ReservationService> _logger;
    private readonly IInfoService _infoService;

    public ReservationService(
        IReservationRepository reservationRepository,
        ISeatingAreaRepository seatingAreaRepository,
        IEmailService emailService,
        IAvailabilityNotifier availabilityNotifier,
        IUnitOfWork unitOfWork,
        ILogger<ReservationService> logger,
        IInfoService infoService)
    {
        _reservationRepository = reservationRepository;
        _seatingAreaRepository = seatingAreaRepository;
        _emailService = emailService;
        _availabilityNotifier = availabilityNotifier;
        _unitOfWork = unitOfWork;
        _logger = logger;
        _infoService = infoService;
    }

    public async Task<ReservationResponse> CreateAsync(CreateReservationRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.GuestName) ||
            string.IsNullOrWhiteSpace(request.GuestEmail) ||
            string.IsNullOrWhiteSpace(request.GuestPhone))
        {
            throw new DomainException("Guest name, email, and phone are required.");
        }

        var endTime = request.StartTime.AddMinutes(AppConstants.ReservationDurationMinutes);
        var info = await _infoService.GetRestaurantInfoAsync(ct);
        var openingHours = info?.OpeningHours ?? string.Empty;
        var intervals = CafeReservation.Application.Helpers.OpeningHoursParser.Parse(openingHours);

        if (!CafeReservation.Application.Helpers.OpeningHoursParser.IsWithinOpeningHours(request.StartTime, endTime, intervals))
        {
            throw new DomainException($"Reservations are only available between: {openingHours}");
        }

        var nowVietnam = DateTime.UtcNow.AddHours(7);
        var reservationDateTime = request.ReservationDate.ToDateTime(request.StartTime);
        if (reservationDateTime < nowVietnam.AddMinutes(30))
        {
            throw new DomainException("Reservations must be made at least 30 minutes before arrival at the restaurant.");
        }

        await _unitOfWork.BeginTransactionAsync(ct);
        try
        {
            var area = await _seatingAreaRepository.GetByIdForUpdateAsync(request.SeatingAreaId, ct)
                ?? throw new NotFoundException(nameof(SeatingArea), request.SeatingAreaId);

            if (!area.IsActive)
                throw new DomainException("The selected seating area is not available.");

            var requiredCapacity = request.GuestCount <= AppConstants.GuestCountRules.SmallGroupMax ? 2 : 4;
            if (!area.TableType.StartsWith(requiredCapacity.ToString()))
                throw new DomainException($"This seating area does not support {request.GuestCount} guest(s). Please select an appropriate area.");

            var startTime = request.StartTime;

            var overlapping = await _reservationRepository.CountOverlappingAsync(
                area.Id, request.ReservationDate, startTime, endTime, null, ct);

            if (overlapping >= area.ReservableTables)
                throw new ConflictException("No tables are available for the selected time slot.");

            if (!string.IsNullOrEmpty(request.TableName))
            {
                var isTableOccupied = await _reservationRepository.AnyOverlappingTableAsync(
                    request.TableName, request.ReservationDate, startTime, endTime, null, ct);
                if (isTableOccupied)
                    throw new ConflictException($"Bàn {request.TableName} đã được đặt trong khoảng thời gian này.");
            }

            var reservation = new Reservation
            {
                Id = Guid.NewGuid(),
                ReservationCode = GenerateCode(info?.TenantName),
                GuestName = request.GuestName,
                GuestEmail = request.GuestEmail,
                GuestPhone = request.GuestPhone,
                SeatingAreaId = area.Id,
                ReservationDate = request.ReservationDate,
                StartTime = startTime,
                EndTime = endTime,
                GuestCount = request.GuestCount,
                Status = ReservationStatus.Reserved,   // always starts as Reserved
                TableName = request.TableName,
                SpecialNote = request.SpecialNote,
                CreatedAt = DateTime.UtcNow
            };

            await _reservationRepository.AddAsync(reservation, ct);
            await _unitOfWork.SaveChangesAsync(ct);
            await _unitOfWork.CommitAsync(ct);

            _logger.LogInformation("Reservation {Code} created (Reserved) for guest {GuestName}",
                reservation.ReservationCode, request.GuestName);

            // Notify availability change – no email until Staff confirms
            _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);

            reservation.SeatingArea = area;
            return MapToResponse(reservation);
        }
        catch
        {
            await _unitOfWork.RollbackAsync(ct);
            throw;
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

        if (reservation.Status == ReservationStatus.CheckedIn)
            throw new DomainException("Checked-in reservations cannot be cancelled.");

        reservation.Status = ReservationStatus.Cancelled;

        await _reservationRepository.UpdateAsync(reservation, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Reservation {Code} cancelled", reservation.ReservationCode);

        _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);

        // Send cancellation email (regardless of who cancelled)
        _ = _emailService.SendCancellationNotificationAsync(
            reservation.GuestEmail, reservation.GuestName, reservation.ReservationCode, reservation.Id);
    }

    public async Task<ReservationResponse> RescheduleAsync(Guid reservationId, RescheduleReservationRequest request, CancellationToken ct = default)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId, ct)
            ?? throw new NotFoundException(nameof(Reservation), reservationId);

        // Allow reschedule from either Reserved or Confirmed
        if (reservation.Status != ReservationStatus.Reserved && reservation.Status != ReservationStatus.Confirmed)
            throw new DomainException("Only Reserved or Confirmed reservations can be rescheduled.");

        var newEnd = request.StartTime.AddMinutes(AppConstants.ReservationDurationMinutes);
        var info = await _infoService.GetRestaurantInfoAsync(ct);
        var openingHours = info?.OpeningHours ?? string.Empty;
        var intervals = CafeReservation.Application.Helpers.OpeningHoursParser.Parse(openingHours);

        if (!CafeReservation.Application.Helpers.OpeningHoursParser.IsWithinOpeningHours(request.StartTime, newEnd, intervals))
        {
            throw new DomainException($"Reservations are only available between: {openingHours}");
        }

        var nowVietnam = DateTime.UtcNow.AddHours(7);
        var reservationDateTime = request.ReservationDate.ToDateTime(request.StartTime);
        if (reservationDateTime < nowVietnam.AddMinutes(30))
        {
            throw new DomainException("Reservations must be made at least 30 minutes before arrival at the restaurant.");
        }



        await _unitOfWork.BeginTransactionAsync(ct);
        try
        {
            var area = await _seatingAreaRepository.GetByIdForUpdateAsync(reservation.SeatingAreaId, ct)
                ?? throw new NotFoundException(nameof(SeatingArea), reservation.SeatingAreaId);

            var overlapping = await _reservationRepository.CountOverlappingAsync(
                reservation.SeatingAreaId, request.ReservationDate, request.StartTime, newEnd, reservationId, ct);

            if (overlapping >= area.ReservableTables)
                throw new ConflictException("No tables are available for the selected time slot.");

            if (!string.IsNullOrEmpty(reservation.TableName))
            {
                var isTableOccupied = await _reservationRepository.AnyOverlappingTableAsync(
                    reservation.TableName, request.ReservationDate, request.StartTime, newEnd, reservationId, ct);
                if (isTableOccupied)
                    throw new ConflictException($"Bàn {reservation.TableName} đã được đặt trong khoảng thời gian này.");
            }

            reservation.ReservationDate = request.ReservationDate;
            reservation.StartTime = request.StartTime;
            reservation.EndTime = newEnd;

            // After reschedule, always go back to Reserved – Staff must re-confirm
            reservation.Status = ReservationStatus.Reserved;
            reservation.ConfirmedAt = null;
            reservation.ConfirmedBy = null;

            await _reservationRepository.UpdateAsync(reservation, ct);
            await _unitOfWork.SaveChangesAsync(ct);
            await _unitOfWork.CommitAsync(ct);

            _logger.LogInformation("Reservation {Code} rescheduled → back to Reserved", reservation.ReservationCode);

            _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);
            // No email sent on reschedule – wait for Staff to confirm again

            reservation.SeatingArea = area;
            return MapToResponse(reservation);
        }
        catch
        {
            await _unitOfWork.RollbackAsync(ct);
            throw;
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
            throw new DomainException($"Invalid status '{request.Status}'. Valid values: Confirmed, Cancelled, Completed, NoShow, Reserved, CheckedIn.");

        reservation.Status = newStatus;
        await _reservationRepository.UpdateAsync(reservation, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);

        _logger.LogInformation("Reservation {Code} status updated to {Status}", reservation.ReservationCode, newStatus);
        return MapToResponse(reservation);
    }

    public async Task<DashboardStatsResponse> GetDashboardStatsAsync(CancellationToken ct = default)
    {
        var total      = await _reservationRepository.CountTotalAsync(ct);
        var todayCount = await _reservationRepository.CountTodayAsync(ct);
        var reserved   = await _reservationRepository.CountByStatusAsync(ReservationStatus.Reserved, ct);
        var confirmed  = await _reservationRepository.CountByStatusAsync(ReservationStatus.Confirmed, ct);
        var cancelled  = await _reservationRepository.CountByStatusAsync(ReservationStatus.Cancelled, ct);
        var completed  = await _reservationRepository.CountByStatusAsync(ReservationStatus.Completed, ct);
        var checkedIn  = await _reservationRepository.CountByStatusAsync(ReservationStatus.CheckedIn, ct);
        var noShow     = await _reservationRepository.CountByStatusAsync(ReservationStatus.NoShow, ct);

        return new DashboardStatsResponse
        {
            TotalReservations    = total,
            TodayReservations    = todayCount,
            ReservedReservations = reserved,
            ConfirmedReservations = confirmed,
            CancelledReservations = cancelled,
            CompletedReservations = completed,
            CheckedInReservations = checkedIn,
            NoShowReservations   = noShow
        };
    }

    public async Task<IReadOnlyList<AvailabilityResponse>> GetAvailabilityAsync(AvailabilityRequest request, CancellationToken ct = default)
    {
        var requiredCapacity = request.GuestCount <= AppConstants.GuestCountRules.SmallGroupMax ? 2 : 4;
        var areas = await _seatingAreaRepository.GetByTableCapacityAsync(requiredCapacity, ct);

        var info = await _infoService.GetRestaurantInfoAsync(ct);
        var openingHours = info?.OpeningHours ?? string.Empty;
        var intervals = CafeReservation.Application.Helpers.OpeningHoursParser.Parse(openingHours);
        var slots = GenerateTimeSlots(intervals).ToList();

        // ── Load TẤT CẢ reservations active của ngày này bằng 1 DB query ─────────
        // Trước đây: N areas × M timeslots = N×M DB queries riêng lẻ (có thể lên đến 56 queries).
        // Bây giờ: 1 query duy nhất, tính overlap trong bộ nhớ.
        var activeReservations = await _reservationRepository.GetActiveReservationsForDateAsync(request.Date, ct);

        // Group theo seating area để tra cứu nhanh
        var reservationsByArea = activeReservations
            .GroupBy(r => r.SeatingAreaId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var result = new List<AvailabilityResponse>();

        foreach (var area in areas)
        {
            var areaReservations = reservationsByArea.GetValueOrDefault(area.Id) ?? [];
            var available = new List<TimeSlot>();

            foreach (var (start, end) in slots)
            {
                // Đếm overlap trong memory — không cần thêm DB query
                var count = areaReservations.Count(r =>
                    ((r.Status == ReservationStatus.Confirmed || r.Status == ReservationStatus.Reserved) && start < r.EndTime && end > r.StartTime) ||
                    (r.Status == ReservationStatus.CheckedIn && end > r.StartTime)
                );

                if (count < area.ReservableTables)
                    available.Add(new TimeSlot { StartTime = start, EndTime = end });
            }

            result.Add(new AvailabilityResponse
            {
                SeatingAreaId  = area.Id,
                TableType      = area.TableType,
                Area           = area.Area,
                PreviewImage   = area.PreviewImage,
                Description    = area.Description,
                AvailableSlots = available
            });
        }

        return result;
    }

    // ── Staff actions ─────────────────────────────────────────────────────────

    public async Task<ReservationResponse> ConfirmAsync(Guid reservationId, string staffEmail, CancellationToken ct = default)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId, ct)
            ?? throw new NotFoundException(nameof(Reservation), reservationId);

        if (reservation.Status != ReservationStatus.Reserved)
            throw new DomainException("Only Reserved reservations can be confirmed.");

        reservation.Status      = ReservationStatus.Confirmed;
        reservation.ConfirmedAt = DateTime.UtcNow;
        reservation.ConfirmedBy = staffEmail;

        // Tự động kéo dài thời gian giữ bàn lên 120 phú
        reservation.EndTime = reservation.StartTime.AddMinutes(120);
        await _reservationRepository.UpdateAsync(reservation, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Reservation {Code} confirmed by {Staff}", reservation.ReservationCode, staffEmail);

        _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);

        // Send confirmation email to guest
        _ = _emailService.SendReservationConfirmationAsync(
            reservation.GuestEmail, reservation.GuestName, reservation.ReservationCode, reservation.Id,
            reservation.ReservationDate.ToDateTime(reservation.StartTime),
            $"{reservation.SeatingArea?.TableType} - {reservation.SeatingArea?.Area}");

        return MapToResponse(reservation);
    }

    public async Task<ReservationResponse> RejectAsync(Guid reservationId, string staffEmail, CancellationToken ct = default)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId, ct)
            ?? throw new NotFoundException(nameof(Reservation), reservationId);

        if (reservation.Status != ReservationStatus.Reserved)
            throw new DomainException("Only Reserved reservations can be rejected.");

        reservation.Status = ReservationStatus.Cancelled;

        await _reservationRepository.UpdateAsync(reservation, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Reservation {Code} rejected by {Staff}", reservation.ReservationCode, staffEmail);

        _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);

        // Send cancellation email to guest
        _ = _emailService.SendCancellationNotificationAsync(
            reservation.GuestEmail, reservation.GuestName, reservation.ReservationCode, reservation.Id);

        return MapToResponse(reservation);
    }

    public async Task<ReservationResponse> CheckInAsync(Guid reservationId, CheckInRequest request, string staffEmail, CancellationToken ct = default)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId, ct)
            ?? throw new NotFoundException(nameof(Reservation), reservationId);

        if (reservation.Status != ReservationStatus.Confirmed)
            throw new DomainException("Only Confirmed reservations can be checked in.");

        reservation.Status          = ReservationStatus.CheckedIn;
        reservation.CheckedInAt     = DateTime.UtcNow;
        reservation.CheckedInBy     = staffEmail;
        reservation.CheckInImageUrl = request.CheckInImageUrl;
        reservation.CheckInNote     = request.CheckInNote;

        await _reservationRepository.UpdateAsync(reservation, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Reservation {Code} checked in by {Staff}", reservation.ReservationCode, staffEmail);

        _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);

        return MapToResponse(reservation);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private static string GenerateCode(string? tenantName)
    {
        var prefix = "RES"; // Mặc định nếu không có tên
        if (!string.IsNullOrWhiteSpace(tenantName))
        {
            // Cố gắng tách theo từ
            var words = tenantName.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            if (words.Length >= 3)
            {
                // Lấy 3 chữ cái đầu của 3 từ đầu tiên (VD: Cafe Sam House -> CSH)
                prefix = $"{words[0][0]}{words[1][0]}{words[2][0]}".ToUpper();
            }
            else
            {
                // Lấy 3 chữ cái/số đầu tiên của tên quán (VD: Yaki Cafe -> YAK)
                var clean = new string(tenantName.Where(char.IsLetterOrDigit).ToArray()).ToUpper();
                prefix = clean.Length >= 3 ? clean.Substring(0, 3) : clean.PadRight(3, 'X');
            }
        }

        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var randomSuffix = new string(Enumerable.Repeat(chars, 4)
            .Select(s => s[Random.Shared.Next(s.Length)]).ToArray());

        return $"{prefix}-{randomSuffix}";
    }

    private static IEnumerable<(TimeOnly Start, TimeOnly End)> GenerateTimeSlots(IReadOnlyList<(TimeOnly Start, TimeOnly End)> intervals)
    {
        if (intervals == null || intervals.Count == 0)
        {
            // Default fallback if no hours configured
            intervals = new List<(TimeOnly, TimeOnly)> { (AppConstants.OpeningHour, AppConstants.ClosingHour) };
        }

        foreach (var interval in intervals)
        {
            var current = interval.Start;
            // Generate slots as long as the entire duration fits within the closing time
            while (current.AddMinutes(AppConstants.ReservationDurationMinutes) <= interval.End)
            {
                var end = current.AddMinutes(AppConstants.ReservationDurationMinutes);
                yield return (current, end);
                
                // Step every 30 minutes for more flexible booking options
                current = current.AddMinutes(30);
            }
        }
    }

    private static ReservationResponse MapToResponse(Reservation r) => new()
    {
        Id                   = r.Id,
        ReservationCode      = r.ReservationCode,
        GuestName            = r.GuestName,
        GuestEmail           = r.GuestEmail,
        GuestPhone           = r.GuestPhone,
        SeatingAreaId        = r.SeatingAreaId,
        SeatingAreaTableType = r.SeatingArea?.TableType ?? string.Empty,
        SeatingAreaArea      = r.SeatingArea?.Area ?? string.Empty,
        ReservationDate      = r.ReservationDate,
        StartTime            = r.StartTime,
        EndTime              = r.EndTime,
        GuestCount           = r.GuestCount,
        Status               = r.Status.ToString(),
        TableName            = r.TableName,
        SpecialNote          = r.SpecialNote,
        CreatedAt            = r.CreatedAt,
        ConfirmedAt          = r.ConfirmedAt,
        ConfirmedBy          = r.ConfirmedBy,
        CheckedInAt          = r.CheckedInAt,
        CheckedInBy          = r.CheckedInBy,
        CheckInImageUrl      = r.CheckInImageUrl,
        CheckInNote          = r.CheckInNote,
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
