using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafeReservation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDynamicBookingPolicyToRestaurantInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AutoConfirmThresholdMinutes",
                table: "RestaurantInfo",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "ClosingTime",
                table: "RestaurantInfo",
                type: "time without time zone",
                nullable: false,
                defaultValue: new TimeOnly(0, 0, 0));

            migrationBuilder.AddColumn<int>(
                name: "HighRiskThresholdMinutes",
                table: "RestaurantInfo",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "LowRiskThresholdMinutes",
                table: "RestaurantInfo",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MediumRiskThresholdMinutes",
                table: "RestaurantInfo",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "OpeningTime",
                table: "RestaurantInfo",
                type: "time without time zone",
                nullable: false,
                defaultValue: new TimeOnly(0, 0, 0));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AutoConfirmThresholdMinutes",
                table: "RestaurantInfo");

            migrationBuilder.DropColumn(
                name: "ClosingTime",
                table: "RestaurantInfo");

            migrationBuilder.DropColumn(
                name: "HighRiskThresholdMinutes",
                table: "RestaurantInfo");

            migrationBuilder.DropColumn(
                name: "LowRiskThresholdMinutes",
                table: "RestaurantInfo");

            migrationBuilder.DropColumn(
                name: "MediumRiskThresholdMinutes",
                table: "RestaurantInfo");

            migrationBuilder.DropColumn(
                name: "OpeningTime",
                table: "RestaurantInfo");
        }
    }
}
