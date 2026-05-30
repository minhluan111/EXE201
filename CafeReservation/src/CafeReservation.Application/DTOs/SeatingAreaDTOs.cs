namespace CafeReservation.Application.DTOs;

// Public

public class SeatingAreaResponse
{
    public Guid Id { get; set; }
    public string TableType { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public int TotalTables { get; set; }
    public int ReservableTables { get; set; }
    public string? PreviewImage { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}

// Admin 

public class CreateSeatingAreaRequest
{
    public string TableType { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public int TotalTables { get; set; }
    public int ReservableTables { get; set; }
    public string? PreviewImage { get; set; }
    public string? Description { get; set; }
}

public class UpdateSeatingAreaRequest
{
    public string TableType { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public int TotalTables { get; set; }
    public int ReservableTables { get; set; }
    public string? PreviewImage { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}
