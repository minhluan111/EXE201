using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafeReservation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiTenancy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // BƯỚC 1: Thêm cột TenantId vào các bảng hiện có
            // Dùng defaultValue = Guid.Empty tạm thời; sẽ backfill ở bước 4
            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "users",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "seating_areas",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Reviews",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "RestaurantInfo",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "reservations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "MenuItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Feedbacks",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            // BƯỚC 2: Tạo bảng tenants
            migrationBuilder.CreateTable(
                name: "tenants",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    domain = table.Column<string>(type: "character varying(253)", maxLength: 253, nullable: false),
                    logo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    theme_color = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tenants", x => x.id);
                });

            // BƯỚC 3: Tạo indexes
            migrationBuilder.CreateIndex(
                name: "IX_users_TenantId",
                table: "users",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_seating_areas_TenantId",
                table: "seating_areas",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_TenantId",
                table: "Reviews",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RestaurantInfo_TenantId",
                table: "RestaurantInfo",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_reservations_TenantId",
                table: "reservations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_MenuItems_TenantId",
                table: "MenuItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Feedbacks_TenantId",
                table: "Feedbacks",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "ix_tenants_domain",
                table: "tenants",
                column: "domain",
                unique: true);

            // ═══════════════════════════════════════════════════════════════════
            // BƯỚC 4: BACKFILL — PHẢI chạy TRƯỚC AddForeignKey
            // Lý do: AddForeignKey kiểm tra tất cả row hiện có phải có TenantId
            // trỏ đến tenant tồn tại. Nếu để sau sẽ lỗi 23503.
            // ═══════════════════════════════════════════════════════════════════

            var yakiTenantId = new Guid("11111111-0000-0000-0000-000000000001");
            var superAdminId = new Guid("99999999-0000-0000-0000-000000000099");

            // 4a. Insert Yaki Café tenant (tenant mặc định cho toàn bộ dữ liệu cũ)
            migrationBuilder.Sql($@"
                INSERT INTO tenants (id, name, domain, logo, theme_color, active, created_at)
                VALUES (
                    '{yakiTenantId}',
                    'Yaki Café',
                    'yakicafe.localhost',
                    NULL,
                    '#2D6A4F',
                    TRUE,
                    NOW()
                )
                ON CONFLICT (domain) DO NOTHING;
            ");

            // 4b. Backfill: gán Yaki Café TenantId cho mọi row hiện có (TenantId = Guid.Empty)
            migrationBuilder.Sql($@"
                UPDATE seating_areas      SET ""TenantId"" = '{yakiTenantId}' WHERE ""TenantId"" = '00000000-0000-0000-0000-000000000000';
                UPDATE reservations       SET ""TenantId"" = '{yakiTenantId}' WHERE ""TenantId"" = '00000000-0000-0000-0000-000000000000';
                UPDATE ""MenuItems""      SET ""TenantId"" = '{yakiTenantId}' WHERE ""TenantId"" = '00000000-0000-0000-0000-000000000000';
                UPDATE ""Reviews""        SET ""TenantId"" = '{yakiTenantId}' WHERE ""TenantId"" = '00000000-0000-0000-0000-000000000000';
                UPDATE ""Feedbacks""      SET ""TenantId"" = '{yakiTenantId}' WHERE ""TenantId"" = '00000000-0000-0000-0000-000000000000';
                UPDATE ""RestaurantInfo"" SET ""TenantId"" = '{yakiTenantId}' WHERE ""TenantId"" = '00000000-0000-0000-0000-000000000000';
                UPDATE users             SET ""TenantId"" = '{yakiTenantId}' WHERE ""TenantId"" IS NULL AND role != 4;
            ");

            // 4c. Seed Platform Super Admin (TenantId = NULL — không thuộc tenant nào)
            // Password plain-text: Platform@SuperAdmin2026!
            // Hash bcrypt cost=12 được tính sẵn để tránh dependency vào BcryptPasswordHasher
            migrationBuilder.Sql($@"
                INSERT INTO users (id, full_name, email, phone, password_hash, role, created_at, ""TenantId"")
                SELECT
                    '{superAdminId}',
                    'Platform Super Admin',
                    'superadmin@foodplatform.com',
                    '0000000000',
                    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBAQh.RBZnpRzS',
                    4,
                    NOW(),
                    NULL
                WHERE NOT EXISTS (
                    SELECT 1 FROM users WHERE email = 'superadmin@foodplatform.com'
                );
            ");

            // BƯỚC 5: AddForeignKey — mọi row đã có TenantId hợp lệ, không còn lỗi 23503
            migrationBuilder.AddForeignKey(
                name: "FK_Feedbacks_tenants_TenantId",
                table: "Feedbacks",
                column: "TenantId",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MenuItems_tenants_TenantId",
                table: "MenuItems",
                column: "TenantId",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_reservations_tenants_TenantId",
                table: "reservations",
                column: "TenantId",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RestaurantInfo_tenants_TenantId",
                table: "RestaurantInfo",
                column: "TenantId",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_tenants_TenantId",
                table: "Reviews",
                column: "TenantId",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_seating_areas_tenants_TenantId",
                table: "seating_areas",
                column: "TenantId",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_users_tenants_TenantId",
                table: "users",
                column: "TenantId",
                principalTable: "tenants",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Feedbacks_tenants_TenantId",
                table: "Feedbacks");

            migrationBuilder.DropForeignKey(
                name: "FK_MenuItems_tenants_TenantId",
                table: "MenuItems");

            migrationBuilder.DropForeignKey(
                name: "FK_reservations_tenants_TenantId",
                table: "reservations");

            migrationBuilder.DropForeignKey(
                name: "FK_RestaurantInfo_tenants_TenantId",
                table: "RestaurantInfo");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_tenants_TenantId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_seating_areas_tenants_TenantId",
                table: "seating_areas");

            migrationBuilder.DropForeignKey(
                name: "FK_users_tenants_TenantId",
                table: "users");

            migrationBuilder.DropTable(
                name: "tenants");

            migrationBuilder.DropIndex(
                name: "IX_users_TenantId",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_seating_areas_TenantId",
                table: "seating_areas");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_TenantId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_RestaurantInfo_TenantId",
                table: "RestaurantInfo");

            migrationBuilder.DropIndex(
                name: "IX_reservations_TenantId",
                table: "reservations");

            migrationBuilder.DropIndex(
                name: "IX_MenuItems_TenantId",
                table: "MenuItems");

            migrationBuilder.DropIndex(
                name: "IX_Feedbacks_TenantId",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "users");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "seating_areas");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "RestaurantInfo");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "reservations");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "MenuItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Feedbacks");
        }
    }
}
