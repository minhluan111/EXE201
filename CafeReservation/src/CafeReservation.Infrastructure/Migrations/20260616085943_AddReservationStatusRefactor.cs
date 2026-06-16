using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafeReservation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReservationStatusRefactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_reservations_unique_table_slot",
                table: "reservations");

            migrationBuilder.AddColumn<string>(
                name: "password_reset_token",
                table: "users",
                type: "character varying(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "password_reset_token_expiry",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "check_in_image_url",
                table: "reservations",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "checked_in_at",
                table: "reservations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "checked_in_by",
                table: "reservations",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "confirmed_at",
                table: "reservations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "confirmed_by",
                table: "reservations",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

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

            migrationBuilder.DropColumn(
                name: "password_reset_token",
                table: "users");

            migrationBuilder.DropColumn(
                name: "password_reset_token_expiry",
                table: "users");

            migrationBuilder.DropColumn(
                name: "check_in_image_url",
                table: "reservations");

            migrationBuilder.DropColumn(
                name: "checked_in_at",
                table: "reservations");

            migrationBuilder.DropColumn(
                name: "checked_in_by",
                table: "reservations");

            migrationBuilder.DropColumn(
                name: "confirmed_at",
                table: "reservations");

            migrationBuilder.DropColumn(
                name: "confirmed_by",
                table: "reservations");

            migrationBuilder.CreateIndex(
                name: "ix_reservations_unique_table_slot",
                table: "reservations",
                columns: new[] { "table_name", "reservation_date", "start_time" },
                unique: true,
                filter: "status IN (0, 4) AND table_name IS NOT NULL");
        }
    }
}
