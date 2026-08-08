using System;
using System.Linq;
using Npgsql;
using BCrypt.Net;

namespace dbquery
{
    class Program
    {
        static void Main(string[] args)
        {
            string connStr = "Host=aws-1-ap-northeast-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.stmbydppmstrtrtvophm;Password=Tam910boidam;CommandTimeout=60;";
            using (var conn = new NpgsqlConnection(connStr))
            {
                conn.Open();
                Console.WriteLine("Connected to PostgreSQL database.");

                // 1. Get or Create Monari Tenant
                Guid monariTenantId = Guid.Empty;
                using (var cmd = new NpgsqlCommand("SELECT id, name, domain FROM tenants WHERE domain LIKE '%monari%' OR name ILIKE '%monari%'", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        monariTenantId = reader.GetGuid(0);
                        Console.WriteLine($"Found existing Monari Tenant: {monariTenantId}");
                    }
                }

                if (monariTenantId == Guid.Empty)
                {
                    monariTenantId = Guid.NewGuid();
                    Console.WriteLine($"Creating new Monari Tenant: {monariTenantId}");
                    using (var cmd = new NpgsqlCommand("INSERT INTO tenants (id, name, domain, logo, theme_color, active, created_at) VALUES (@id, @name, @domain, @logo, @theme_color, true, NOW())", conn))
                    {
                        cmd.Parameters.AddWithValue("id", monariTenantId);
                        cmd.Parameters.AddWithValue("name", "MONARI");
                        cmd.Parameters.AddWithValue("domain", "monari.localhost");
                        cmd.Parameters.AddWithValue("logo", "/assets/monari/decor/logo.png");
                        cmd.Parameters.AddWithValue("theme_color", "#C86D51");
                        cmd.ExecuteNonQuery();
                    }
                }
                else
                {
                    using (var cmd = new NpgsqlCommand("UPDATE tenants SET name = @name, logo = @logo, theme_color = @theme_color, active = true WHERE id = @id", conn))
                    {
                        cmd.Parameters.AddWithValue("id", monariTenantId);
                        cmd.Parameters.AddWithValue("name", "MONARI");
                        cmd.Parameters.AddWithValue("logo", "/assets/monari/decor/logo.png");
                        cmd.Parameters.AddWithValue("theme_color", "#C86D51");
                        cmd.ExecuteNonQuery();
                    }
                }

                // 2. Insert or Update Monari RestaurantInfo
                Console.WriteLine("Upserting Monari RestaurantInfo...");
                using (var cmd = new NpgsqlCommand("DELETE FROM \"RestaurantInfo\" WHERE \"TenantId\" = @tenantId", conn))
                {
                    cmd.Parameters.AddWithValue("tenantId", monariTenantId);
                    cmd.ExecuteNonQuery();
                }

                using (var cmd = new NpgsqlCommand(@"
                    INSERT INTO ""RestaurantInfo"" (
                        ""Id"", ""TenantId"", ""Address"", ""Phone"", ""OpeningHours"", ""MapUrl"",
                        ""NoShowAfterMinutes"", ""CancelBeforeMinutes"", ""BookingLeadMinutes"",
                        ""ConfirmationDeadlineMinutes"", ""HighRiskThresholdMinutes"",
                        ""MediumRiskThresholdMinutes"", ""LowRiskThresholdMinutes"",
                        ""AutoConfirmThresholdMinutes"", ""OpeningTime"", ""ClosingTime"", ""UpdatedAt""
                    ) VALUES (
                        @id, @tenantId, @address, @phone, @openingHours, @mapUrl,
                        15, 30, 15, 30, 60, 120, 180, 180, '07:30:00'::time, '22:30:00'::time, NOW()
                    )", conn))
                {
                    cmd.Parameters.AddWithValue("id", Guid.NewGuid());
                    cmd.Parameters.AddWithValue("tenantId", monariTenantId);
                    cmd.Parameters.AddWithValue("address", "250 Trần Hưng Đạo, Đông Hòa, Hồ Chí Minh, Vietnam");
                    cmd.Parameters.AddWithValue("phone", "0908 123 456");
                    cmd.Parameters.AddWithValue("openingHours", "07:30 – 22:30");
                    cmd.Parameters.AddWithValue("mapUrl", "https://maps.google.com/maps?q=250+Trần+Hưng+Đạo,+Đông+Hòa,+Dĩ+An,+Bình+Dương&t=&z=15&ie=UTF8&iwloc=&output=embed");
                    cmd.ExecuteNonQuery();
                }

                // 3. Upsert Monari Seating Areas
                Console.WriteLine("Upserting Monari Seating Areas...");
                using (var cmd = new NpgsqlCommand("DELETE FROM seating_areas WHERE \"TenantId\" = @tenantId", conn))
                {
                    cmd.Parameters.AddWithValue("tenantId", monariTenantId);
                    cmd.ExecuteNonQuery();
                }

                var areas = new[]
                {
                    new { Type = "Bàn 2 người (1)", Area = "Ban công & Cửa sổ view phố", Total = 1, Reservable = 1, Img = "/assets/monari/tables/ban_2_nguoi_1.jpg", Desc = "Bàn 2 người cạnh cửa sổ view phố thoáng mát, lãng mạn." },
                    new { Type = "Bàn 2 người (2)", Area = "Ban công & Cửa sổ view phố", Total = 1, Reservable = 1, Img = "/assets/monari/tables/ban_2_nguoi_2.jpg", Desc = "Bàn 2 người cạnh ban công yên tĩnh, thích hợp hẹn hò hoặc làm việc." },
                    new { Type = "Bàn 2 người (3)", Area = "Ban công & Cửa sổ view phố", Total = 1, Reservable = 1, Img = "/assets/monari/tables/ban_2_nguoi_3.jpg", Desc = "Bàn 2 người view phố đón ánh sáng tự nhiên ấm cúng." },
                    new { Type = "Bàn 2 người (4)", Area = "Ban công & Cửa sổ view phố", Total = 1, Reservable = 1, Img = "/assets/monari/tables/ban_2_nguoi_4.jpg", Desc = "Bàn 2 người góc riêng tư thoải mái và thư giãn." },
                    new { Type = "Bàn 4 người (1)", Area = "Khu trung tâm ấm cúng", Total = 1, Reservable = 1, Img = "/assets/monari/tables/ban_4_nguoi_1.jpg", Desc = "Bàn 4 người ghế sofa êm ái, ánh sáng dịu nhẹ." },
                    new { Type = "Bàn 4 người (2)", Area = "Khu trung tâm ấm cúng", Total = 1, Reservable = 1, Img = "/assets/monari/tables/ban_4_nguoi_2.jpg", Desc = "Bàn 4 người bàn gỗ rộng rãi sang trọng, gần quầy bánh." },
                    new { Type = "Bàn 4 người (3)", Area = "Khu trung tâm ấm cúng", Total = 1, Reservable = 1, Img = "/assets/monari/tables/ban_4_nguoi_3.jpg", Desc = "Bàn 4 người tiện nghi, lý tưởng cho nhóm bạn bè sum họp." },
                    new { Type = "Bàn 8 người", Area = "Phòng tiệc & Họp mặt nhóm", Total = 1, Reservable = 1, Img = "/assets/monari/tables/ban_8_nguoi.jpg", Desc = "Bàn dài 8 người tiện nghi cho tiệc sinh nhật, họp mặt gia đình và nhóm lớn." }
                };

                foreach (var a in areas)
                {
                    using (var cmd = new NpgsqlCommand(@"
                        INSERT INTO seating_areas (id, ""TenantId"", table_type, area, total_tables, reservable_tables, preview_image, description, is_active, has_power_outlet)
                        VALUES (@id, @tenantId, @type, @area, @total, @reservable, @img, @desc, true, true)", conn))
                    {
                        cmd.Parameters.AddWithValue("id", Guid.NewGuid());
                        cmd.Parameters.AddWithValue("tenantId", monariTenantId);
                        cmd.Parameters.AddWithValue("type", a.Type);
                        cmd.Parameters.AddWithValue("area", a.Area);
                        cmd.Parameters.AddWithValue("total", a.Total);
                        cmd.Parameters.AddWithValue("reservable", a.Reservable);
                        cmd.Parameters.AddWithValue("img", a.Img);
                        cmd.Parameters.AddWithValue("desc", a.Desc);
                        cmd.ExecuteNonQuery();
                    }
                }

                // 4. Upsert Monari Menu Items
                Console.WriteLine("Upserting Monari Menu Items...");
                using (var cmd = new NpgsqlCommand("DELETE FROM \"MenuItems\" WHERE \"TenantId\" = @tenantId", conn))
                {
                    cmd.Parameters.AddWithValue("tenantId", monariTenantId);
                    cmd.ExecuteNonQuery();
                }

                var menuItems = new[]
                {
                    new { Name = "Set Bánh Trung Thu Cao Cấp (4 bánh)", Cat = 5, Price = 552000m, Tag = 2, Img = "/assets/monari/menu/set_banh_trung_thu.jpg", Desc = "Set bánh thủ công cao cấp gồm 4 bánh (2 nhân ngọt tinh tuyển, 2 nhân mặn đậm đà) trong hộp quà sang trọng.", Sales = 158 },
                    new { Name = "Coco Matcha Tươi Mát", Cat = 1, Price = 55000m, Tag = 3, Img = "/assets/monari/menu/coco_matcha.jpg", Desc = "Sự kết hợp hoàn hảo giữa bột matcha nguyên chất cao cấp và nước dừa xiêm tươi ngọt mát thanh lành.", Sales = 380 },
                    new { Name = "Nước Dừa Quế Hoa", Cat = 1, Price = 49000m, Tag = 4, Img = "/assets/monari/menu/nuoc_dua_que_hoa.jpg", Desc = "Nước dừa tươi thanh khiết ướp cánh hoa quế ngạt ngào, mang lại cảm giác thanh mát thư thái tuyệt đối.", Sales = 240 },
                    new { Name = "Trà Lựu Đỏ Ngọc Trai", Cat = 1, Price = 48000m, Tag = 2, Img = "/assets/monari/menu/tra_luu_do.jpg", Desc = "Trà lựu đỏ thơm nồng nàn vị trái cây tươi chín mọng kết hợp trân châu ngọc trai giòn sần sật.", Sales = 490 },
                    new { Name = "Trà Ổi Hồng Ngọc Trai", Cat = 1, Price = 48000m, Tag = 3, Img = "/assets/monari/menu/tra_oi_hong.jpg", Desc = "Hương thơm ngọt ngào quyến rũ từ ổi hồng nhiệt đới hòa quyện lớp trà thanh nhẹ cùng hạt ngọc trai tươi.", Sales = 310 }
                };

                foreach (var m in menuItems)
                {
                    using (var cmd = new NpgsqlCommand(@"
                        INSERT INTO ""MenuItems"" (""Id"", ""TenantId"", ""Name"", ""Category"", ""ImageUrl"", ""Price"", ""Description"", ""Tag"", ""SalesCount"", ""IsActive"", ""CreatedAt"")
                        VALUES (@id, @tenantId, @name, @cat, @img, @price, @desc, @tag, @sales, true, NOW())", conn))
                    {
                        cmd.Parameters.AddWithValue("id", Guid.NewGuid());
                        cmd.Parameters.AddWithValue("tenantId", monariTenantId);
                        cmd.Parameters.AddWithValue("name", m.Name);
                        cmd.Parameters.AddWithValue("cat", m.Cat);
                        cmd.Parameters.AddWithValue("img", m.Img);
                        cmd.Parameters.AddWithValue("price", m.Price);
                        cmd.Parameters.AddWithValue("desc", m.Desc);
                        cmd.Parameters.AddWithValue("tag", m.Tag);
                        cmd.Parameters.AddWithValue("sales", m.Sales);
                        cmd.ExecuteNonQuery();
                    }
                }

                // 5. Setup / Update Accounts for Monari and Yaki Cafe
                Console.WriteLine("\n=== Setting up Accounts (Admin, Staff, Manager) ===");
                
                Guid yakiTenantId = Guid.Parse("11111111-0000-0000-0000-000000000001");

                var accountsToSetup = new[]
                {
                    // Yaki Cafe accounts
                    new { Email = "admin@yakicafe.com", Pass = "Admin@123", Role = 1, Name = "Yaki Café Admin", TenantId = yakiTenantId },
                    new { Email = "staff@yakicafe.com", Pass = "Staff@123", Role = 2, Name = "Yaki Café Staff", TenantId = yakiTenantId },
                    new { Email = "manager@yakicafe.com", Pass = "Manager@123", Role = 3, Name = "Yaki Café Manager", TenantId = yakiTenantId },

                    // Monari accounts
                    new { Email = "admin@monari.com", Pass = "Admin@123", Role = 1, Name = "Monari Admin", TenantId = monariTenantId },
                    new { Email = "staff@monari.com", Pass = "Staff@123", Role = 2, Name = "Monari Staff", TenantId = monariTenantId },
                    new { Email = "manager@monari.com", Pass = "Manager@123", Role = 3, Name = "Monari Manager", TenantId = monariTenantId }
                };

                foreach (var acc in accountsToSetup)
                {
                    string hash = BCrypt.Net.BCrypt.HashPassword(acc.Pass, 11);
                    
                    bool exists = false;
                    using (var cmd = new NpgsqlCommand("SELECT COUNT(1) FROM users WHERE email = @email AND \"TenantId\" = @tenantId", conn))
                    {
                        cmd.Parameters.AddWithValue("email", acc.Email);
                        cmd.Parameters.AddWithValue("tenantId", acc.TenantId);
                        long count = (long)cmd.ExecuteScalar();
                        exists = count > 0;
                    }

                    if (exists)
                    {
                        using (var cmd = new NpgsqlCommand("UPDATE users SET password_hash = @hash, role = @role, full_name = @name WHERE email = @email AND \"TenantId\" = @tenantId", conn))
                        {
                            cmd.Parameters.AddWithValue("hash", hash);
                            cmd.Parameters.AddWithValue("role", acc.Role);
                            cmd.Parameters.AddWithValue("name", acc.Name);
                            cmd.Parameters.AddWithValue("email", acc.Email);
                            cmd.Parameters.AddWithValue("tenantId", acc.TenantId);
                            cmd.ExecuteNonQuery();
                        }
                        Console.WriteLine($"Updated: {acc.Email} (Role: {acc.Role})");
                    }
                    else
                    {
                        using (var cmd = new NpgsqlCommand("INSERT INTO users (id, full_name, email, phone, password_hash, role, created_at, \"TenantId\") VALUES (@id, @name, @email, @phone, @hash, @role, NOW(), @tenantId)", conn))
                        {
                            cmd.Parameters.AddWithValue("id", Guid.NewGuid());
                            cmd.Parameters.AddWithValue("name", acc.Name);
                            cmd.Parameters.AddWithValue("email", acc.Email);
                            cmd.Parameters.AddWithValue("phone", "0908123456");
                            cmd.Parameters.AddWithValue("hash", hash);
                            cmd.Parameters.AddWithValue("role", acc.Role);
                            cmd.Parameters.AddWithValue("tenantId", acc.TenantId);
                            cmd.ExecuteNonQuery();
                        }
                        Console.WriteLine($"Inserted: {acc.Email} (Role: {acc.Role})");
                    }
                }

                // Verify accounts
                Console.WriteLine("\n=== Account Verification Check ===");
                foreach (var acc in accountsToSetup)
                {
                    using (var cmd = new NpgsqlCommand("SELECT password_hash, role, \"TenantId\" FROM users WHERE email = @email AND \"TenantId\" = @tenantId", conn))
                    {
                        cmd.Parameters.AddWithValue("email", acc.Email);
                        cmd.Parameters.AddWithValue("tenantId", acc.TenantId);
                        using (var reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                string storedHash = reader.GetString(0);
                                int role = reader.GetInt32(1);
                                bool ok = BCrypt.Net.BCrypt.Verify(acc.Pass, storedHash);
                                Console.WriteLine($"[Password Match={ok}] {acc.Email} | Role: {role} | Tenant: {reader.GetGuid(2)}");
                            }
                        }
                    }
                }

                Console.WriteLine("\n=== Database Seeding Completed Successfully! ===");
            }
        }
    }
}
