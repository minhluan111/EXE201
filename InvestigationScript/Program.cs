using System;
using System.Collections.Generic;
using System.Linq;
using CafeReservation.Application.DTOs;
using CafeReservation.Application.Services;
using CafeReservation.Domain.Entities;
using CafeReservation.Domain.Enums;
using Npgsql;

namespace InvestigationScript
{
    class Program
    {
        static void Main(string[] args)
        {
            var connectionString = "Host=aws-1-ap-northeast-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.stmbydppmstrtrtvophm;Password=Tam910boidam;CommandTimeout=60;";

            Console.WriteLine("=======================================================================");
            Console.WriteLine("ĐỒNG BỘ 12 ĐƠN ĐẶT BÀN THEO KHUNG GIỜ TRÒN 1 TIẾNG (KHÔNG CÓ PHÚT LẺ)");
            Console.WriteLine("=======================================================================");

            try
            {
                using var conn = new NpgsqlConnection(connectionString);
                conn.Open();
                Console.WriteLine("✅ Đã kết nối Supabase PostgreSQL thành công!\n");

                // 1. Lấy thông tin Tenant MONARI
                Guid monariTenantId = Guid.Empty;
                using (var cmd = new NpgsqlCommand("SELECT id, name, domain FROM tenants WHERE domain ILIKE '%monari%' OR name ILIKE '%monari%'", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        monariTenantId = reader.GetGuid(0);
                        Console.WriteLine($"[1] Tenant: {reader.GetString(1)} (ID: {monariTenantId}, Domain: {reader.GetString(2)})");
                    }
                }

                if (monariTenantId == Guid.Empty)
                {
                    Console.WriteLine("❌ Không tìm thấy Tenant MONARI!");
                    return;
                }

                // 2. Lấy Seating Areas của MONARI
                var seatingAreas = new Dictionary<string, Guid>();
                using (var cmd = new NpgsqlCommand(@"
                    SELECT id, table_type, area
                    FROM seating_areas
                    WHERE ""TenantId"" = @tid", conn))
                {
                    cmd.Parameters.AddWithValue("tid", monariTenantId);
                    using var reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        var id = reader.GetGuid(0);
                        var tableType = reader.GetString(1);
                        var area = reader.GetString(2);
                        seatingAreas[tableType] = id;
                        Console.WriteLine($"   -> Seating Area: [{tableType}] - {area} (ID: {id})");
                    }
                }

                Guid table2Id = seatingAreas["Bàn 2 người (1)"];
                Guid table4Id = seatingAreas["Bàn 4 người (1)"];

                // 3. Danh sách 12 Users
                string defaultPassword = "Password123@";
                string passwordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword, 11);

                var usersData = new[]
                {
                    new { FullName = "Vũ Đình Thắng", Email = "ThangVDSE180277@fpt.edu.vn", Phone = "0865593057" },
                    new { FullName = "Đào Ngọc Hoàng", Email = "HoangDNSE182987@fpt.edu.vn", Phone = "0868507859" },
                    new { FullName = "Lâm Thành Ý", Email = "YLTSE173000@fpt.edu.vn", Phone = "0398958382" },
                    new { FullName = "Hoàng Quốc Hùng", Email = "HungHQSA170098@fpt.edu.vn", Phone = "0937620302" },
                    new { FullName = "Hồ Hữu Phước", Email = "PhuocHHSE183803@fpt.edu.vn", Phone = "0825294979" },
                    new { FullName = "Nguyễn Thành Đạt", Email = "thanhdat.rd.70369@gmail.com", Phone = "0867606719" },
                    new { FullName = "Trần Tiến Hùng", Email = "HungTTSE184584@fpt.edu.vn", Phone = "0944870316" },
                    new { FullName = "Phạm Thị Kim Hương", Email = "phamthikimhuong.11a1@gmail.com", Phone = "0343699478" },
                    new { FullName = "Nguyễn Việt Huy", Email = "HuyNVSE173703@fpt.edu.vn", Phone = "0386331428" },
                    new { FullName = "Nguyễn Minh Khang", Email = "KhangNMSE171557@fpt.edu.vn", Phone = "0866539581" },
                    new { FullName = "Nguyễn Tiến Lâm", Email = "LamNTSE173420@fpt.edu.vn", Phone = "0767331427" },
                    new { FullName = "Trần Công Tâm", Email = "trancongtam613@gmail.com", Phone = "0986345675" }
                };

                Console.WriteLine("\n[2] Kiểm tra/Cập nhật 12 Users...");
                foreach (var u in usersData)
                {
                    using (var cmd = new NpgsqlCommand(@"
                        INSERT INTO users (id, ""TenantId"", email, full_name, phone, password_hash, role, created_at)
                        VALUES (@id, @tid, @email, @name, @phone, @hash, 0, @now)
                        ON CONFLICT (email, ""TenantId"") DO UPDATE 
                        SET full_name = @name, phone = @phone, password_hash = @hash, role = 0", conn))
                    {
                        cmd.Parameters.AddWithValue("id", Guid.NewGuid());
                        cmd.Parameters.AddWithValue("tid", monariTenantId);
                        cmd.Parameters.AddWithValue("email", u.Email);
                        cmd.Parameters.AddWithValue("name", u.FullName);
                        cmd.Parameters.AddWithValue("phone", u.Phone);
                        cmd.Parameters.AddWithValue("hash", passwordHash);
                        cmd.Parameters.AddWithValue("now", DateTime.UtcNow);
                        cmd.ExecuteNonQuery();
                    }
                }
                Console.WriteLine("   ✔ 12 Users đã đồng bộ chính xác!");

                // 4. Danh sách 12 đơn đặt bàn: KHUNG GIỜ TRÒN 1 TIẾNG (00 phút), KHÔNG CÓ PHÚT LẺ
                var reservationsConfig = new[]
                {
                    // =========================================================================
                    // 🟢 BÀN 1: Bàn 2 người (1) - 6 ĐƠN
                    // =========================================================================
                    // 1. Vũ Đình Thắng - 09/08 09:00 - 10:00 (Nối tiếp sau đơn 08:00 -> High Risk -> Normal)
                    new {
                        Email = "ThangVDSE180277@fpt.edu.vn",
                        Name = "Vũ Đình Thắng",
                        Phone = "0865593057",
                        Code = "MON-THG91",
                        AreaId = table2Id,
                        TableName = "Bàn 2 người (1)",
                        Date = new DateOnly(2026, 8, 9),
                        Start = new TimeOnly(9, 0),
                        End = new TimeOnly(10, 0),
                        Guests = 2,
                        Status = ReservationStatus.Completed,
                        ConfirmedBy = "System (AutoConfirm)",
                        ConfirmedAt = (DateTime?)new DateTime(2026, 8, 8, 14, 0, 0, DateTimeKind.Utc),
                        CheckedInAt = (DateTime?)new DateTime(2026, 8, 9, 9, 2, 0, DateTimeKind.Utc),
                        CheckedInBy = (string?)"staff@monari.com",
                        Note = "Cà phê sáng ban công view phố",
                        CreatedAt = new DateTime(2026, 8, 8, 14, 0, 0, DateTimeKind.Utc),
                        BookingPriority = "Normal",
                        BookingPriorityLabel = "⚪ Bình thường",
                        BookingPriorityExplanation = "Booking này ở trạng thái chờ xác nhận, chưa thuộc nhóm ưu tiên bảo vệ lịch.",
                        RiskLevel = "High",
                        DisplayType = "BookingRisk",
                        ReviewBadge = "🔴 Khả năng chờ - Cao",
                        ReviewStatus = "NotRequired",
                        ReviewPriority = 4,
                        ReviewExplanation = "Đã có khách đặt trước. Có khả năng khách sẽ phải chờ nếu lượt sử dụng trước đó kéo dài hơn dự kiến."
                    },
                    // 2. Lâm Thành Ý - 09/08 14:00 - 15:00 (Đơn đầu tiên phiên chiều -> Preferred)
                    new {
                        Email = "YLTSE173000@fpt.edu.vn",
                        Name = "Lâm Thành Ý",
                        Phone = "0398958382",
                        Code = "MON-YLT93",
                        AreaId = table2Id,
                        TableName = "Bàn 2 người (1)",
                        Date = new DateOnly(2026, 8, 9),
                        Start = new TimeOnly(14, 0),
                        End = new TimeOnly(15, 0),
                        Guests = 2,
                        Status = ReservationStatus.Completed,
                        ConfirmedBy = "System (AutoConfirm)",
                        ConfirmedAt = (DateTime?)new DateTime(2026, 8, 9, 7, 45, 0, DateTimeKind.Utc),
                        CheckedInAt = (DateTime?)new DateTime(2026, 8, 9, 14, 2, 0, DateTimeKind.Utc),
                        CheckedInBy = (string?)"staff@monari.com",
                        Note = "Trà chiều và thưởng thức Set bánh trung thu",
                        CreatedAt = new DateTime(2026, 8, 9, 7, 45, 0, DateTimeKind.Utc),
                        BookingPriority = "Preferred",
                        BookingPriorityLabel = "⭐ Được ưu tiên",
                        BookingPriorityExplanation = "Booking này đã được xác nhận (Auto Confirm hoặc Nhân viên xác nhận) và được ưu tiên bảo vệ khi các booking Risk phát sinh sau đó.",
                        RiskLevel = "Available",
                        DisplayType = "Available",
                        ReviewBadge = "🟢 An toàn",
                        ReviewStatus = "NotRequired",
                        ReviewPriority = 10,
                        ReviewExplanation = "Lịch đặt bàn an toàn, sẵn sàng phục vụ."
                    },
                    // 3. Hồ Hữu Phước - 09/08 16:00 - 17:00 (Cách đơn 2 120m -> Medium Risk -> Normal)
                    new {
                        Email = "PhuocHHSE183803@fpt.edu.vn",
                        Name = "Hồ Hữu Phước",
                        Phone = "0825294979",
                        Code = "MON-PHU95",
                        AreaId = table2Id,
                        TableName = "Bàn 2 người (1)",
                        Date = new DateOnly(2026, 8, 9),
                        Start = new TimeOnly(16, 0),
                        End = new TimeOnly(17, 0),
                        Guests = 2,
                        Status = ReservationStatus.Completed,
                        ConfirmedBy = "System (AutoConfirm)",
                        ConfirmedAt = (DateTime?)new DateTime(2026, 8, 9, 10, 0, 0, DateTimeKind.Utc),
                        CheckedInAt = (DateTime?)new DateTime(2026, 8, 9, 16, 5, 0, DateTimeKind.Utc),
                        CheckedInBy = (string?)"staff@monari.com",
                        Note = "Bàn gần cửa sổ ngắm đường phố lên đèn",
                        CreatedAt = new DateTime(2026, 8, 9, 10, 0, 0, DateTimeKind.Utc),
                        BookingPriority = "Normal",
                        BookingPriorityLabel = "⚪ Bình thường",
                        BookingPriorityExplanation = "Booking này ở trạng thái chờ xác nhận, chưa thuộc nhóm ưu tiên bảo vệ lịch.",
                        RiskLevel = "Medium",
                        DisplayType = "BookingRisk",
                        ReviewBadge = "🟠 Khả năng chờ - Vừa",
                        ReviewStatus = "NotRequired",
                        ReviewPriority = 3,
                        ReviewExplanation = "Đã có khách đặt trước. Có khả năng khách sẽ phải chờ nếu lượt sử dụng trước đó kéo dài hơn dự kiến."
                    },
                    // 4. Trần Tiến Hùng - 10/08 08:00 - 09:00 (Đơn đầu tiên sáng 10/08 -> Preferred)
                    new {
                        Email = "HungTTSE184584@fpt.edu.vn",
                        Name = "Trần Tiến Hùng",
                        Phone = "0944870316",
                        Code = "MON-TTH101",
                        AreaId = table2Id,
                        TableName = "Bàn 2 người (1)",
                        Date = new DateOnly(2026, 8, 10),
                        Start = new TimeOnly(8, 0),
                        End = new TimeOnly(9, 0),
                        Guests = 2,
                        Status = ReservationStatus.Completed,
                        ConfirmedBy = "System (AutoConfirm)",
                        ConfirmedAt = (DateTime?)new DateTime(2026, 8, 9, 21, 0, 0, DateTimeKind.Utc),
                        CheckedInAt = (DateTime?)new DateTime(2026, 8, 10, 8, 5, 0, DateTimeKind.Utc),
                        CheckedInBy = (string?)"staff@monari.com",
                        Note = "Cà phê sáng làm việc, cần ổ điện cắm laptop",
                        CreatedAt = new DateTime(2026, 8, 9, 21, 0, 0, DateTimeKind.Utc),
                        BookingPriority = "Preferred",
                        BookingPriorityLabel = "⭐ Được ưu tiên",
                        BookingPriorityExplanation = "Booking này đã được xác nhận (Auto Confirm hoặc Nhân viên xác nhận) và được ưu tiên bảo vệ khi các booking Risk phát sinh sau đó.",
                        RiskLevel = "Available",
                        DisplayType = "Available",
                        ReviewBadge = "🟢 An toàn",
                        ReviewStatus = "NotRequired",
                        ReviewPriority = 10,
                        ReviewExplanation = "Lịch đặt bàn an toàn, sẵn sàng phục vụ."
                    },
                    // 5. Phạm Thị Kim Hương - 10/08 10:00 - 11:00 (Cách đơn 4 120m -> Medium Risk -> Normal)
                    new {
                        Email = "phamthikimhuong.11a1@gmail.com",
                        Name = "Phạm Thị Kim Hương",
                        Phone = "0343699478",
                        Code = "MON-KHU102",
                        AreaId = table2Id,
                        TableName = "Bàn 2 người (1)",
                        Date = new DateOnly(2026, 8, 10),
                        Start = new TimeOnly(10, 0),
                        End = new TimeOnly(11, 0),
                        Guests = 2,
                        Status = ReservationStatus.Completed,
                        ConfirmedBy = "System (AutoConfirm)",
                        ConfirmedAt = (DateTime?)new DateTime(2026, 8, 10, 7, 15, 0, DateTimeKind.Utc),
                        CheckedInAt = (DateTime?)new DateTime(2026, 8, 10, 10, 5, 0, DateTimeKind.Utc),
                        CheckedInBy = (string?)"staff@monari.com",
                        Note = "Dùng trà ổi hồng và nước dừa quế hoa",
                        CreatedAt = new DateTime(2026, 8, 10, 7, 15, 0, DateTimeKind.Utc),
                        BookingPriority = "Normal",
                        BookingPriorityLabel = "⚪ Bình thường",
                        BookingPriorityExplanation = "Booking này ở trạng thái chờ xác nhận, chưa thuộc nhóm ưu tiên bảo vệ lịch.",
                        RiskLevel = "Medium",
                        DisplayType = "BookingRisk",
                        ReviewBadge = "🟠 Khả năng chờ - Vừa",
                        ReviewStatus = "NotRequired",
                        ReviewPriority = 3,
                        ReviewExplanation = "Đã có khách đặt trước. Có khả năng khách sẽ phải chờ nếu lượt sử dụng trước đó kéo dài hơn dự kiến."
                    },
                    // 6. Trần Công Tâm - 10/08 18:00 - 19:00 (Đơn đầu tiên tối 10/08 -> Preferred, Đang ngồi)
                    new {
                        Email = "trancongtam613@gmail.com",
                        Name = "Trần Công Tâm",
                        Phone = "0986345675",
                        Code = "MON-TCT106",
                        AreaId = table2Id,
                        TableName = "Bàn 2 người (1)",
                        Date = new DateOnly(2026, 8, 10),
                        Start = new TimeOnly(18, 0),
                        End = new TimeOnly(19, 0),
                        Guests = 2,
                        Status = ReservationStatus.CheckedIn,
                        ConfirmedBy = "System (AutoConfirm)",
                        ConfirmedAt = (DateTime?)new DateTime(2026, 8, 10, 16, 30, 0, DateTimeKind.Utc),
                        CheckedInAt = (DateTime?)new DateTime(2026, 8, 10, 18, 5, 0, DateTimeKind.Utc),
                        CheckedInBy = (string?)"staff@monari.com",
                        Note = "Khách đang check-in dùng nước tại góc ban công thoáng mát",
                        CreatedAt = new DateTime(2026, 8, 10, 16, 30, 0, DateTimeKind.Utc),
                        BookingPriority = "Preferred",
                        BookingPriorityLabel = "⭐ Được ưu tiên",
                        BookingPriorityExplanation = "Booking này đã được xác nhận (Auto Confirm hoặc Nhân viên xác nhận) và được ưu tiên bảo vệ khi các booking Risk phát sinh sau đó.",
                        RiskLevel = "Available",
                        DisplayType = "Available",
                        ReviewBadge = "🟢 An toàn",
                        ReviewStatus = "Reviewed",
                        ReviewPriority = 10,
                        ReviewExplanation = "Lịch đặt bàn an toàn, sẵn sàng phục vụ."
                    },

                    // =========================================================================
                    // 🔵 BÀN 2: Bàn 4 người (1) - 6 ĐƠN
                    // =========================================================================
                    // 7. Đào Ngọc Hoàng - 09/08 09:00 - 10:00 (Đơn đầu tiên sáng 09/08 -> Preferred)
                    new {
                        Email = "HoangDNSE182987@fpt.edu.vn",
                        Name = "Đào Ngọc Hoàng",
                        Phone = "0868507859",
                        Code = "MON-HOA92",
                        AreaId = table4Id,
                        TableName = "Bàn 4 người (1)",
                        Date = new DateOnly(2026, 8, 9),
                        Start = new TimeOnly(9, 0),
                        End = new TimeOnly(10, 0),
                        Guests = 4,
                        Status = ReservationStatus.Completed,
                        ConfirmedBy = "System (AutoConfirm)",
                        ConfirmedAt = (DateTime?)new DateTime(2026, 8, 8, 20, 15, 0, DateTimeKind.Utc),
                        CheckedInAt = (DateTime?)new DateTime(2026, 8, 9, 9, 5, 0, DateTimeKind.Utc),
                        CheckedInBy = (string?)"staff@monari.com",
                        Note = "Họp nhóm đồ án capstone, cần không gian yên tĩnh",
                        CreatedAt = new DateTime(2026, 8, 8, 20, 15, 0, DateTimeKind.Utc),
                        BookingPriority = "Preferred",
                        BookingPriorityLabel = "⭐ Được ưu tiên",
                        BookingPriorityExplanation = "Booking này đã được xác nhận (Auto Confirm hoặc Nhân viên xác nhận) và được ưu tiên bảo vệ khi các booking Risk phát sinh sau đó.",
                        RiskLevel = "Available",
                        DisplayType = "Available",
                        ReviewBadge = "🟢 An toàn",
                        ReviewStatus = "NotRequired",
                        ReviewPriority = 10,
                        ReviewExplanation = "Lịch đặt bàn an toàn, sẵn sàng phục vụ."
                    },
                    // 8. Hoàng Quốc Hùng - 09/08 14:00 - 15:00 (Đơn đầu tiên chiều 09/08 -> Preferred)
                    new {
                        Email = "HungHQSA170098@fpt.edu.vn",
                        Name = "Hoàng Quốc Hùng",
                        Phone = "0937620302",
                        Code = "MON-HNG94",
                        AreaId = table4Id,
                        TableName = "Bàn 4 người (1)",
                        Date = new DateOnly(2026, 8, 9),
                        Start = new TimeOnly(14, 0),
                        End = new TimeOnly(15, 0),
                        Guests = 3,
                        Status = ReservationStatus.Completed,
                        ConfirmedBy = "System (AutoConfirm)",
                        ConfirmedAt = (DateTime?)new DateTime(2026, 8, 9, 8, 20, 0, DateTimeKind.Utc),
                        CheckedInAt = (DateTime?)new DateTime(2026, 8, 9, 14, 5, 0, DateTimeKind.Utc),
                        CheckedInBy = (string?)"staff@monari.com",
                        Note = "Gặp mặt đối tác trao đổi công việc",
                        CreatedAt = new DateTime(2026, 8, 9, 8, 20, 0, DateTimeKind.Utc),
                        BookingPriority = "Preferred",
                        BookingPriorityLabel = "⭐ Được ưu tiên",
                        BookingPriorityExplanation = "Booking này đã được xác nhận (Auto Confirm hoặc Nhân viên xác nhận) và được ưu tiên bảo vệ khi các booking Risk phát sinh sau đó.",
                        RiskLevel = "Available",
                        DisplayType = "Available",
                        ReviewBadge = "🟢 An toàn",
                        ReviewStatus = "NotRequired",
                        ReviewPriority = 10,
                        ReviewExplanation = "Lịch đặt bàn an toàn, sẵn sàng phục vụ."
                    },
                    // 9. Nguyễn Thành Đạt - 09/08 16:00 - 17:00 (Cách đơn 8 120m -> Medium Risk -> Normal)
                    new {
                        Email = "thanhdat.rd.70369@gmail.com",
                        Name = "Nguyễn Thành Đạt",
                        Phone = "0867606719",
                        Code = "MON-DAT96",
                        AreaId = table4Id,
                        TableName = "Bàn 4 người (1)",
                        Date = new DateOnly(2026, 8, 9),
                        Start = new TimeOnly(16, 0),
                        End = new TimeOnly(17, 0),
                        Guests = 4,
                        Status = ReservationStatus.Completed,
                        ConfirmedBy = "System (AutoConfirm)",
                        ConfirmedAt = (DateTime?)new DateTime(2026, 8, 9, 11, 30, 0, DateTimeKind.Utc),
                        CheckedInAt = (DateTime?)new DateTime(2026, 8, 9, 16, 5, 0, DateTimeKind.Utc),
                        CheckedInBy = (string?)"staff@monari.com",
                        Note = "Tiệc họp mặt nhóm bạn cuối tuần",
                        CreatedAt = new DateTime(2026, 8, 9, 11, 30, 0, DateTimeKind.Utc),
                        BookingPriority = "Normal",
                        BookingPriorityLabel = "⚪ Bình thường",
                        BookingPriorityExplanation = "Booking này ở trạng thái chờ xác nhận, chưa thuộc nhóm ưu tiên bảo vệ lịch.",
                        RiskLevel = "Medium",
                        DisplayType = "BookingRisk",
                        ReviewBadge = "🟠 Khả năng chờ - Vừa",
                        ReviewStatus = "NotRequired",
                        ReviewPriority = 3,
                        ReviewExplanation = "Đã có khách đặt trước. Có khả năng khách sẽ phải chờ nếu lượt sử dụng trước đó kéo dài hơn dự kiến."
                    },
                    // 10. Nguyễn Việt Huy - 10/08 09:00 - 10:00 (Đơn đầu tiên sáng 10/08 -> Preferred)
                    new {
                        Email = "HuyNVSE173703@fpt.edu.vn",
                        Name = "Nguyễn Việt Huy",
                        Phone = "0386331428",
                        Code = "MON-NVH103",
                        AreaId = table4Id,
                        TableName = "Bàn 4 người (1)",
                        Date = new DateOnly(2026, 8, 10),
                        Start = new TimeOnly(9, 0),
                        End = new TimeOnly(10, 0),
                        Guests = 3,
                        Status = ReservationStatus.Completed,
                        ConfirmedBy = "System (AutoConfirm)",
                        ConfirmedAt = (DateTime?)new DateTime(2026, 8, 10, 7, 0, 0, DateTimeKind.Utc),
                        CheckedInAt = (DateTime?)new DateTime(2026, 8, 10, 9, 5, 0, DateTimeKind.Utc),
                        CheckedInBy = (string?)"staff@monari.com",
                        Note = "Thảo luận nhóm và làm việc",
                        CreatedAt = new DateTime(2026, 8, 10, 7, 0, 0, DateTimeKind.Utc),
                        BookingPriority = "Preferred",
                        BookingPriorityLabel = "⭐ Được ưu tiên",
                        BookingPriorityExplanation = "Booking này đã được xác nhận (Auto Confirm hoặc Nhân viên xác nhận) và được ưu tiên bảo vệ khi các booking Risk phát sinh sau đó.",
                        RiskLevel = "Available",
                        DisplayType = "Available",
                        ReviewBadge = "🟢 An toàn",
                        ReviewStatus = "NotRequired",
                        ReviewPriority = 10,
                        ReviewExplanation = "Lịch đặt bàn an toàn, sẵn sàng phục vụ."
                    },
                    // 11. Nguyễn Minh Khang - 10/08 14:00 - 15:00 (Đơn đầu tiên chiều 10/08 -> Preferred)
                    new {
                        Email = "KhangNMSE171557@fpt.edu.vn",
                        Name = "Nguyễn Minh Khang",
                        Phone = "0866539581",
                        Code = "MON-NMK104",
                        AreaId = table4Id,
                        TableName = "Bàn 4 người (1)",
                        Date = new DateOnly(2026, 8, 10),
                        Start = new TimeOnly(14, 0),
                        End = new TimeOnly(15, 0),
                        Guests = 3,
                        Status = ReservationStatus.Completed,
                        ConfirmedBy = "System (AutoConfirm)",
                        ConfirmedAt = (DateTime?)new DateTime(2026, 8, 10, 11, 0, 0, DateTimeKind.Utc),
                        CheckedInAt = (DateTime?)new DateTime(2026, 8, 10, 14, 5, 0, DateTimeKind.Utc),
                        CheckedInBy = (string?)"staff@monari.com",
                        Note = "Thưởng thức Coco Matcha và làm việc",
                        CreatedAt = new DateTime(2026, 8, 10, 11, 0, 0, DateTimeKind.Utc),
                        BookingPriority = "Preferred",
                        BookingPriorityLabel = "⭐ Được ưu tiên",
                        BookingPriorityExplanation = "Booking này đã được xác nhận (Auto Confirm hoặc Nhân viên xác nhận) và được ưu tiên bảo vệ khi các booking Risk phát sinh sau đó.",
                        RiskLevel = "Available",
                        DisplayType = "Available",
                        ReviewBadge = "🟢 An toàn",
                        ReviewStatus = "NotRequired",
                        ReviewPriority = 10,
                        ReviewExplanation = "Lịch đặt bàn an toàn, sẵn sàng phục vụ."
                    },
                    // 12. Nguyễn Tiến Lâm - 10/08 16:00 - 17:00 (Cách đơn 11 120m -> Medium Risk -> Normal -> Confirmed)
                    new {
                        Email = "LamNTSE173420@fpt.edu.vn",
                        Name = "Nguyễn Tiến Lâm",
                        Phone = "0767331427",
                        Code = "MON-NTL105",
                        AreaId = table4Id,
                        TableName = "Bàn 4 người (1)",
                        Date = new DateOnly(2026, 8, 10),
                        Start = new TimeOnly(16, 0),
                        End = new TimeOnly(17, 0),
                        Guests = 4,
                        Status = ReservationStatus.Confirmed,
                        ConfirmedBy = "staff@monari.com",
                        ConfirmedAt = (DateTime?)new DateTime(2026, 8, 10, 15, 0, 0, DateTimeKind.Utc),
                        CheckedInAt = (DateTime?)null,
                        CheckedInBy = (string?)null,
                        Note = "Hẹn hò bạn bè tối đầu tuần",
                        CreatedAt = new DateTime(2026, 8, 10, 14, 0, 0, DateTimeKind.Utc),
                        BookingPriority = "Normal",
                        BookingPriorityLabel = "⚪ Bình thường",
                        BookingPriorityExplanation = "Booking này ở trạng thái chờ xác nhận, chưa thuộc nhóm ưu tiên bảo vệ lịch.",
                        RiskLevel = "Medium",
                        DisplayType = "BookingRisk",
                        ReviewBadge = "🟠 Khả năng chờ - Vừa",
                        ReviewStatus = "Reviewed",
                        ReviewPriority = 3,
                        ReviewExplanation = "Đã có khách đặt trước. Có khả năng khách sẽ phải chờ nếu lượt sử dụng trước đó kéo dài hơn dự kiến."
                    }
                };

                Console.WriteLine("\n[3] Cập nhật 12 đơn đặt bàn vào Supabase...");
                foreach (var r in reservationsConfig)
                {
                    using (var cmd = new NpgsqlCommand(@"
                        INSERT INTO reservations (
                            id, reservation_code, ""TenantId"", guest_name, guest_email, guest_phone,
                            seating_area_id, table_name, reservation_date, start_time, end_time,
                            guest_count, status, special_note, created_at, confirmed_at, confirmed_by,
                            checked_in_at, checked_in_by,
                            risk_level, display_type, review_status, review_priority, review_badge, review_explanation,
                            booking_priority, booking_priority_label, booking_priority_explanation, decision_evaluated_at
                        ) VALUES (
                            @id, @code, @tid, @name, @email, @phone,
                            @areaId, @tableName, @date, @start, @end,
                            @guests, @status, @note, @createdAt, @confirmedAt, @confirmedBy,
                            @checkedInAt, @checkedInBy,
                            @riskLevel, @displayType, @reviewStatus, @reviewPriority, @reviewBadge, @reviewExplanation,
                            @bookingPriority, @bookingPriorityLabel, @bookingPriorityExplanation, @decisionEvaluatedAt
                        )
                        ON CONFLICT (reservation_code) DO UPDATE 
                        SET ""TenantId"" = @tid, guest_name = @name, guest_email = @email, guest_phone = @phone,
                            seating_area_id = @areaId, table_name = @tableName, reservation_date = @date,
                            start_time = @start, end_time = @end, guest_count = @guests, status = @status,
                            special_note = @note, created_at = @createdAt, confirmed_at = @confirmedAt, confirmed_by = @confirmedBy,
                            checked_in_at = @checkedInAt, checked_in_by = @checkedInBy,
                            risk_level = @riskLevel, display_type = @displayType, 
                            review_status = @reviewStatus, review_priority = @reviewPriority, review_badge = @reviewBadge, review_explanation = @reviewExplanation,
                            booking_priority = @bookingPriority, booking_priority_label = @bookingPriorityLabel, booking_priority_explanation = @bookingPriorityExplanation,
                            decision_evaluated_at = @decisionEvaluatedAt", conn))
                    {
                        cmd.Parameters.AddWithValue("id", Guid.NewGuid());
                        cmd.Parameters.AddWithValue("code", r.Code);
                        cmd.Parameters.AddWithValue("tid", monariTenantId);
                        cmd.Parameters.AddWithValue("name", r.Name);
                        cmd.Parameters.AddWithValue("email", r.Email);
                        cmd.Parameters.AddWithValue("phone", r.Phone);
                        cmd.Parameters.AddWithValue("areaId", r.AreaId);
                        cmd.Parameters.AddWithValue("tableName", r.TableName);
                        cmd.Parameters.AddWithValue("date", r.Date);
                        cmd.Parameters.AddWithValue("start", r.Start);
                        cmd.Parameters.AddWithValue("end", r.End);
                        cmd.Parameters.AddWithValue("guests", r.Guests);
                        cmd.Parameters.AddWithValue("status", (int)r.Status);
                        cmd.Parameters.AddWithValue("note", r.Note);
                        cmd.Parameters.AddWithValue("createdAt", r.CreatedAt);
                        cmd.Parameters.AddWithValue("confirmedAt", (object?)r.ConfirmedAt ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("confirmedBy", (object?)r.ConfirmedBy ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("checkedInAt", (object?)r.CheckedInAt ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("checkedInBy", (object?)r.CheckedInBy ?? DBNull.Value);

                        // Decision Engine fields
                        cmd.Parameters.AddWithValue("riskLevel", r.RiskLevel);
                        cmd.Parameters.AddWithValue("displayType", r.DisplayType);
                        cmd.Parameters.AddWithValue("reviewStatus", r.ReviewStatus);
                        cmd.Parameters.AddWithValue("reviewPriority", r.ReviewPriority);
                        cmd.Parameters.AddWithValue("reviewBadge", r.ReviewBadge);
                        cmd.Parameters.AddWithValue("reviewExplanation", r.ReviewExplanation);
                        cmd.Parameters.AddWithValue("bookingPriority", r.BookingPriority);
                        cmd.Parameters.AddWithValue("bookingPriorityLabel", r.BookingPriorityLabel);
                        cmd.Parameters.AddWithValue("bookingPriorityExplanation", r.BookingPriorityExplanation);
                        cmd.Parameters.AddWithValue("decisionEvaluatedAt", DateTime.UtcNow);

                        cmd.ExecuteNonQuery();
                    }

                    Console.WriteLine($"   ✔ [{r.Code}] {r.Name,-20} | Bàn: {r.TableName} ({r.Date:yyyy-MM-dd} {r.Start:HH:mm}-{r.End:HH:mm}) | Priority: [{r.BookingPriority} - {r.BookingPriorityLabel}] | Risk: [{r.ReviewBadge}] | Status: {r.Status}");
                }

                // 5. In báo cáo tổng hợp
                Console.WriteLine("\n=======================================================================");
                Console.WriteLine("KẾT QUẢ ĐỐI SOÁT CUỐI CÙNG TRÊN SUPABASE (TENANT MONARI):");
                Console.WriteLine("=======================================================================");

                using (var cmd = new NpgsqlCommand(@"
                    SELECT reservation_code, guest_name, reservation_date, start_time, end_time, table_name,
                           status, booking_priority, booking_priority_label, review_priority, review_status, review_badge,
                           risk_level, display_type
                    FROM reservations
                    WHERE ""TenantId"" = @tid
                    ORDER BY table_name, reservation_date, start_time", conn))
                {
                    cmd.Parameters.AddWithValue("tid", monariTenantId);
                    using var reader = cmd.ExecuteReader();
                    int idx = 1;
                    while (reader.Read())
                    {
                        int st = reader.GetInt32(6);
                        string stStr = st switch
                        {
                            0 => "Reserved (Chờ xử lý)",
                            1 => "Confirmed (Đã xác nhận)",
                            2 => "Completed (Hoàn tất)",
                            3 => "Cancelled (Đã hủy)",
                            4 => "CheckedIn (Đang ngồi)",
                            _ => st.ToString()
                        };

                        Console.WriteLine($"  [{idx++,2}] {reader["reservation_code"],-10} | {reader["guest_name"],-20} | {reader["table_name"],-15} | {DateOnly.FromDateTime(reader.GetDateTime(2)),-10} ({TimeOnly.FromTimeSpan(reader.GetTimeSpan(3)):HH:mm} - {TimeOnly.FromTimeSpan(reader.GetTimeSpan(4)):HH:mm})");
                        Console.WriteLine($"       Trạng thái: {stStr,-24} | BookingPriority: {reader["booking_priority"]} ({reader["booking_priority_label"]})");
                        Console.WriteLine($"       Review: Priority={reader["review_priority"]}, Status={reader["review_status"]}, Badge={reader["review_badge"]}");
                        Console.WriteLine($"       Risk: Level={reader["risk_level"]}, DisplayType={reader["display_type"]}\n");
                    }
                }

                Console.WriteLine("=======================================================================");
                Console.WriteLine("HOÀN TẤT ĐỒNG BỘ DỮ LIỆU THÀNH CÔNG!");
                Console.WriteLine("=======================================================================");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi: {ex.Message}\n{ex.StackTrace}");
            }
        }
    }
}
