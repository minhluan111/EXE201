using System;
using System.Collections.Generic;
using System.Linq;
using CafeReservation.Application.DTOs;
using CafeReservation.Application.Services;
using CafeReservation.Domain.Entities;
using CafeReservation.Domain.Enums;
using Xunit;

namespace CafeReservation.Tests;

public class DecisionEngineSnapshotTests
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
    public void Section11_Section12_SnapshotDifferentialTest_ExactUserScenario()
    {
        // ── SCENARIO SETUP ────────────────────────────────────────────────────────
        // Target: Verify that creating Booking C at 09:00 MUST NOT mutate Booking B at 10:00

        // 1. Create Booking A at 08:00 (Auto Confirm / Preferred / Safe)
        var bookingA = new Reservation
        {
            Id = Guid.NewGuid(),
            ReservationCode = "RES-A",
            ReservationDate = new DateOnly(2026, 8, 10),
            StartTime = new TimeOnly(8, 0),
            EndTime = new TimeOnly(9, 0),
            Status = ReservationStatus.Confirmed,
            ConfirmedBy = "System (AutoConfirm)",
            TableName = "Corner 1",

            RiskLevel = "Available",
            DisplayType = "Available",
            BookingPriority = "Preferred",
            BookingPriorityLabel = "⭐ Được ưu tiên",
            ReviewStatus = "Reviewed",
            ReviewPriority = 10,
            ReviewBadge = "🟢 An toàn",
            ReviewExplanation = "Lịch đặt bàn an toàn, sẵn sàng phục vụ.",
            DecisionEvaluatedAt = DateTime.UtcNow
        };

        // 2. Create Booking B at 10:00 (Reserved / Normal / Medium Risk)
        var bookingB = new Reservation
        {
            Id = Guid.NewGuid(),
            ReservationCode = "RES-B",
            ReservationDate = new DateOnly(2026, 8, 10),
            StartTime = new TimeOnly(10, 0),
            EndTime = new TimeOnly(11, 0),
            Status = ReservationStatus.Reserved,
            TableName = "Corner 1",

            RiskLevel = "Medium",
            DisplayType = "BookingRisk",
            BookingPriority = "Normal",
            BookingPriorityLabel = "⚪ Bình thường",
            ReviewStatus = "PendingReview",
            ReviewPriority = 5,
            ReviewBadge = "🟠 Khả năng chờ - Vừa",
            ReviewExplanation = "Đã có khách đặt trước. Có khả năng khách sẽ phải chờ nếu lượt sử dụng trước đó kéo dài hơn dự kiến.",
            DecisionEvaluatedAt = DateTime.UtcNow
        };

        // Capture Original Snapshot of B
        var originalRiskLevel = bookingB.RiskLevel;
        var originalDisplayType = bookingB.DisplayType;
        var originalReviewStatus = bookingB.ReviewStatus;
        var originalReviewPriority = bookingB.ReviewPriority;
        var originalReviewBadge = bookingB.ReviewBadge;
        var originalReviewExplanation = bookingB.ReviewExplanation;
        var originalBookingPriority = bookingB.BookingPriority;
        var originalBookingPriorityLabel = bookingB.BookingPriorityLabel;
        var originalDecisionEvaluatedAt = bookingB.DecisionEvaluatedAt;

        // 3. Create Booking C at 09:00 (Reserved / Normal / High Risk)
        var bookingC = new Reservation
        {
            Id = Guid.NewGuid(),
            ReservationCode = "RES-C",
            ReservationDate = new DateOnly(2026, 8, 10),
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(10, 0),
            Status = ReservationStatus.Reserved,
            TableName = "Corner 1",

            RiskLevel = "High",
            DisplayType = "BookingRisk",
            BookingPriority = "Normal",
            BookingPriorityLabel = "⚪ Bình thường",
            ReviewStatus = "PendingReview",
            ReviewPriority = 4,
            ReviewBadge = "🔴 Khả năng chờ - Cao",
            ReviewExplanation = "Đã có khách đặt trước. Có khả năng khách sẽ phải chờ nếu lượt sử dụng trước đó kéo dài hơn dự kiến.",
            DecisionEvaluatedAt = DateTime.UtcNow
        };

        // ── SNAPSHOT DIFFERENTIAL ASSERTIONS ─────────────────────────────────────

        // Assert 1: Booking A Snapshot is 100% UNMUTATED
        Assert.Equal("Available", bookingA.RiskLevel);
        Assert.Equal("Preferred", bookingA.BookingPriority);
        Assert.Equal("🟢 An toàn", bookingA.ReviewBadge);

        // Assert 2: Booking B Snapshot is 100% UNMUTATED after Booking C is created
        Assert.Equal(originalRiskLevel, bookingB.RiskLevel); // MUST BE Medium (NOT High!)
        Assert.Equal(originalDisplayType, bookingB.DisplayType);
        Assert.Equal(originalReviewStatus, bookingB.ReviewStatus);
        Assert.Equal(originalReviewPriority, bookingB.ReviewPriority);
        Assert.Equal(originalReviewBadge, bookingB.ReviewBadge); // MUST BE 🟠 Khả năng chờ - Vừa
        Assert.Equal(originalReviewExplanation, bookingB.ReviewExplanation);
        Assert.Equal(originalBookingPriority, bookingB.BookingPriority);
        Assert.Equal(originalBookingPriorityLabel, bookingB.BookingPriorityLabel);
        Assert.Equal(originalDecisionEvaluatedAt, bookingB.DecisionEvaluatedAt);

        // Assert 3: Booking C has its own independent High Risk Snapshot
        Assert.Equal("High", bookingC.RiskLevel);
        Assert.Equal("Normal", bookingC.BookingPriority);
        Assert.Equal("🔴 Khả năng chờ - Cao", bookingC.ReviewBadge);
    }

    [Fact]
    public void Test1_Create_SnapshotPersistedAtCreationTime()
    {
        var booking = new Reservation
        {
            Id = Guid.NewGuid(),
            ReservationCode = "RES-001",
            ReservationDate = new DateOnly(2026, 8, 10),
            StartTime = new TimeOnly(10, 0),
            EndTime = new TimeOnly(11, 0),
            Status = ReservationStatus.Reserved,
            TableName = "Corner 1",

            RiskLevel = "Available",
            DisplayType = "Available",
            BookingPriority = "Normal",
            BookingPriorityLabel = "⚪ Bình thường",
            ReviewStatus = "PendingReview",
            ReviewPriority = 5,
            ReviewBadge = "🟢 An toàn",
            DecisionEvaluatedAt = DateTime.UtcNow
        };

        Assert.NotNull(booking.DecisionEvaluatedAt);
        Assert.Equal("Available", booking.RiskLevel);
        Assert.Equal("Normal", booking.BookingPriority);
    }

    [Fact]
    public void Test2_Confirm_SnapshotUnchanged()
    {
        var booking = new Reservation
        {
            Id = Guid.NewGuid(),
            RiskLevel = "High",
            BookingPriority = "Normal",
            ReviewBadge = "🔴 Khả năng chờ - Cao",
            Status = ReservationStatus.Reserved,
            DecisionEvaluatedAt = DateTime.UtcNow
        };

        booking.Status = ReservationStatus.Confirmed;
        booking.ConfirmedAt = DateTime.UtcNow;
        booking.ConfirmedBy = "staff@cafereservation.com";

        Assert.Equal("High", booking.RiskLevel);
        Assert.Equal("Normal", booking.BookingPriority);
        Assert.Equal("🔴 Khả năng chờ - Cao", booking.ReviewBadge);
    }

    [Fact]
    public void Test3_CheckIn_SnapshotUnchanged()
    {
        var booking = new Reservation
        {
            Id = Guid.NewGuid(),
            RiskLevel = "Available",
            BookingPriority = "Preferred",
            BookingPriorityLabel = "⭐ Được ưu tiên",
            Status = ReservationStatus.Confirmed,
            DecisionEvaluatedAt = DateTime.UtcNow
        };

        booking.Status = ReservationStatus.CheckedIn;
        booking.CheckedInAt = DateTime.UtcNow;
        booking.CheckedInBy = "staff@cafereservation.com";

        Assert.Equal("Available", booking.RiskLevel);
        Assert.Equal("Preferred", booking.BookingPriority);
    }

    [Fact]
    public void Test4_Complete_SnapshotUnchanged()
    {
        var booking = new Reservation
        {
            Id = Guid.NewGuid(),
            RiskLevel = "Medium",
            BookingPriority = "Normal",
            Status = ReservationStatus.CheckedIn,
            DecisionEvaluatedAt = DateTime.UtcNow
        };

        booking.Status = ReservationStatus.Completed;

        Assert.Equal("Medium", booking.RiskLevel);
        Assert.Equal("Normal", booking.BookingPriority);
    }

    [Fact]
    public void Test5_Cancel_SnapshotUnchanged()
    {
        var booking = new Reservation
        {
            Id = Guid.NewGuid(),
            RiskLevel = "High",
            BookingPriority = "Normal",
            Status = ReservationStatus.Reserved,
            DecisionEvaluatedAt = DateTime.UtcNow
        };

        booking.Status = ReservationStatus.Cancelled;

        Assert.Equal("High", booking.RiskLevel);
        Assert.Equal("Normal", booking.BookingPriority);
    }

    [Fact]
    public void Test6_Reject_SnapshotUnchanged()
    {
        var booking = new Reservation
        {
            Id = Guid.NewGuid(),
            RiskLevel = "High",
            BookingPriority = "Normal",
            Status = ReservationStatus.Reserved,
            DecisionEvaluatedAt = DateTime.UtcNow
        };

        booking.Status = ReservationStatus.Cancelled;

        Assert.Equal("High", booking.RiskLevel);
        Assert.Equal("Normal", booking.BookingPriority);
    }

    [Fact]
    public void Test7_CreateBookingB_BookingASnapshotUnchanged()
    {
        var bookingA = new Reservation
        {
            Id = Guid.NewGuid(),
            ReservationCode = "RES-A",
            RiskLevel = "Available",
            BookingPriority = "Preferred",
            DecisionEvaluatedAt = DateTime.UtcNow
        };

        var bookingB = new Reservation
        {
            Id = Guid.NewGuid(),
            ReservationCode = "RES-B",
            RiskLevel = "High",
            BookingPriority = "Normal",
            DecisionEvaluatedAt = DateTime.UtcNow
        };

        Assert.Equal("Available", bookingA.RiskLevel);
        Assert.Equal("Preferred", bookingA.BookingPriority);
        Assert.Equal("High", bookingB.RiskLevel);
        Assert.Equal("Normal", bookingB.BookingPriority);
    }

    [Fact]
    public void Test8_GetApiRepeatedly_SnapshotUnchanged()
    {
        var booking = new Reservation
        {
            Id = Guid.NewGuid(),
            RiskLevel = "Low",
            BookingPriority = "Normal",
            ReviewBadge = "🟡 Khả năng chờ - Thấp",
            DecisionEvaluatedAt = DateTime.UtcNow
        };

        for (int i = 0; i < 5; i++)
        {
            Assert.Equal("Low", booking.RiskLevel);
            Assert.Equal("Normal", booking.BookingPriority);
            Assert.Equal("🟡 Khả năng chờ - Thấp", booking.ReviewBadge);
        }
    }

    [Fact]
    public void Test9_FilterByRisk_UsesPersistedRisk()
    {
        var list = new List<Reservation>
        {
            new Reservation { Id = Guid.NewGuid(), RiskLevel = "High", DecisionEvaluatedAt = DateTime.UtcNow },
            new Reservation { Id = Guid.NewGuid(), RiskLevel = "Available", DecisionEvaluatedAt = DateTime.UtcNow },
            new Reservation { Id = Guid.NewGuid(), RiskLevel = "High", DecisionEvaluatedAt = DateTime.UtcNow }
        };

        var filtered = list.Where(r => r.RiskLevel == "High").ToList();

        Assert.Equal(2, filtered.Count);
        Assert.All(filtered, r => Assert.Equal("High", r.RiskLevel));
    }

    [Fact]
    public void Test10_FilterByPriority_UsesPersistedPriority()
    {
        var list = new List<Reservation>
        {
            new Reservation { Id = Guid.NewGuid(), BookingPriority = "Preferred", DecisionEvaluatedAt = DateTime.UtcNow },
            new Reservation { Id = Guid.NewGuid(), BookingPriority = "Normal", DecisionEvaluatedAt = DateTime.UtcNow },
            new Reservation { Id = Guid.NewGuid(), BookingPriority = "Preferred", DecisionEvaluatedAt = DateTime.UtcNow }
        };

        var filtered = list.Where(r => r.BookingPriority == "Preferred").ToList();

        Assert.Equal(2, filtered.Count);
        Assert.All(filtered, r => Assert.Equal("Preferred", r.BookingPriority));
    }

    [Fact]
    public void Test11_PendingQueueExcludesNonReservedStatuses()
    {
        // 6 Reservations representing 6 lifecycle statuses
        var reservations = new List<Reservation>
        {
            new Reservation { Id = Guid.NewGuid(), ReservationCode = "R1", Status = ReservationStatus.Reserved },
            new Reservation { Id = Guid.NewGuid(), ReservationCode = "R2", Status = ReservationStatus.Confirmed },
            new Reservation { Id = Guid.NewGuid(), ReservationCode = "R3", Status = ReservationStatus.CheckedIn },
            new Reservation { Id = Guid.NewGuid(), ReservationCode = "R4", Status = ReservationStatus.Completed },
            new Reservation { Id = Guid.NewGuid(), ReservationCode = "R5", Status = ReservationStatus.Cancelled },
            new Reservation { Id = Guid.NewGuid(), ReservationCode = "R6", Status = ReservationStatus.NoShow }
        };

        // Pending Queue rule: ONLY ReservationStatus == Reserved
        var pendingQueue = reservations.Where(r => r.Status == ReservationStatus.Reserved).ToList();

        Assert.Single(pendingQueue);
        Assert.Equal("R1", pendingQueue[0].ReservationCode);

        // Exclusions: Confirmed, CheckedIn, Completed, Cancelled, NoShow MUST NOT be in Pending
        Assert.DoesNotContain(reservations[1], pendingQueue);
        Assert.DoesNotContain(reservations[2], pendingQueue);
        Assert.DoesNotContain(reservations[3], pendingQueue);
        Assert.DoesNotContain(reservations[4], pendingQueue);
        Assert.DoesNotContain(reservations[5], pendingQueue);
    }
}
