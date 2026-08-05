using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafeReservation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixUniqueTableSlotExcludeCancelled : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Drop the old unique index that incorrectly blocks Cancelled (5) slots
            migrationBuilder.DropIndex(
                name: "ix_reservations_unique_table_slot",
                table: "reservations");

            // Step 2: Delete duplicate Reserved (1) bookings keeping only the earliest per slot
            // This cleans up test data that created multiple Reserved bookings on the same slot
            migrationBuilder.Sql(@"
                DELETE FROM reservations
                WHERE status = 1
                  AND table_name IS NOT NULL
                  AND id NOT IN (
                    SELECT DISTINCT ON (table_name, reservation_date, start_time) id
                    FROM reservations
                    WHERE status = 1 AND table_name IS NOT NULL
                    ORDER BY table_name, reservation_date, start_time, created_at ASC
                  );
            ");

            // Step 3: Recreate index EXCLUDING Cancelled (5) — only active slots block the slot
            // Active = Confirmed (0), Reserved (1), CheckedIn (4)
            migrationBuilder.CreateIndex(
                name: "ix_reservations_unique_table_slot",
                table: "reservations",
                columns: new[] { "table_name", "reservation_date", "start_time" },
                unique: true,
                filter: "status IN (0, 1, 4) AND table_name IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_reservations_unique_table_slot",
                table: "reservations");

            migrationBuilder.CreateIndex(
                name: "ix_reservations_unique_table_slot",
                table: "reservations",
                columns: new[] { "table_name", "reservation_date", "start_time" },
                unique: true,
                filter: "status IN (0, 4, 5) AND table_name IS NOT NULL");
        }
    }
}
