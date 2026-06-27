using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafeReservation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSeatingAreaIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameIndex(
                name: "IX_seating_areas_TenantId",
                table: "seating_areas",
                newName: "ix_seating_areas_tenant_id");

            migrationBuilder.CreateIndex(
                name: "ix_seating_areas_tenant_active",
                table: "seating_areas",
                columns: new[] { "TenantId", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_seating_areas_tenant_area_type",
                table: "seating_areas",
                columns: new[] { "TenantId", "area", "table_type" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_seating_areas_tenant_active",
                table: "seating_areas");

            migrationBuilder.DropIndex(
                name: "ix_seating_areas_tenant_area_type",
                table: "seating_areas");

            migrationBuilder.RenameIndex(
                name: "ix_seating_areas_tenant_id",
                table: "seating_areas",
                newName: "IX_seating_areas_TenantId");
        }
    }
}
