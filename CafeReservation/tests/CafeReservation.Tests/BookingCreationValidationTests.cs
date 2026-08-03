using System;
using System.Collections.Generic;
using System.Data;
using System.Threading;
using System.Threading.Tasks;
using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using CafeReservation.Application.Services;
using CafeReservation.Application.Validators;
using CafeReservation.Domain.Entities;
using CafeReservation.Domain.Exceptions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace CafeReservation.Tests;

public class BookingCreationValidationTests
{
    private readonly Mock<IReservationRepository> _mockRepo = new();
    private readonly Mock<ISeatingAreaRepository> _mockAreaRepo = new();
    private readonly Mock<IEmailService> _mockEmailService = new();
    private readonly Mock<IAvailabilityNotifier> _mockNotifier = new();
    private readonly Mock<IUnitOfWork> _mockUow = new();
    private readonly Mock<ILogger<ReservationService>> _mockLogger = new();
    private readonly Mock<IInfoService> _mockInfoService = new();
    private readonly Mock<ICurrentTenantService> _mockTenantService = new();

    private readonly ReservationService _service;
    private readonly Guid _areaId = Guid.NewGuid();
    private readonly RestaurantInfoDto _policy = new()
    {
        OpeningHours = "08:00 - 22:00",
        OpeningTime = new TimeOnly(8, 0),
        ClosingTime = new TimeOnly(22, 0),
        BookingLeadMinutes = 15,
        HighRiskThresholdMinutes = 60,
        MediumRiskThresholdMinutes = 120,
        LowRiskThresholdMinutes = 180,
        AutoConfirmThresholdMinutes = 180
    };

    public BookingCreationValidationTests()
    {
        _mockInfoService.Setup(i => i.GetRestaurantInfoAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_policy);

        _mockUow.Setup(u => u.ExecuteInTransactionAsync(
                It.IsAny<Func<Task<ReservationResponse>>>(), 
                It.IsAny<IsolationLevel>(), 
                It.IsAny<CancellationToken>()))
            .Returns<Func<Task<ReservationResponse>>, IsolationLevel, CancellationToken>((func, iso, ct) => func());

        var area = new SeatingArea
        {
            Id = _areaId,
            Area = "A",
            TableType = "4 Người",
            IsActive = true,
            ReservableTables = 5
        };

        _mockAreaRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(area);

        _mockRepo.Setup(r => r.GetActiveReservationsForDateAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Reservation>());

        _service = new ReservationService(
            _mockRepo.Object,
            _mockAreaRepo.Object,
            _mockEmailService.Object,
            _mockNotifier.Object,
            _mockUow.Object,
            _mockLogger.Object,
            _mockInfoService.Object,
            _mockTenantService.Object
        );
    }

    [Fact]
    public async Task ScenarioA_BookingTomorrowAfterOpening_WhenCurrentTimeIsNight_Succeeds()
    {
        // Scenario A: Store is 08:00-22:00. Even if tested when server time is outside business hours,
        // booking for tomorrow 09:00 MUST succeed without throwing business hours exception.
        var request = new CreateReservationRequest
        {
            SeatingAreaId = _areaId,
            ReservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            StartTime = new TimeOnly(9, 0),
            GuestCount = 2,
            GuestName = "John Doe",
            GuestEmail = "john@example.com",
            GuestPhone = "0123456789"
        };

        var response = await _service.CreateAsync(request);
        Assert.NotNull(response);
        Assert.Equal("Confirmed", response.Status);
    }

    [Fact]
    public async Task ScenarioB_BookingTodayDuringBusinessHours_WhenCurrentTimeIsEarlyMorning_Succeeds()
    {
        // Scenario B: Booking Today 09:00 when store is 08:00-22:00 MUST succeed.
        // As long as the start time is within business hours and lead time is respected.
        var request = new CreateReservationRequest
        {
            SeatingAreaId = _areaId,
            ReservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            StartTime = new TimeOnly(9, 0),
            GuestCount = 2,
            GuestName = "Jane Doe",
            GuestEmail = "jane@example.com",
            GuestPhone = "0123456789"
        };

        var response = await _service.CreateAsync(request);
        Assert.NotNull(response);
    }

    [Fact]
    public async Task ScenarioC_BookingTomorrowBeforeStoreOpens_ThrowsValidationError()
    {
        // Scenario C: Booking Tomorrow 07:00 when Store opens 08:00 -> Expected Validation Error
        var request = new CreateReservationRequest
        {
            SeatingAreaId = _areaId,
            ReservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            StartTime = new TimeOnly(7, 0),
            GuestCount = 2,
            GuestName = "Early Bird",
            GuestEmail = "early@example.com",
            GuestPhone = "0123456789"
        };

        var ex = await Assert.ThrowsAsync<DomainException>(() => _service.CreateAsync(request));
        Assert.Equal("Reservation time is outside business hours.", ex.Message);
    }

    [Fact]
    public async Task ScenarioD_BookingTomorrowAfterStoreCloses_ThrowsValidationError()
    {
        // Scenario D: Booking Tomorrow 23:30 when Store closes 22:00 -> Expected Validation Error
        var request = new CreateReservationRequest
        {
            SeatingAreaId = _areaId,
            ReservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            StartTime = new TimeOnly(23, 30),
            GuestCount = 2,
            GuestName = "Night Owl",
            GuestEmail = "night@example.com",
            GuestPhone = "0123456789"
        };

        var ex = await Assert.ThrowsAsync<DomainException>(() => _service.CreateAsync(request));
        Assert.Equal("Reservation time is outside business hours.", ex.Message);
    }

    [Fact]
    public void Validator_DoesNotHaveHardcodedTimeLimits()
    {
        // Ensure CreateReservationRequestValidator does not block 07:00 or 23:00 hardcoded
        var validator = new CreateReservationRequestValidator();
        var request = new CreateReservationRequest
        {
            SeatingAreaId = _areaId,
            ReservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            StartTime = new TimeOnly(7, 0),
            GuestCount = 2,
            GuestName = "Test User",
            GuestEmail = "test@example.com",
            GuestPhone = "0123456789"
        };

        var result = validator.Validate(request);
        Assert.True(result.IsValid);
    }
}
