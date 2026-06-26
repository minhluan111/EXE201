namespace CafeReservation.Domain.Entities;

public class Tenant
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;       // VD: "Cơm Tấm Ngọ"

    public string Domain { get; set; } = string.Empty;     // VD: "comtamno.localhost"

    public string? Logo { get; set; }                       // URL logo nhà hàng

    public string? ThemeColor { get; set; }                 // Màu chủ đạo (hex, VD: "#FF5733")

    public bool Active { get; set; } = true;                // Bật/tắt tenant

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation: các entities thuộc tenant này
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
    public ICollection<SeatingArea> SeatingAreas { get; set; } = new List<SeatingArea>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
    public ICollection<RestaurantInfo> RestaurantInfos { get; set; } = new List<RestaurantInfo>();
}
