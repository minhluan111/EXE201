using System;
using System.Collections.Generic;
using CafeReservation.Application.DTOs;
using CafeReservation.Application.Services;
using CafeReservation.Domain.Entities;
using CafeReservation.Domain.Enums;
using Xunit;

namespace CafeReservation.Tests;

public class BookingDecisionEngineTests
{
    private readonly RestaurantInfoDto _defaultPolicy = new()
    {
        HighRiskThresholdMinutes = 60,
        MediumRiskThresholdMinutes = 120,
        LowRiskThresholdMinutes = 180,
        AutoConfirmThresholdMinutes = 180,
        OpeningTime = new TimeOnly(8, 0),
        ClosingTime = new TimeOnly(20, 0)
    };

    private List<Reservation> CreateExistingBookings(string startTimeStr)
    {
        var start = TimeOnly.Parse(startTimeStr);
        // Standard 60-minute duration reservation
        return new List<Reservation>
        {
            new Reservation
            {
                Id = Guid.NewGuid(),
                StartTime = start,
                EndTime = start.AddMinutes(60),
                Status = ReservationStatus.Confirmed,
                TableName = "Table 1"
            }
        };
    }

    [Theory]
    [InlineData("08:00", ReservationService.RiskLevel.High)]
    [InlineData("09:00", ReservationService.RiskLevel.Conflict)]
    [InlineData("10:00", ReservationService.RiskLevel.High)]
    [InlineData("11:00", ReservationService.RiskLevel.Medium)]
    [InlineData("12:00", ReservationService.RiskLevel.Low)]
    [InlineData("13:00", ReservationService.RiskLevel.Available)]
    public void EvaluateTableRisk_SymmetricDistance_ReturnsExpectedRiskLevel(string targetTimeStr, ReservationService.RiskLevel expectedRisk)
    {
        // Arrange
        var targetTime = TimeOnly.Parse(targetTimeStr);
        var existingBookings = CreateExistingBookings("09:00");

        // Act
        var actualRisk = ReservationService.EvaluateTableRisk(targetTime, existingBookings, _defaultPolicy);

        // Assert
        Assert.Equal(expectedRisk, actualRisk);
    }

    [Fact]
    public void EvaluateTableRisk_Symmetry_BeforeAndAfterReturnIdenticalResult()
    {
        // Arrange
        var beforeTime = new TimeOnly(8, 0);
        var afterTime = new TimeOnly(10, 0);
        var existingBookings = CreateExistingBookings("09:00");

        // Act
        var riskBefore = ReservationService.EvaluateTableRisk(beforeTime, existingBookings, _defaultPolicy);
        var riskAfter = ReservationService.EvaluateTableRisk(afterTime, existingBookings, _defaultPolicy);

        // Assert
        Assert.Equal(ReservationService.RiskLevel.High, riskBefore);
        Assert.Equal(ReservationService.RiskLevel.High, riskAfter);
        Assert.Equal(riskBefore, riskAfter);
    }
}
