using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafeReservation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReservationPolicyToRestaurantInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BookingLeadMinutes",
                table: "RestaurantInfo",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CancelBeforeMinutes",
                table: "RestaurantInfo",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ConfirmationDeadlineMinutes",
                table: "RestaurantInfo",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "NoShowAfterMinutes",
                table: "RestaurantInfo",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BookingLeadMinutes",
                table: "RestaurantInfo");

            migrationBuilder.DropColumn(
                name: "CancelBeforeMinutes",
                table: "RestaurantInfo");

            migrationBuilder.DropColumn(
                name: "ConfirmationDeadlineMinutes",
                table: "RestaurantInfo");

            migrationBuilder.DropColumn(
                name: "NoShowAfterMinutes",
                table: "RestaurantInfo");
        }
    }
}
