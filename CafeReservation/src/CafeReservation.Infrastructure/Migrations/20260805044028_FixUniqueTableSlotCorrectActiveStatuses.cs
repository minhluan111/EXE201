using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafeReservation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixUniqueTableSlotCorrectActiveStatuses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_reservations_unique_table_slot",
                table: "reservations");

            // Enum values: Confirmed=0, Cancelled=1, Completed=2, NoShow=3, CheckedIn=4, Reserved=5
            // Active table slots = Confirmed (0), CheckedIn (4), Reserved (5)
            // Inactive (freed slots) = Cancelled (1), Completed (2), NoShow (3)
            migrationBuilder.CreateIndex(
                name: "ix_reservations_unique_table_slot",
                table: "reservations",
                columns: new[] { "table_name", "reservation_date", "start_time" },
                unique: true,
                filter: "status IN (0, 4, 5) AND table_name IS NOT NULL");
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
                filter: "status IN (0, 1, 4) AND table_name IS NOT NULL");
        }
    }
}

