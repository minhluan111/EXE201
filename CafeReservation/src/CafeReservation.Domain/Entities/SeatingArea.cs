namespace CafeReservation.Domain.Entities;

public class SeatingArea
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TableType { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public int TotalTables { get; set; }
    public int ReservableTables { get; set; }
    public string? PreviewImage { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
