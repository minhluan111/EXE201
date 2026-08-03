using System;
using System.Collections.Generic;
using CafeReservation.Application.DTOs;
using CafeReservation.Application.Services;
using CafeReservation.Domain.Entities;
using CafeReservation.Domain.Exceptions;
using FluentAssertions;
using Xunit;

namespace CafeReservation.Tests;

public class DynamicPolicyValidationTests
{
    private readonly TimeOnly _targetTime = new TimeOnly(12, 0);
    private readonly List<Reservation> _emptyBookings = new();

    [Fact]
    public void EvaluateTableRisk_ZeroThresholds_ThrowsConfigurationException()
    {
        var info = new RestaurantInfoDto
        {
            HighRiskThresholdMinutes = 0,
            MediumRiskThresholdMinutes = 0,
            LowRiskThresholdMinutes = 0
        };

        Action act = () => ReservationService.EvaluateTableRisk(_targetTime, _emptyBookings, info);

        act.Should().Throw<ConfigurationException>()
            .WithMessage("Dynamic Booking Policy thresholds must be greater than 0.");
    }

    [Fact]
    public void EvaluateTableRisk_NegativeThresholds_ThrowsConfigurationException()
    {
        var info = new RestaurantInfoDto
        {
            HighRiskThresholdMinutes = -60,
            MediumRiskThresholdMinutes = -120,
            LowRiskThresholdMinutes = -180
        };

        Action act = () => ReservationService.EvaluateTableRisk(_targetTime, _emptyBookings, info);

        act.Should().Throw<ConfigurationException>()
            .WithMessage("Dynamic Booking Policy thresholds must be greater than 0.");
    }

    [Fact]
    public void EvaluateTableRisk_WrongOrdering_ThrowsConfigurationException()
    {
        var info = new RestaurantInfoDto
        {
            HighRiskThresholdMinutes = 180,
            MediumRiskThresholdMinutes = 60,
            LowRiskThresholdMinutes = 120
        };

        Action act = () => ReservationService.EvaluateTableRisk(_targetTime, _emptyBookings, info);

        act.Should().Throw<ConfigurationException>()
            .WithMessage("Dynamic Booking Policy thresholds must be ordered: High < Medium < Low.");
    }

    [Fact]
    public void EvaluateTableRisk_CorrectOrdering_DoesNotThrow()
    {
        var info = new RestaurantInfoDto
        {
            HighRiskThresholdMinutes = 60,
            MediumRiskThresholdMinutes = 120,
            LowRiskThresholdMinutes = 180
        };

        Action act = () => ReservationService.EvaluateTableRisk(_targetTime, _emptyBookings, info);

        act.Should().NotThrow<ConfigurationException>();
    }

    [Fact]
    public void EvaluateTableRisk_ValidCustomTenantThresholds_DoesNotThrow()
    {
        var info = new RestaurantInfoDto
        {
            HighRiskThresholdMinutes = 30,
            MediumRiskThresholdMinutes = 90,
            LowRiskThresholdMinutes = 150
        };

        Action act = () => ReservationService.EvaluateTableRisk(_targetTime, _emptyBookings, info);

        act.Should().NotThrow<ConfigurationException>();
    }
}

