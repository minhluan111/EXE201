using CafeReservation.Application.Helpers;
using Xunit;
using FluentAssertions;

namespace CafeReservation.Tests;

public class OpeningHoursParserTests
{
    [Theory]
    [InlineData("06:00-22:00")]      // ASCII dash
    [InlineData("06:00 – 22:00")]    // En Dash
    [InlineData("06:00 — 22:00")]    // Em Dash
    [InlineData("06:00 − 22:00")]    // Unicode Minus
    public void Parse_ShouldSupportDifferentDashCharacters(string input)
    {
        // Act
        var intervals = OpeningHoursParser.Parse(input);

        // Assert
        intervals.Should().HaveCount(1);
        intervals[0].Start.Should().Be(new TimeOnly(6, 0));
        intervals[0].End.Should().Be(new TimeOnly(22, 0));
    }

    [Fact]
    public void Parse_ShouldSupportMultipleIntervals()
    {
        // Arrange
        var input = "06:00 – 13:00 16:00 – 22:00"; // En dash used here

        // Act
        var intervals = OpeningHoursParser.Parse(input);

        // Assert
        intervals.Should().HaveCount(2);
        intervals[0].Start.Should().Be(new TimeOnly(6, 0));
        intervals[0].End.Should().Be(new TimeOnly(13, 0));
        intervals[1].Start.Should().Be(new TimeOnly(16, 0));
        intervals[1].End.Should().Be(new TimeOnly(22, 0));
    }

    [Theory]
    [InlineData(8, 0, 10, 0, true)]    // 08:00 inside
    [InlineData(13, 30, 15, 30, false)] // 13:30 outside (starts during break)
    [InlineData(16, 30, 18, 30, true)]  // 16:30 inside
    [InlineData(22, 30, 23, 30, false)] // 22:30 outside
    public void IsWithinOpeningHours_BoundaryChecks(int startH, int startM, int endH, int endM, bool expected)
    {
        // Arrange
        var input = "06:00 – 13:00 16:00 – 22:00";
        var intervals = OpeningHoursParser.Parse(input);
        
        var targetStart = new TimeOnly(startH, startM);
        var targetEnd = new TimeOnly(endH, endM);
        
        // Act
        var result = OpeningHoursParser.IsWithinOpeningHours(targetStart, targetEnd, intervals);

        // Assert
        result.Should().Be(expected);
    }
}
