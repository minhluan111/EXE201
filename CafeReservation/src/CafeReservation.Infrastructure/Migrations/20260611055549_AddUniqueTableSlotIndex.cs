using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafeReservation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueTableSlotIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "ix_reservations_unique_table_slot",
                table: "reservations",
                columns: new[] { "table_name", "reservation_date", "start_time" },
                unique: true,
                filter: "status IN (0, 4) AND table_name IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_reservations_unique_table_slot",
                table: "reservations");
        }
    }
}
