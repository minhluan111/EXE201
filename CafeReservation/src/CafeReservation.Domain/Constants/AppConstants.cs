namespace CafeReservation.Domain.Constants;

public static class AppConstants
{
    public const int ReservationDurationMinutes = 60;
    public const int HoldingTimeMinutes = 45;

    public static readonly TimeOnly OpeningHour = new(8, 0);
    public static readonly TimeOnly ClosingHour = new(20, 0);

    public static class TableTypes
    {
        public const string Window2Seat = "2-Seat Window";
        public const string Corner2Seat = "2-Seat Corner";
        public const string Indoor4Seat = "4-Seat Indoor";
        public const string Outdoor4Seat = "4-Seat Outdoor";
    }

    public static class GuestCountRules
    {
        public const int SmallGroupMax = 2;  // → 2-seat tables
        public const int LargeGroupMax = 4;  // → 4-seat tables
    }
}
