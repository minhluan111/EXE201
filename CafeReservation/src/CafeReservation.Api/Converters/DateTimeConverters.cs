using System.Text.Json;
using System.Text.Json.Serialization;

namespace CafeReservation.Api.Converters;

/// <summary>
/// Handles DateOnly serialization/deserialization in format "yyyy-MM-dd".
/// Example: "2026-06-01"
/// </summary>
public class DateOnlyJsonConverter : JsonConverter<DateOnly>
{
    private const string Format = "yyyy-MM-dd";

    public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString()!;
        if (DateOnly.TryParseExact(value, Format, out var result))
            return result;
        if (DateOnly.TryParse(value, out result))
            return result;
        throw new JsonException($"Cannot parse '{value}' as DateOnly. Expected format: {Format} (e.g. \"2026-06-01\")");
    }

    public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options)
        => writer.WriteStringValue(value.ToString(Format));
}

/// <summary>
/// Handles TimeOnly serialization in format "HH:mm:ss".
/// Example: "10:00:00"
/// </summary>
public class TimeOnlyJsonConverter : JsonConverter<TimeOnly>
{
    private const string Format = "HH:mm:ss";

    public override TimeOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString()!;
        if (TimeOnly.TryParseExact(value, Format, out var result))
            return result;
        if (TimeOnly.TryParseExact(value, "HH:mm", out result))
            return result;
        if (TimeOnly.TryParse(value, out result))
            return result;
        throw new JsonException($"Cannot parse '{value}' as TimeOnly. Expected format: {Format} (e.g. \"10:00:00\")");
    }

    public override void Write(Utf8JsonWriter writer, TimeOnly value, JsonSerializerOptions options)
        => writer.WriteStringValue(value.ToString(Format));
}
