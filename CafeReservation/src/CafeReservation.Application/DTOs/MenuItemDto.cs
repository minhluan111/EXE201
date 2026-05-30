using CafeReservation.Domain.Enums;

namespace CafeReservation.Application.DTOs;

public class MenuItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public string Tag { get; set; } = string.Empty;
    public int SalesCount { get; set; }
}
