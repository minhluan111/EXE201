using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafeReservation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDecisionSnapshotToReservation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE reservations ADD COLUMN IF NOT EXISTS risk_level character varying(50) DEFAULT 'Available';
                ALTER TABLE reservations ADD COLUMN IF NOT EXISTS display_type character varying(50) DEFAULT 'Available';
                ALTER TABLE reservations ADD COLUMN IF NOT EXISTS review_status character varying(50) DEFAULT 'PendingReview';
                ALTER TABLE reservations ADD COLUMN IF NOT EXISTS review_priority integer DEFAULT 5;
                ALTER TABLE reservations ADD COLUMN IF NOT EXISTS review_badge character varying(100) DEFAULT '🟢 An toàn';
                ALTER TABLE reservations ADD COLUMN IF NOT EXISTS review_explanation text;
                ALTER TABLE reservations ADD COLUMN IF NOT EXISTS booking_priority character varying(50) DEFAULT 'Normal';
                ALTER TABLE reservations ADD COLUMN IF NOT EXISTS booking_priority_label character varying(100) DEFAULT '⚪ Bình thường';
                ALTER TABLE reservations ADD COLUMN IF NOT EXISTS booking_priority_explanation text;
                ALTER TABLE reservations ADD COLUMN IF NOT EXISTS decision_evaluated_at timestamp with time zone;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "risk_level",
                table: "reservations",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "review_status",
                table: "reservations",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "review_badge",
                table: "reservations",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "display_type",
                table: "reservations",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "booking_priority_label",
                table: "reservations",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "booking_priority",
                table: "reservations",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);
        }
    }
}
