using System;
using System.Collections.Generic;
using CafeReservation.Application.DTOs;
using CafeReservation.Application.Services;
using CafeReservation.Domain.Entities;
using CafeReservation.Domain.Enums;
using Xunit;

namespace CafeReservation.Tests;

public class AutoConfirmProtectionTests
{
    private readonly RestaurantInfoDto _defaultPolicy = new()
    {
        HighRiskThresholdMinutes = 60,
        MediumRiskThresholdMinutes = 120,
        LowRiskThresholdMinutes = 180,
        AutoConfirmThresholdMinutes = 180,
        OpeningTime = new TimeOnly(7, 0),
        ClosingTime = new TimeOnly(22, 0)
    };

    [Fact]
    public void EvaluateTableRisk_UnconfirmedReservedBooking_DoesNotIncreaseRiskOfConfirmedBooking()
    {
        // Scenario:
        // Booking A: 08:00, Confirmed (Auto-Confirmed)
        // Booking B: 07:00, Reserved (Pending Staff Review, submitted after A)

        var bookingA = new Reservation
        {
            Id = Guid.NewGuid(),
            ReservationCode = "RES-A",
            StartTime = new TimeOnly(8, 0),
            EndTime = new TimeOnly(9, 0),
            Status = ReservationStatus.Confirmed,
            ConfirmedBy = "System (AutoConfirm)",
            TableName = "Corner 1"
        };

        var bookingB = new Reservation
        {
            Id = Guid.NewGuid(),
            ReservationCode = "RES-B",
            StartTime = new TimeOnly(7, 0),
            EndTime = new TimeOnly(8, 0),
            Status = ReservationStatus.Reserved,
            TableName = "Corner 1"
        };

        // 1. Evaluate Risk for Confirmed Booking A against Pending Booking B
        var riskForA = ReservationService.EvaluateTableRisk(
            bookingA.StartTime,
            new List<Reservation> { bookingB },
            _defaultPolicy,
            targetStatus: ReservationStatus.Confirmed
        );

        // Assert: Unconfirmed Booking B MUST NOT elevate Risk of Confirmed Booking A!
        Assert.Equal(ReservationService.RiskLevel.Available, riskForA);

        // 2. Evaluate Risk for Pending Booking B against Confirmed Booking A
        var riskForB = ReservationService.EvaluateTableRisk(
            bookingB.StartTime,
            new List<Reservation> { bookingA },
            _defaultPolicy,
            targetStatus: ReservationStatus.Reserved
        );

        // Assert: Confirmed Booking A DOES exert Risk pressure on Pending Booking B (distance = 60 mins <= HighRiskThreshold)
        Assert.Equal(ReservationService.RiskLevel.High, riskForB);
    }

    [Fact]
    public void EvaluateTableRisk_WhenBothBookingsAreConfirmed_BothReflectRiskDistance()
    {
        // Scenario:
        // Staff reviews Booking B (07:00) and decides to Confirm B. Now both A (08:00) and B (07:00) are Confirmed!

        var bookingA = new Reservation
        {
            Id = Guid.NewGuid(),
            ReservationCode = "RES-A",
            StartTime = new TimeOnly(8, 0),
            EndTime = new TimeOnly(9, 0),
            Status = ReservationStatus.Confirmed,
            TableName = "Corner 1"
        };

        var bookingB = new Reservation
        {
            Id = Guid.NewGuid(),
            ReservationCode = "RES-B",
            StartTime = new TimeOnly(7, 0),
            EndTime = new TimeOnly(8, 0),
            Status = ReservationStatus.Confirmed, // Staff confirmed!
            TableName = "Corner 1"
        };

        // 1. Evaluate Risk for Confirmed Booking A against now-Confirmed Booking B
        var riskForA = ReservationService.EvaluateTableRisk(
            bookingA.StartTime,
            new List<Reservation> { bookingB },
            _defaultPolicy,
            targetStatus: ReservationStatus.Confirmed
        );

        // Assert: Since B is now Confirmed, Decision Engine evaluates timeline distance (60 mins = High Risk)
        Assert.Equal(ReservationService.RiskLevel.High, riskForA);

        // 2. Evaluate Risk for Confirmed Booking B against Confirmed Booking A
        var riskForB = ReservationService.EvaluateTableRisk(
            bookingB.StartTime,
            new List<Reservation> { bookingA },
            _defaultPolicy,
            targetStatus: ReservationStatus.Confirmed
        );

        Assert.Equal(ReservationService.RiskLevel.High, riskForB);
    }
}
