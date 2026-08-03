using System.Text.RegularExpressions;

namespace CafeReservation.Application.Helpers;

public static class OpeningHoursParser
{
    // Regex matches "HH:mm" - "HH:mm" regardless of spaces
    // e.g., "7:30 - 22:00" or "6:00-13:30"
    private static readonly Regex TimePattern = new(
        @"(?<start>\d{1,2}:\d{2})\s*-\s*(?<end>\d{1,2}:\d{2})", 
        RegexOptions.Compiled);

    public static IReadOnlyList<(TimeOnly Start, TimeOnly End)> Parse(string openingHoursStr)
    {
        var result = new List<(TimeOnly Start, TimeOnly End)>();

        if (string.IsNullOrWhiteSpace(openingHoursStr))
            return result;

        // Normalize various dash characters to ASCII hyphen
        var normalizedStr = openingHoursStr
            .Replace('–', '-') // En Dash
            .Replace('—', '-') // Em Dash
            .Replace('−', '-'); // Unicode Minus

        var matches = TimePattern.Matches(normalizedStr);
        foreach (Match match in matches)
        {
            if (TimeOnly.TryParse(match.Groups["start"].Value, out var start) &&
                TimeOnly.TryParse(match.Groups["end"].Value, out var end))
            {
                result.Add((start, end));
            }
        }

        return result;
    }

    public static bool IsWithinOpeningHours(
        TimeOnly targetStart, 
        TimeOnly targetEnd, 
        IReadOnlyList<(TimeOnly Start, TimeOnly End)> intervals,
        TimeOnly? fallbackStart = null,
        TimeOnly? fallbackEnd = null)
    {
        if (intervals.Count == 0)
        {
            if (fallbackStart.HasValue && fallbackEnd.HasValue)
            {
                var fs = fallbackStart.Value;
                var fe = fallbackEnd.Value;
                return targetStart >= fs && targetStart <= fe && targetEnd >= fs && targetEnd <= fe && targetEnd >= targetStart;
            }
            return true; // Default allow if format is empty/invalid
        }

        foreach (var interval in intervals)
        {
            if (targetStart >= interval.Start && targetStart <= interval.End && targetEnd >= interval.Start && targetEnd <= interval.End && targetEnd >= targetStart)
            {
                return true;
            }
        }
        return false;
    }
}
