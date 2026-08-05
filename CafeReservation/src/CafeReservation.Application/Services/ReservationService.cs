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
    private readonly ICurrentTenantService _currentTenantService;

    public ReservationService(
        IReservationRepository reservationRepository,
        ISeatingAreaRepository seatingAreaRepository,
        IEmailService emailService,
        IAvailabilityNotifier availabilityNotifier,
        IUnitOfWork unitOfWork,
        ILogger<ReservationService> logger,
        IInfoService infoService,
        ICurrentTenantService currentTenantService)
    {
        _reservationRepository = reservationRepository;
        _seatingAreaRepository = seatingAreaRepository;
        _emailService = emailService;
        _availabilityNotifier = availabilityNotifier;
        _unitOfWork = unitOfWork;
        _logger = logger;
        _infoService = infoService;
        _currentTenantService = currentTenantService;
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
        var info = await _infoService.GetRestaurantInfoAsync(ct) ?? new RestaurantInfoDto();
        var openingHours = info.OpeningHours;
        var intervals = CafeReservation.Application.Helpers.OpeningHoursParser.Parse(openingHours);

        if (!CafeReservation.Application.Helpers.OpeningHoursParser.IsWithinOpeningHours(request.StartTime, endTime, intervals, info.OpeningTime, info.ClosingTime))
        {
            throw new DomainException("Reservation time is outside business hours.");
        }

        var bookingLeadMins = info.BookingLeadMinutes;
        var nowVietnam = DateTime.UtcNow.AddHours(7);
        var reservationDateTime = request.ReservationDate.ToDateTime(request.StartTime);
        if (reservationDateTime < nowVietnam.AddMinutes(bookingLeadMins))
        {
            throw new DomainException($"Reservations must be made at least {bookingLeadMins} minutes before arrival at the restaurant.");
        }

        return await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var area = await _seatingAreaRepository.GetByIdAsync(request.SeatingAreaId, ct)
                ?? throw new NotFoundException(nameof(SeatingArea), request.SeatingAreaId);

            if (!area.IsActive)
                throw new DomainException("The selected seating area is not available.");

            var areaCapacity = ParseCapacity(area.TableType);
            if (areaCapacity < request.GuestCount)
                throw new DomainException($"This seating area does not support {request.GuestCount} guest(s). Please select an appropriate area.");

            var startTime = request.StartTime;

            // Lấy tất cả active reservations của area này trong ngày để tính Timeline Risk
            var activeBookings = await _reservationRepository.GetActiveReservationsForDateAsync(request.ReservationDate, ct);
            var areaBookings = activeBookings.Where(b => b.SeatingAreaId == area.Id).ToList();

            var (assignedTable, riskLevel) = EvaluateAndAssignTable(area, startTime, request.TableName, areaBookings, info);
            var tableDetail = string.IsNullOrEmpty(assignedTable)
                ? new TableRiskDetail { DisplayType = "Available", RiskLevel = "Available" }
                : EvaluateTable(assignedTable, startTime, areaBookings, info);

            bool isAutoConfirm = riskLevel == RiskLevel.Available && tableDetail.DisplayType == "Available";
            var targetStatus = isAutoConfirm ? ReservationStatus.Confirmed : ReservationStatus.Reserved;
            var targetConfirmedBy = isAutoConfirm ? "System (AutoConfirm)" : null;

            var (reviewStatus, reviewPriority, reviewBadge, reviewExplanation) = CalculateReviewInfo(tableDetail.DisplayType, tableDetail.RiskLevel, targetStatus, targetConfirmedBy);

            var dummyForPriority = new Reservation
            {
                Status = targetStatus,
                ConfirmedBy = targetConfirmedBy,
                TableName = assignedTable
            };
            var (priorityKey, priorityLabel, priorityExplanation, _) = CalculateBookingPriority(dummyForPriority, areaBookings, info ?? new RestaurantInfoDto());

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
                Status = targetStatus,
                ConfirmedAt = isAutoConfirm ? DateTime.UtcNow : null,
                ConfirmedBy = targetConfirmedBy,
                TableName = assignedTable,
                SpecialNote = request.SpecialNote,
                CreatedAt = DateTime.UtcNow,

                // PERSIST IMMUTABLE DECISION ENGINE SNAPSHOT AT CREATION TIME
                RiskLevel = tableDetail.RiskLevel,
                DisplayType = tableDetail.DisplayType,
                ReviewStatus = reviewStatus,
                ReviewPriority = reviewPriority,
                ReviewBadge = reviewBadge,
                ReviewExplanation = reviewExplanation,
                BookingPriority = priorityKey,
                BookingPriorityLabel = priorityLabel,
                BookingPriorityExplanation = priorityExplanation,
                DecisionEvaluatedAt = DateTime.UtcNow
            };

            await _reservationRepository.AddAsync(reservation, ct);
            await _unitOfWork.SaveChangesAsync(ct);

            _logger.LogInformation("Reservation {Code} created ({Status}) for guest {GuestName}",
                reservation.ReservationCode, reservation.Status, request.GuestName);

            _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);

            if (reservation.Status == ReservationStatus.Confirmed)
            {
                // Send email immediately if Auto Confirmed
                await _emailService.SendReservationConfirmationAsync(
                    reservation.GuestEmail, reservation.GuestName, reservation.ReservationCode, reservation.Id,
                    reservation.ReservationDate.ToDateTime(reservation.StartTime),
                    $"{area.TableType} - {area.Area}", ct);
            }

            reservation.SeatingArea = area;
            return await MapToResponseWithReviewInfoAsync(reservation, info ?? new RestaurantInfoDto(), null, ct);
        }, System.Data.IsolationLevel.Serializable, ct);
    }

    public async Task<ReservationResponse> GetByIdAsync(Guid reservationId, CancellationToken ct = default)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId, ct)
            ?? throw new NotFoundException(nameof(Reservation), reservationId);

        var info = await _infoService.GetRestaurantInfoAsync(ct) ?? new RestaurantInfoDto();
        return await MapToResponseWithReviewInfoAsync(reservation, info, null, ct);
    }

    public async Task<IReadOnlyList<ReservationResponse>> GetMyAsync(string guestEmail, CancellationToken ct = default)
    {
        var reservations = await _reservationRepository.GetByGuestEmailAsync(guestEmail.Trim().ToLowerInvariant(), ct);
        return reservations.Select(MapToResponse).ToList();
    }

    public async Task CancelAsync(Guid reservationId, bool bypassPolicy = false, CancellationToken ct = default)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId, ct)
            ?? throw new NotFoundException(nameof(Reservation), reservationId);

        if (reservation.Status == ReservationStatus.Cancelled)
            throw new DomainException("Reservation is already cancelled.");

        if (reservation.Status == ReservationStatus.Completed)
            throw new DomainException("Completed reservations cannot be cancelled.");

        if (reservation.Status == ReservationStatus.CheckedIn)
            throw new DomainException("Checked-in reservations cannot be cancelled.");

        var info = await _infoService.GetRestaurantInfoAsync(ct);
        var cancelBeforeMins = info?.CancelBeforeMinutes ?? 30;
        
        var nowVietnam = DateTime.UtcNow.AddHours(7);
        var reservationDateTime = reservation.ReservationDate.ToDateTime(reservation.StartTime);
        
        if (!bypassPolicy && nowVietnam > reservationDateTime.AddMinutes(-cancelBeforeMins))
        {
            throw new DomainException($"Reservations can only be cancelled at least {cancelBeforeMins} minutes before the arrival time.");
        }

        reservation.Status = ReservationStatus.Cancelled;

        await _reservationRepository.UpdateAsync(reservation, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Reservation {Code} cancelled", reservation.ReservationCode);

        _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);

        // Send cancellation email (regardless of who cancelled)
        await _emailService.SendCancellationNotificationAsync(
            reservation.GuestEmail, reservation.GuestName, reservation.ReservationCode, reservation.Id, ct);
    }

    public async Task<ReservationResponse> RescheduleAsync(Guid reservationId, RescheduleReservationRequest request, CancellationToken ct = default)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId, ct)
            ?? throw new NotFoundException(nameof(Reservation), reservationId);

        // Allow reschedule from either Reserved or Confirmed
        if (reservation.Status != ReservationStatus.Reserved && reservation.Status != ReservationStatus.Confirmed)
            throw new DomainException("Only Reserved or Confirmed reservations can be rescheduled.");

        var newEnd = request.StartTime.AddMinutes(AppConstants.ReservationDurationMinutes);
        var info = await _infoService.GetRestaurantInfoAsync(ct) ?? new RestaurantInfoDto();
        var openingHours = info.OpeningHours;
        var intervals = CafeReservation.Application.Helpers.OpeningHoursParser.Parse(openingHours);

        if (!CafeReservation.Application.Helpers.OpeningHoursParser.IsWithinOpeningHours(request.StartTime, newEnd, intervals, info.OpeningTime, info.ClosingTime))
        {
            throw new DomainException("Reservation time is outside business hours.");
        }

        var bookingLeadMins = info.BookingLeadMinutes;
        var nowVietnam = DateTime.UtcNow.AddHours(7);
        var reservationDateTime = request.ReservationDate.ToDateTime(request.StartTime);
        if (reservationDateTime < nowVietnam.AddMinutes(bookingLeadMins))
        {
            throw new DomainException($"Reservations must be made at least {bookingLeadMins} minutes before arrival at the restaurant.");
        }



        return await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var area = await _seatingAreaRepository.GetByIdAsync(reservation.SeatingAreaId, ct)
                ?? throw new NotFoundException(nameof(SeatingArea), reservation.SeatingAreaId);

            var activeBookings = await _reservationRepository.GetActiveReservationsForDateAsync(request.ReservationDate, ct);
            var areaBookings = activeBookings.Where(b => b.SeatingAreaId == area.Id && b.Id != reservationId).ToList();

            var (assignedTable, riskLevel) = EvaluateAndAssignTable(area, request.StartTime, reservation.TableName, areaBookings, info);
            var tableDetail = string.IsNullOrEmpty(assignedTable)
                ? new TableRiskDetail { DisplayType = "Available" }
                : EvaluateTable(assignedTable, request.StartTime, areaBookings, info);

            bool isAutoConfirm = riskLevel == RiskLevel.Available && tableDetail.DisplayType == "Available";
            reservation.TableName = assignedTable;

            reservation.ReservationDate = request.ReservationDate;
            reservation.StartTime = request.StartTime;
            reservation.EndTime = newEnd;

            // Tự động Confirm nếu an toàn, nếu không thì đưa về Reserved
            reservation.Status = isAutoConfirm ? ReservationStatus.Confirmed : ReservationStatus.Reserved;
            reservation.ConfirmedAt = isAutoConfirm ? DateTime.UtcNow : null;
            reservation.ConfirmedBy = isAutoConfirm ? "System (Reschedule)" : null;

            await _reservationRepository.UpdateAsync(reservation, ct);
            await _unitOfWork.SaveChangesAsync(ct);

            _logger.LogInformation("Reservation {Code} rescheduled → {Status}", reservation.ReservationCode, reservation.Status);

            _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);

            reservation.SeatingArea = area;
            return await MapToResponseWithReviewInfoAsync(reservation, info, null, ct);
        }, System.Data.IsolationLevel.Serializable, ct);
    }

    public async Task<PagedResult<ReservationResponse>> GetAllAsync(ReservationFilterRequest filter, CancellationToken ct = default)
    {
        var (items, total) = await _reservationRepository.GetFilteredAsync(
            filter.Date, filter.Status, filter.Search, filter.Page, filter.PageSize, ct);

        var info = await _infoService.GetRestaurantInfoAsync(ct) ?? new RestaurantInfoDto();

        var enriched = new List<ReservationResponse>();
        foreach (var item in items)
        {
            var enrichedItem = await MapToResponseWithReviewInfoAsync(item, info, null, ct);
            enriched.Add(enrichedItem);
        }

        // Apply sorting based on status hierarchy (pending -> confirm -> complete -> cancel) then filter.SortBy
        IEnumerable<ReservationResponse> sortedQuery = enriched;
        var sortBy = filter.SortBy?.ToLowerInvariant() ?? "status";

        sortedQuery = sortBy switch
        {
            "bookingtime" => enriched.OrderBy(r => GetStatusRank(r.Status))
                                     .ThenBy(r => r.ReservationDate)
                                     .ThenBy(r => r.StartTime),
            "createdtime" => enriched.OrderBy(r => GetStatusRank(r.Status))
                                     .ThenByDescending(r => r.CreatedAt),
            "guestname" => enriched.OrderBy(r => GetStatusRank(r.Status))
                                   .ThenBy(r => r.GuestName),
            _ => enriched.OrderBy(r => GetStatusRank(r.Status))
                          .ThenBy(r => r.ReviewPriority)
                          .ThenBy(r => r.ReservationDate)
                          .ThenBy(r => r.StartTime)
        };

        return new PagedResult<ReservationResponse>
        {
            Items = sortedQuery.ToList(),
            TotalCount = total,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    private static int GetStatusRank(string? status)
    {
        var s = (status ?? "").ToLowerInvariant();
        return s switch
        {
            "reserved" => 1,     // pending / Chờ xử lý
            "confirmed" => 2,    // confirm / Đã xác nhận
            "checkedin" => 3,    // đang sử dụng
            "completed" => 4,    // complete / Hoàn thành
            "cancelled" => 5,    // cancel / Đã hủy
            "noshow" => 6,       // vắng mặt
            _ => 99
        };
    }

    public async Task<ReservationResponse> UpdateStatusAsync(Guid reservationId, UpdateReservationStatusRequest request, CancellationToken ct = default)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId, ct)
            ?? throw new NotFoundException(nameof(Reservation), reservationId);

        if (!Enum.TryParse<ReservationStatus>(request.Status, ignoreCase: true, out var newStatus))
            throw new DomainException($"Invalid status '{request.Status}'. Valid values: Confirmed, Cancelled, Completed, NoShow, Reserved, CheckedIn.");

        // Load info BEFORE SaveChanges to avoid DbContext second-operation concurrency error
        var info = await _infoService.GetRestaurantInfoAsync(ct) ?? new RestaurantInfoDto();

        reservation.Status = newStatus;
        await _reservationRepository.UpdateAsync(reservation, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);

        if (newStatus == ReservationStatus.Cancelled)
        {
            _ = _emailService.SendCancellationNotificationAsync(
                reservation.GuestEmail, reservation.GuestName, reservation.ReservationCode, reservation.Id, ct);
        }
        else if (newStatus == ReservationStatus.NoShow)
        {
            _ = _emailService.SendNoShowNotificationAsync(
                reservation.GuestEmail, reservation.GuestName, reservation.ReservationCode, reservation.Id, ct);
        }
        else if (newStatus == ReservationStatus.Confirmed)
        {
            _ = _emailService.SendReservationConfirmationAsync(
                reservation.GuestEmail, reservation.GuestName, reservation.ReservationCode, reservation.Id,
                reservation.ReservationDate.ToDateTime(reservation.StartTime),
                $"{reservation.SeatingArea?.TableType} - {reservation.SeatingArea?.Area}", ct);
        }

        _logger.LogInformation("Reservation {Code} status updated to {Status}", reservation.ReservationCode, newStatus);
        return await MapToResponseWithReviewInfoAsync(reservation, info, null, ct);
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

        var info = await _infoService.GetRestaurantInfoAsync(ct) ?? new RestaurantInfoDto();
        var openingHours = info.OpeningHours;
        var intervals = CafeReservation.Application.Helpers.OpeningHoursParser.Parse(openingHours);
        var slots = GenerateTimeSlots(intervals, info).ToList();

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
                var tableRisks = EvaluateAllTablesForArea(area, start, areaReservations, info);

                var nonConflictTables = tableRisks.Where(t => t.RiskLevel != RiskLevel.Conflict.ToString()).ToList();
                if (nonConflictTables.Any())
                {
                    var bestRiskEnum = nonConflictTables.Min(t => Enum.Parse<RiskLevel>(t.RiskLevel));
                    available.Add(new TimeSlot 
                    { 
                        StartTime = start, 
                        EndTime = end,
                        RiskLevel = bestRiskEnum.ToString(),
                        RiskMessage = GetRiskMessage(bestRiskEnum),
                        SuggestedStatus = bestRiskEnum == RiskLevel.Conflict ? "occupied" : "available",
                        TableRisks = tableRisks
                    });
                }
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

    public enum RiskLevel { Available = 0, Low = 1, Medium = 2, High = 3, Conflict = 4 }

    /// <summary>
    /// SINGLE SOURCE OF TRUTH (SSOT) - Booking Decision Engine.
    /// Evaluates the risk level for a given target time slot against active bookings on a physical table.
    /// Incorporates Priority Hierarchy Rule (CheckedIn > Confirmed > Reserved > New) and Tenant Policy.
    /// Symmetric algorithm: Math.Abs(NewReservation.StartTime - ExistingReservation.StartTime).
    /// </summary>
    public static RiskLevel EvaluateTableRisk(
        TimeOnly targetTime,
        IEnumerable<Reservation> tableBookings,
        RestaurantInfoDto info,
        ReservationStatus? targetStatus = null)
    {
        if (info.HighRiskThresholdMinutes <= 0 || info.MediumRiskThresholdMinutes <= 0 || info.LowRiskThresholdMinutes <= 0)
            throw new ConfigurationException("Dynamic Booking Policy thresholds must be greater than 0.");
            
        if (info.HighRiskThresholdMinutes >= info.MediumRiskThresholdMinutes || info.MediumRiskThresholdMinutes >= info.LowRiskThresholdMinutes)
            throw new ConfigurationException("Dynamic Booking Policy thresholds must be ordered: High < Medium < Low.");

        var activeBookings = tableBookings.Where(b =>
            b.Status == ReservationStatus.Confirmed || b.Status == ReservationStatus.CheckedIn
        ).ToList();

        if (!activeBookings.Any())
            return RiskLevel.Available;

        var targetEnd = targetTime.AddMinutes(AppConstants.ReservationDurationMinutes);
        if (activeBookings.Any(b => targetTime == b.StartTime || (targetTime < b.EndTime && targetEnd > b.StartTime)))
        {
            return RiskLevel.Conflict;
        }

        double minDistanceMinutes = activeBookings.Min(b => Math.Abs((targetTime.ToTimeSpan() - b.StartTime.ToTimeSpan()).TotalMinutes));

        if (minDistanceMinutes == 0)
            return RiskLevel.Conflict;

        bool hasCheckedIn = activeBookings.Any(b => b.Status == ReservationStatus.CheckedIn);
        if (hasCheckedIn && minDistanceMinutes <= info.LowRiskThresholdMinutes)
        {
            return RiskLevel.High;
        }

        if (minDistanceMinutes <= info.HighRiskThresholdMinutes) return RiskLevel.High;
        if (minDistanceMinutes <= info.MediumRiskThresholdMinutes) return RiskLevel.Medium;
        if (minDistanceMinutes <= info.LowRiskThresholdMinutes) return RiskLevel.Low;

        return RiskLevel.Available;
    }

    public static double CalculateReservationGapMinutes(TimeOnly start1, TimeOnly end1, TimeOnly start2, TimeOnly end2)
    {
        var tStart1 = start1.ToTimeSpan();
        var tEnd1 = end1.ToTimeSpan();
        var tStart2 = start2.ToTimeSpan();
        var tEnd2 = end2.ToTimeSpan();

        if (tStart2 >= tEnd1)
        {
            return (tStart2 - tEnd1).TotalMinutes;
        }
        if (tStart1 >= tEnd2)
        {
            return (tStart1 - tEnd2).TotalMinutes;
        }
        return 0;
    }

    public static string NormalizeTableName(string? tableName)
    {
        if (string.IsNullOrWhiteSpace(tableName)) return string.Empty;
        var trimmed = tableName.Trim();
        while (trimmed.StartsWith("Bàn ", StringComparison.OrdinalIgnoreCase))
        {
            trimmed = trimmed.Substring(4).Trim();
        }
        return trimmed.ToLowerInvariant();
    }

    public static bool AreTableNamesEqual(string? name1, string? name2)
    {
        if (string.IsNullOrWhiteSpace(name1) || string.IsNullOrWhiteSpace(name2))
            return true;
        return string.Equals(NormalizeTableName(name1), NormalizeTableName(name2), StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// SINGLE SOURCE OF TRUTH (SSOT) - Booking Decision Engine Helper.
    /// Evaluates a single table and returns standard risk details.
    /// </summary>
    public static TableRiskDetail EvaluateTable(
        string tableName,
        TimeOnly targetTime,
        IEnumerable<Reservation> areaBookings,
        RestaurantInfoDto info,
        ReservationStatus? targetStatus = null)
    {
        var tableBookings = areaBookings.Where(b => AreTableNamesEqual(b.TableName, tableName)).ToList();
        var risk = EvaluateTableRisk(targetTime, tableBookings, info, targetStatus);
        
        string displayType = "Available";
        var activeBookings = tableBookings.Where(b =>
            b.Status == ReservationStatus.Confirmed || b.Status == ReservationStatus.CheckedIn
        ).ToList();

        if (activeBookings.Any())
        {
            var targetEnd = targetTime.AddMinutes(AppConstants.ReservationDurationMinutes);
            var overlapping = activeBookings.Where(b => targetTime == b.StartTime || (targetTime < b.EndTime && targetEnd > b.StartTime)).ToList();
            
            if (overlapping.Any())
            {
                if (overlapping.Any(b => b.Status == ReservationStatus.CheckedIn))
                {
                    displayType = "Occupied";
                }
                else
                {
                    displayType = "Conflict";
                }
            }
            else
            {
                var closest = activeBookings.OrderBy(b => Math.Abs((targetTime.ToTimeSpan() - b.StartTime.ToTimeSpan()).TotalMinutes)).First();
                double minDistance = Math.Abs((targetTime.ToTimeSpan() - closest.StartTime.ToTimeSpan()).TotalMinutes);
                
                if (minDistance <= info.LowRiskThresholdMinutes)
                {
                    if (closest.StartTime > targetTime)
                    {
                        displayType = "TimelineNotice";
                    }
                    else
                    {
                        displayType = "BookingRisk";
                    }
                }
            }
        }

        return new TableRiskDetail
        {
            TableName = tableName,
            RiskLevel = risk.ToString(),
            RiskMessage = GetRiskMessage(risk),
            SuggestedStatus = risk == RiskLevel.Conflict ? "occupied" : "available",
            DisplayType = displayType
        };
    }

    /// <summary>
    /// SINGLE SOURCE OF TRUTH (SSOT) - Booking Decision Engine Helper.
    /// Evaluates all reservable tables in an area for a target time.
    /// Used by both Availability API and Reservation Create/Reschedule APIs.
    /// </summary>
    public static List<TableRiskDetail> EvaluateAllTablesForArea(
        SeatingArea area,
        TimeOnly targetTime,
        IEnumerable<Reservation> areaBookings,
        RestaurantInfoDto info)
    {
        var knownTables = areaBookings
            .Where(b => !string.IsNullOrEmpty(b.TableName))
            .Select(b => b.TableName!)
            .Distinct()
            .ToList();

        var results = new List<TableRiskDetail>();
        for (int i = 1; i <= area.ReservableTables; i++)
        {
            string candidateName = knownTables.ElementAtOrDefault(i - 1) ?? $"Bàn {area.Area} {i}";
            results.Add(EvaluateTable(candidateName, targetTime, areaBookings, info));
        }
        return results;
    }

    private static (string? TableName, RiskLevel Risk) EvaluateAndAssignTable(
        SeatingArea area,
        TimeOnly startTime,
        string? requestedTableName,
        List<Reservation> areaBookings,
        RestaurantInfoDto info)
    {
        string targetTable = !string.IsNullOrEmpty(requestedTableName)
            ? requestedTableName
            : (areaBookings.FirstOrDefault(b => !string.IsNullOrEmpty(b.TableName))?.TableName ?? $"Bàn {area.Area} 1");

        var detail = EvaluateTable(targetTable, startTime, areaBookings, info);
        var tableRisk = Enum.Parse<RiskLevel>(detail.RiskLevel);
        if (tableRisk == RiskLevel.Conflict)
        {
            throw new ConflictException($"Bàn {targetTable} đã có người đặt hoặc trùng thời gian lúc {startTime}.");
        }
        return (targetTable, tableRisk);
    }

    private static string GetRiskMessage(RiskLevel risk) => risk switch
    {
        RiskLevel.Available => "Available",
        RiskLevel.Low => "Low Risk",
        RiskLevel.Medium => "Medium Risk",
        RiskLevel.High => "High Risk",
        RiskLevel.Conflict => "Conflict",
        _ => "High Risk"
    };

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

        // Chuẩn hóa thời gian giữ bàn theo cấu hình tiêu chuẩn
        reservation.EndTime = reservation.StartTime.AddMinutes(AppConstants.ReservationDurationMinutes);
        await _reservationRepository.UpdateAsync(reservation, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Reservation {Code} confirmed by {Staff}", reservation.ReservationCode, staffEmail);

        _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);

        // Send confirmation email to guest
        await _emailService.SendReservationConfirmationAsync(
            reservation.GuestEmail, reservation.GuestName, reservation.ReservationCode, reservation.Id,
            reservation.ReservationDate.ToDateTime(reservation.StartTime),
            $"{reservation.SeatingArea?.TableType} - {reservation.SeatingArea?.Area}", ct);

        var info = await _infoService.GetRestaurantInfoAsync(ct) ?? new RestaurantInfoDto();
        return await MapToResponseWithReviewInfoAsync(reservation, info, null, ct);
    }

    public async Task<ReservationResponse> RejectAsync(Guid reservationId, string staffEmail, CancellationToken ct = default)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId, ct)
            ?? throw new NotFoundException(nameof(Reservation), reservationId);

        if (reservation.Status != ReservationStatus.Reserved)
            throw new DomainException("Only Reserved reservations can be rejected.");

        // Load info BEFORE SaveChanges to avoid DbContext second-operation concurrency error
        var info = await _infoService.GetRestaurantInfoAsync(ct) ?? new RestaurantInfoDto();

        reservation.Status = ReservationStatus.Cancelled;

        await _reservationRepository.UpdateAsync(reservation, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Reservation {Code} rejected by {Staff}", reservation.ReservationCode, staffEmail);

        _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);

        // Send cancellation email to guest
        _ = _emailService.SendCancellationNotificationAsync(
            reservation.GuestEmail, reservation.GuestName, reservation.ReservationCode, reservation.Id, ct);

        return await MapToResponseWithReviewInfoAsync(reservation, info, null, ct);
    }

    public async Task<ReservationResponse> CheckInAsync(Guid reservationId, CheckInRequest request, string staffEmail, CancellationToken ct = default)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId, ct)
            ?? throw new NotFoundException(nameof(Reservation), reservationId);

        if (reservation.Status != ReservationStatus.Confirmed)
            throw new DomainException("Only Confirmed reservations can be checked in.");

        // Load info BEFORE SaveChanges to avoid DbContext second-operation concurrency error
        var info = await _infoService.GetRestaurantInfoAsync(ct) ?? new RestaurantInfoDto();

        reservation.Status          = ReservationStatus.CheckedIn;
        reservation.CheckedInAt     = DateTime.UtcNow;
        reservation.CheckedInBy     = staffEmail;
        reservation.CheckInImageUrl = request.CheckInImageUrl;
        reservation.CheckInNote     = request.CheckInNote;

        await _reservationRepository.UpdateAsync(reservation, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Reservation {Code} checked in by {Staff}", reservation.ReservationCode, staffEmail);

        _ = _availabilityNotifier.NotifyAvailabilityChangedAsync(ct);

        return await MapToResponseWithReviewInfoAsync(reservation, info, null, ct);
    }

    // ── Review Priority & Workflow Helpers ─────────────────────────────────────

    public static (string ReviewStatus, int Priority, string Badge, string Explanation) CalculateReviewInfo(
        string displayType,
        string riskLevelStr,
        ReservationStatus status,
        string? confirmedBy)
    {
        // 1. Determine ReviewStatus (PendingReview | Reviewed | NotRequired)
        string reviewStatus;
        if (status == ReservationStatus.Cancelled || status == ReservationStatus.Completed || status == ReservationStatus.NoShow)
        {
            reviewStatus = "NotRequired";
        }
        else if (status == ReservationStatus.Confirmed || status == ReservationStatus.CheckedIn)
        {
            reviewStatus = "Reviewed";
        }
        else // Reserved
        {
            if (displayType == "Available" && string.Equals(riskLevelStr, "Available", StringComparison.OrdinalIgnoreCase))
            {
                reviewStatus = "NotRequired";
            }
            else
            {
                reviewStatus = "PendingReview";
            }
        }

        // 2. Risk Badge (PURE INFORMATION - NEVER CLEARED OR REPLACED BY STATUS)
        string badge;
        if (displayType == "TimelineNotice")
        {
            badge = "Có lịch đặt tiếp theo";
        }
        else if (displayType == "BookingRisk")
        {
            if (string.Equals(riskLevelStr, "High", StringComparison.OrdinalIgnoreCase))
            {
                badge = "Khả năng chờ - Cao";
            }
            else if (string.Equals(riskLevelStr, "Medium", StringComparison.OrdinalIgnoreCase))
            {
                badge = "Khả năng chờ - Trung bình";
            }
            else
            {
                badge = "Khả năng chờ - Thấp";
            }
        }
        else if (displayType == "Occupied")
        {
            badge = "Đang có khách";
        }
        else if (displayType == "Conflict")
        {
            badge = "Đã được đặt";
        }
        else
        {
            badge = "Bình thường";
        }

        // 3. Review Priority (Used ONLY for active PendingReview queue sorting)
        int priority;
        if (reviewStatus == "PendingReview")
        {
            if (displayType == "TimelineNotice")
            {
                priority = 1; // FutureBookingNotice (Highest Priority)
            }
            else if (displayType == "BookingRisk")
            {
                if (string.Equals(riskLevelStr, "Low", StringComparison.OrdinalIgnoreCase))
                    priority = 2;
                else if (string.Equals(riskLevelStr, "Medium", StringComparison.OrdinalIgnoreCase))
                    priority = 3;
                else
                    priority = 4;
            }
            else
            {
                priority = 5;
            }
        }
        else
        {
            priority = 10; // Already reviewed or not required
        }

        // 4. Explanation text (Friendly description)
        string explanation;
        if (displayType == "TimelineNotice")
        {
            explanation = "Có khách đã đặt bàn này vào khung giờ sau. Bạn vẫn có thể tiếp tục xử lý booking này. Hãy lưu ý lịch đặt tiếp theo để đảm bảo quyền lợi của khách.";
        }
        else if (displayType == "BookingRisk")
        {
            explanation = string.Equals(riskLevelStr, "Low", StringComparison.OrdinalIgnoreCase)
                ? "Đã có khách đặt trước nhưng khoảng cách giữa hai lượt đặt khá an toàn."
                : "Đã có khách đặt trước. Có khả năng khách sẽ phải chờ nếu lượt sử dụng trước đó kéo dài hơn dự kiến.";
        }
        else
        {
            explanation = "Lịch đặt bàn an toàn, sẵn sàng phục vụ.";
        }

        return (reviewStatus, priority, badge, explanation);
    }

    private async Task<ReservationResponse> MapToResponseWithReviewInfoAsync(
        Reservation r,
        RestaurantInfoDto info,
        List<Reservation>? dateBookings = null,
        CancellationToken ct = default)
    {
        var response = MapToResponse(r);

        bool isConfirmedInDb = r.Status == ReservationStatus.Confirmed;
        string effectivePriority = (isConfirmedInDb || r.BookingPriority == "Preferred")
            ? "Preferred"
            : (!string.IsNullOrEmpty(r.BookingPriority) ? r.BookingPriority : "Normal");

        response.RiskLevel = !string.IsNullOrEmpty(r.RiskLevel) ? r.RiskLevel : "Available";
        response.DisplayType = !string.IsNullOrEmpty(r.DisplayType) ? r.DisplayType : "Available";
        response.ReviewStatus = !string.IsNullOrEmpty(r.ReviewStatus)
            ? r.ReviewStatus
            : (r.Status == ReservationStatus.Reserved ? "PendingReview" : "NotRequired");
        response.ReviewPriority = r.ReviewPriority > 0 ? r.ReviewPriority : 5;
        response.ReviewBadge = !string.IsNullOrEmpty(r.ReviewBadge) ? r.ReviewBadge : "🟢 An toàn";
        response.ReviewExplanation = r.ReviewExplanation ?? "Lịch đặt bàn an toàn, sẵn sàng phục vụ.";

        response.BookingPriority = effectivePriority;
        response.BookingPriorityLabel = effectivePriority == "Preferred" ? "⭐ Được ưu tiên" : "⚪ Bình thường";
        response.BookingPriorityExplanation = r.BookingPriorityExplanation ?? (effectivePriority == "Preferred"
            ? "Booking này đã được xác nhận và được ưu tiên bảo vệ lịch đặt bàn khi các booking Risk phát sinh."
            : "Booking này ở trạng thái chờ xác nhận, chưa thuộc nhóm ưu tiên bảo vệ lịch.");

        var activeBookings = dateBookings ?? (await _reservationRepository.GetActiveReservationsForDateAsync(r.ReservationDate, ct)).ToList();
        var (_, _, _, contextList) = CalculateBookingPriority(r, activeBookings, info);
        response.TableTimelineContext = contextList;

        return response;
    }

    public static (string PriorityKey, string PriorityLabel, string PriorityExplanation, List<TableTimelineContextDto> ContextList) CalculateBookingPriority(
        Reservation target,
        List<Reservation> activeTableBookings,
        RestaurantInfoDto info)
    {
        // OFFICIAL BUSINESS RULE FOR BOOKING PRIORITY:
        // IF Booking is Confirmed -> Priority = Preferred / ⭐ Được ưu tiên
        // ELSE -> Priority = Normal / ⚪ Bình thường
        bool isPreferred = target.Status == ReservationStatus.Confirmed;

        string priorityKey = isPreferred ? "Preferred" : "Normal";
        string priorityLabel = isPreferred ? "⭐ Được ưu tiên" : "⚪ Bình thường";
        string priorityExplanation = isPreferred
            ? "Booking này đã được xác nhận (Auto Confirm hoặc Nhân viên xác nhận) và được ưu tiên bảo vệ khi các booking Risk phát sinh sau đó."
            : "Booking này ở trạng thái chờ xác nhận, chưa thuộc nhóm ưu tiên bảo vệ lịch.";

        // Build Table Timeline Context List for Staff Detail View
        var tableBookings = activeTableBookings
            .Where(b => !string.IsNullOrEmpty(target.TableName) && AreTableNamesEqual(b.TableName, target.TableName))
            .OrderBy(b => b.StartTime)
            .ToList();

        if (!tableBookings.Any(b => b.Id == target.Id))
        {
            tableBookings.Add(target);
            tableBookings = tableBookings.OrderBy(b => b.StartTime).ToList();
        }

        var contextList = new List<TableTimelineContextDto>();
        foreach (var b in tableBookings)
        {
            bool bAuto = b.Status == ReservationStatus.Confirmed && !string.IsNullOrEmpty(b.ConfirmedBy) && b.ConfirmedBy.Contains("System");
            contextList.Add(new TableTimelineContextDto
            {
                ReservationId = b.Id,
                ReservationCode = b.ReservationCode,
                GuestName = b.GuestName,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                Status = b.Status.ToString(),
                IsCurrentItem = b.Id == target.Id,
                PriorityLabel = bAuto ? "⭐ Được ưu tiên" : "⚪ Bình thường",
                RiskLabel = getSimpleRiskLabel(b, tableBookings, info)
            });
        }

        return (priorityKey, priorityLabel, priorityExplanation, contextList);
    }

    private static string getPrecedenceLabel(Reservation b, List<Reservation> allOnTable)
    {
        if (allOnTable.Count <= 1) return "⚪ Bình thường";
        var lowestTimeMark = allOnTable.Min(x => x.ConfirmedAt ?? x.CreatedAt);
        DateTime bTimeMark = b.ConfirmedAt ?? b.CreatedAt;
        if (b.Status == ReservationStatus.CheckedIn || (b.Status == ReservationStatus.Confirmed && bTimeMark <= lowestTimeMark.AddSeconds(5)))
        {
            return "🟢 Ưu tiên trước";
        }
        return "🟡 Đặt sau";
    }

    private static string getSimpleRiskLabel(Reservation b, List<Reservation> allOnTable, RestaurantInfoDto info)
    {
        var otherBookings = allOnTable.Where(x => x.Id != b.Id).ToList();
        if (!otherBookings.Any()) return "Available";
        var detail = EvaluateTable(b.TableName ?? "", b.StartTime, otherBookings, info, b.Status);
        return detail.RiskLevel;
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

    private static IEnumerable<(TimeOnly Start, TimeOnly End)> GenerateTimeSlots(IReadOnlyList<(TimeOnly Start, TimeOnly End)> intervals, RestaurantInfoDto info)
    {
        if (intervals == null || intervals.Count == 0)
        {
            // Default fallback using dynamic tenant policy opening/closing times
            intervals = new List<(TimeOnly, TimeOnly)> { (info.OpeningTime, info.ClosingTime) };
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

    public async Task<bool> CanConfirmAsync(Guid reservationId, CancellationToken ct = default)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId, ct);
        if (reservation == null || reservation.Status != ReservationStatus.Reserved)
            return false;

        var info = await _infoService.GetRestaurantInfoAsync(ct) ?? new RestaurantInfoDto();
        var activeBookings = await _reservationRepository.GetActiveReservationsForDateAsync(reservation.ReservationDate, ct);
        // Exclude self from context — we're evaluating if THIS reservation can be promoted
        var areaBookings = activeBookings.Where(b => b.SeatingAreaId == reservation.SeatingAreaId && b.Id != reservationId).ToList();

        // Guard: if another active booking already holds the exact same table+slot
        // (Reserved, Confirmed, or CheckedIn), promoting this to Confirmed would violate the unique constraint
        if (!string.IsNullOrEmpty(reservation.TableName))
        {
            var sameSlotConflict = areaBookings.Any(b =>
                AreTableNamesEqual(b.TableName, reservation.TableName) &&
                b.StartTime == reservation.StartTime &&
                (b.Status == ReservationStatus.Reserved ||
                 b.Status == ReservationStatus.Confirmed ||
                 b.Status == ReservationStatus.CheckedIn));

            if (sameSlotConflict) return false;

            var detail = EvaluateTable(reservation.TableName, reservation.StartTime, areaBookings, info);
            // Must be Available risk AND no Conflict/Occupied overlap with existing Confirmed bookings
            return detail.RiskLevel == RiskLevel.Available.ToString()
                && detail.DisplayType != "Conflict"
                && detail.DisplayType != "Occupied";
        }
        else
        {
            try
            {
                var area = await _seatingAreaRepository.GetByIdAsync(reservation.SeatingAreaId, ct);
                if (area == null) return false;
                var (assignedTable, risk) = EvaluateAndAssignTable(area, reservation.StartTime, null, areaBookings, info);
                return risk == RiskLevel.Available;
            }
            catch (ConflictException)
            {
                return false;
            }
        }
    }

    private static readonly TimeZoneInfo VietnamTz =
        TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

    public async Task ProcessAutomatedStatusTransitionsAsync(CancellationToken ct = default)
    {
        var nowVietnam = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, VietnamTz);
        var today      = DateOnly.FromDateTime(nowVietnam);
        var nowTime    = TimeOnly.FromDateTime(nowVietnam);

        var targetReservations = await _reservationRepository.GetActiveReservationsAcrossAllTenantsAsync(today, ct);
        if (!targetReservations.Any()) return;

        var tenantGroups = targetReservations.GroupBy(r => r.TenantId);

        foreach (var group in tenantGroups)
        {
            var tenantId = group.Key;
            _currentTenantService.SetTenantId(tenantId);

            var info = await _infoService.GetRestaurantInfoAsync(ct);
            int noShowMins = info?.NoShowAfterMinutes ?? 15;
            int confDeadlineMins = info?.ConfirmationDeadlineMinutes ?? 30;

            foreach (var reservation in group)
            {
                try
                {
                    // 1. Process NoShow for Confirmed
                    if (reservation.Status == ReservationStatus.Confirmed)
                    {
                        var expirationTime = reservation.StartTime.AddMinutes(noShowMins);
                        if (nowTime > expirationTime)
                        {
                            _logger.LogInformation(
                                "Marking reservation {Code} (Tenant: {Tenant}) as NoShow. Guest didn't arrive within {Mins} mins of {Start}",
                                reservation.ReservationCode, tenantId, noShowMins, reservation.StartTime);

                            await UpdateStatusAsync(reservation.Id, new UpdateReservationStatusRequest { Status = ReservationStatus.NoShow.ToString() }, ct);
                        }
                    }

                    // 2. Process AutoCancel or AutoConfirm for Reserved
                    else if (reservation.Status == ReservationStatus.Reserved)
                    {
                        var deadlineTime = reservation.StartTime.AddMinutes(-confDeadlineMins);
                        if (nowTime > deadlineTime)
                        {
                            _logger.LogInformation(
                                "Auto cancelling reservation {Code} (Tenant: {Tenant}). Not confirmed {Mins} mins before {Start}",
                                reservation.ReservationCode, tenantId, confDeadlineMins, reservation.StartTime);

                            await UpdateStatusAsync(reservation.Id, new UpdateReservationStatusRequest { Status = ReservationStatus.Cancelled.ToString() }, ct);
                        }
                        else
                        {
                            if (await CanConfirmAsync(reservation.Id, ct))
                            {
                                _logger.LogInformation(
                                    "Auto confirming reservation {Code} (Tenant: {Tenant}) as slot became available",
                                    reservation.ReservationCode, tenantId);

                                await UpdateStatusAsync(reservation.Id, new UpdateReservationStatusRequest { Status = ReservationStatus.Confirmed.ToString() }, ct);
                            }
                        }
                    }
                }
                catch (Exception dbEx) when (dbEx is NotFoundException ||
                                              dbEx is DomainException ||
                                              dbEx.GetType().Name == "DbUpdateException" || 
                                              (dbEx.InnerException != null && dbEx.InnerException.GetType().Name.Contains("Postgres")))
                {
                    // Slot conflict, constraint violation, or deleted reservation — skip gracefully
                    _logger.LogWarning("Automated status transition skipped for {Code}: {Message}", reservation.ReservationCode, dbEx.Message);
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    _logger.LogError(ex, "Unexpected error processing automated transition for {Code}", reservation.ReservationCode);
                }
            }
        }


    }

    private static int ParseCapacity(string tableType)
    {
        if (string.IsNullOrWhiteSpace(tableType)) return 2;
        
        var matchNguoi = System.Text.RegularExpressions.Regex.Match(tableType, @"(\d+)\s*người", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        if (matchNguoi.Success)
        {
            return int.Parse(matchNguoi.Groups[1].Value);
        }
        
        var matchSeat = System.Text.RegularExpressions.Regex.Match(tableType, @"(\d+)-Seat", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        if (matchSeat.Success)
        {
            return int.Parse(matchSeat.Groups[1].Value);
        }
        
        var matchDigits = System.Text.RegularExpressions.Regex.Match(tableType, @"(\d+)");
        if (matchDigits.Success)
        {
            return int.Parse(matchDigits.Groups[1].Value);
        }
        
        return 2;
    }
}
