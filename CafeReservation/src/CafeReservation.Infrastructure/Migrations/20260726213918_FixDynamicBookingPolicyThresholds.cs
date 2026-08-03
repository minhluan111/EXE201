using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafeReservation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixDynamicBookingPolicyThresholds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "MediumRiskThresholdMinutes",
                table: "RestaurantInfo",
                type: "integer",
                nullable: false,
                defaultValue: 120,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "LowRiskThresholdMinutes",
                table: "RestaurantInfo",
                type: "integer",
                nullable: false,
                defaultValue: 180,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "HighRiskThresholdMinutes",
                table: "RestaurantInfo",
                type: "integer",
                nullable: false,
                defaultValue: 60,
                oldClrType: typeof(int),
                oldType: "integer");
                
            migrationBuilder.Sql(@"
                UPDATE ""RestaurantInfo"" 
                SET ""HighRiskThresholdMinutes"" = 60, ""MediumRiskThresholdMinutes"" = 120, ""LowRiskThresholdMinutes"" = 180 
                WHERE ""HighRiskThresholdMinutes"" <= 0 OR ""MediumRiskThresholdMinutes"" <= 0 OR ""LowRiskThresholdMinutes"" <= 0;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "MediumRiskThresholdMinutes",
                table: "RestaurantInfo",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 120);

            migrationBuilder.AlterColumn<int>(
                name: "LowRiskThresholdMinutes",
                table: "RestaurantInfo",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 180);

            migrationBuilder.AlterColumn<int>(
                name: "HighRiskThresholdMinutes",
                table: "RestaurantInfo",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 60);
        }
    }
}
