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

                // ==========================================
                // 1. MONARI TENANT
                // ==========================================
                Guid monariTenantId = Guid.Empty;
                using (var cmd = new NpgsqlCommand("SELECT id FROM tenants WHERE domain LIKE '%monari%' OR name ILIKE '%monari%'", conn))
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

                // ==========================================
                // 2. CƠM GÀ ÔNG BÁCH TENANT
                // ==========================================
                Guid comGaTenantId = Guid.Empty;
                using (var cmd = new NpgsqlCommand("SELECT id FROM tenants WHERE domain LIKE '%comga%' OR name ILIKE '%cơm gà%' OR name ILIKE '%ông bách%'", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        comGaTenantId = reader.GetGuid(0);
                        Console.WriteLine($"Found existing Cơm Gà Ông Bách Tenant: {comGaTenantId}");
                    }
                }

                if (comGaTenantId == Guid.Empty)
                {
                    comGaTenantId = Guid.NewGuid();
                    Console.WriteLine($"Creating new Cơm Gà Ông Bách Tenant: {comGaTenantId}");
                    using (var cmd = new NpgsqlCommand("INSERT INTO tenants (id, name, domain, logo, theme_color, active, created_at) VALUES (@id, @name, @domain, @logo, @theme_color, true, NOW())", conn))
                    {
                        cmd.Parameters.AddWithValue("id", comGaTenantId);
                        cmd.Parameters.AddWithValue("name", "Cơm Gà Ông Bách");
                        cmd.Parameters.AddWithValue("domain", "comgaongbach.localhost");
                        cmd.Parameters.AddWithValue("logo", "/assets/comgaongbach/decor/logo.png");
                        cmd.Parameters.AddWithValue("theme_color", "#D97706");
                        cmd.ExecuteNonQuery();
                    }
                }
                else
                {
                    using (var cmd = new NpgsqlCommand("UPDATE tenants SET name = @name, logo = @logo, theme_color = @theme_color, domain = @domain, active = true WHERE id = @id", conn))
                    {
                        cmd.Parameters.AddWithValue("id", comGaTenantId);
                        cmd.Parameters.AddWithValue("name", "Cơm Gà Ông Bách");
                        cmd.Parameters.AddWithValue("domain", "comgaongbach.localhost");
                        cmd.Parameters.AddWithValue("logo", "/assets/comgaongbach/decor/logo.png");
                        cmd.Parameters.AddWithValue("theme_color", "#D97706");
                        cmd.ExecuteNonQuery();
                    }
                }

                // Upsert Cơm Gà Ông Bách RestaurantInfo
                Console.WriteLine("Upserting Cơm Gà Ông Bách RestaurantInfo...");
                using (var cmd = new NpgsqlCommand("DELETE FROM \"RestaurantInfo\" WHERE \"TenantId\" = @tenantId", conn))
                {
                    cmd.Parameters.AddWithValue("tenantId", comGaTenantId);
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
                        15, 30, 15, 30, 60, 120, 180, 180, '09:30:00'::time, '21:30:00'::time, NOW()
                    )", conn))
                {
                    cmd.Parameters.AddWithValue("id", Guid.NewGuid());
                    cmd.Parameters.AddWithValue("tenantId", comGaTenantId);
                    cmd.Parameters.AddWithValue("address", "146 Đường GS1, Đông Hòa, Hồ Chí Minh, Vietnam");
                    cmd.Parameters.AddWithValue("phone", "0938 123 789");
                    cmd.Parameters.AddWithValue("openingHours", "09:30 – 21:30");
                    cmd.Parameters.AddWithValue("mapUrl", "https://maps.google.com/maps?q=146+Đường+GS1,+Đông+Hòa,+Dĩ+An,+Bình+Dương&t=&z=15&ie=UTF8&iwloc=&output=embed");
                    cmd.ExecuteNonQuery();
                }

                // Upsert Cơm Gà Ông Bách Seating Areas
                Console.WriteLine("Upserting Cơm Gà Ông Bách Seating Areas...");
                using (var cmd = new NpgsqlCommand("DELETE FROM seating_areas WHERE \"TenantId\" = @tenantId", conn))
                {
                    cmd.Parameters.AddWithValue("tenantId", comGaTenantId);
                    cmd.ExecuteNonQuery();
                }

                var comGaAreas = new[]
                {
                    new { TableType = "Bàn 1 (3 người)", Total = 1, Res = 1, Desc = "Bàn ăn ấm cúng dành cho 2-3 khách", Area = "Khu trong nhà", Img = "/assets/comgaongbach/tables/ban_1.jpg" },
                    new { TableType = "Bàn 2 (5 người)", Total = 1, Res = 1, Desc = "Bàn rộng thoải mái cho nhóm bạn & gia đình 4-5 người", Area = "Khu gia đình", Img = "/assets/comgaongbach/tables/ban_2.jpg" },
                    new { TableType = "Bàn 3 (4 người)", Total = 1, Res = 1, Desc = "Bàn ăn trung tâm quán thoáng đãng", Area = "Khu trung tâm", Img = "/assets/comgaongbach/tables/ban_3.jpg" },
                    new { TableType = "Bàn 4 (4 người)", Total = 1, Res = 1, Desc = "Bàn ăn trung tâm quán thoáng đãng", Area = "Khu trung tâm", Img = "/assets/comgaongbach/tables/ban_4.jpg" },
                    new { TableType = "Bàn 5 (4 người)", Total = 1, Res = 1, Desc = "Bàn ăn trung tâm quán thoáng đãng", Area = "Khu trung tâm", Img = "/assets/comgaongbach/tables/ban_5.jpg" }
                };

                foreach (var a in comGaAreas)
                {
                    using (var cmd = new NpgsqlCommand(@"
                        INSERT INTO seating_areas (
                            id, ""TenantId"", table_type, area, total_tables, reservable_tables, preview_image, description, is_active
                        ) VALUES (
                            @id, @tenantId, @tableType, @area, @total, @res, @img, @desc, true
                        )", conn))
                    {
                        cmd.Parameters.AddWithValue("id", Guid.NewGuid());
                        cmd.Parameters.AddWithValue("tenantId", comGaTenantId);
                        cmd.Parameters.AddWithValue("tableType", a.TableType);
                        cmd.Parameters.AddWithValue("area", a.Area);
                        cmd.Parameters.AddWithValue("total", a.Total);
                        cmd.Parameters.AddWithValue("res", a.Res);
                        cmd.Parameters.AddWithValue("img", (object)a.Img ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("desc", a.Desc);
                        cmd.ExecuteNonQuery();
                    }
                }

                // Upsert Cơm Gà Ông Bách Menu Items
                Console.WriteLine("Upserting Cơm Gà Ông Bách Menu Items...");
                using (var cmd = new NpgsqlCommand("DELETE FROM \"MenuItems\" WHERE \"TenantId\" = @tenantId", conn))
                {
                    cmd.Parameters.AddWithValue("tenantId", comGaTenantId);
                    cmd.ExecuteNonQuery();
                }

                var comGaMenuItems = new[]
                {
                    new {
                        Name = "Combo Cơm Gà Luộc & Cơm Gà Quay",
                        Category = 5, // Combo
                        Price = 115000m,
                        Desc = "Sự kết hợp hoàn hảo giữa cơm gà luộc da vàng giòn ngọt thịt và cơm gà quay xém cạnh thơm lừng đậm đà cho 2 người.",
                        Tag = 2, // BestSeller
                        Sales = 450,
                        Img = "/assets/comgaongbach/menu/combo_ga_luoc_ga_quay.jpg"
                    },
                    new {
                        Name = "Combo Cơm Gà Luộc & Cơm Xá Xíu",
                        Category = 5, // Combo
                        Price = 109000m,
                        Desc = "Bộ đôi cơm gà luộc ngọt thịt cùng thịt xá xíu mật ong đỏ au, thơm lừng vị sốt gia truyền trứ danh.",
                        Tag = 3, // Trending
                        Sales = 380,
                        Img = "/assets/comgaongbach/menu/combo_ga_luoc_xa_xiu.jpg"
                    },
                    new {
                        Name = "Cơm Gà Luộc & Xá Xíu",
                        Category = 2, // MainCourse
                        Price = 65000m,
                        Desc = "Đĩa cơm vàng ươm hạt dẻo thơm ăn kèm thịt gà thả vườn luộc mềm mọng và xá xíu sốt đậm đà.",
                        Tag = 2, // BestSeller
                        Sales = 520,
                        Img = "/assets/comgaongbach/menu/com_ga_luoc_xa_xiu.jpg"
                    },
                    new {
                        Name = "Cơm Gà Luộc Thượng Hạng",
                        Category = 2, // MainCourse
                        Price = 55000m,
                        Desc = "Thịt gà ta thả vườn luộc chuẩn độ chín tới, da vàng giòn sần sật, thịt ngọt béo ngậy chấm mắm gừng gia truyền.",
                        Tag = 2, // BestSeller
                        Sales = 680,
                        Img = "/assets/comgaongbach/menu/com_ga_luoc.jpg"
                    },
                    new {
                        Name = "Cơm Gà Quay Giòn Rụm",
                        Category = 2, // MainCourse
                        Price = 58000m,
                        Desc = "Gà ướp thảo mộc quay xém da vàng rộm, dậy mùi tiêu hồi quế, thịt mềm mọng ngập tràn nước sốt thơm ngon.",
                        Tag = 3, // Trending
                        Sales = 590,
                        Img = "/assets/comgaongbach/menu/com_ga_quay.jpg"
                    },
                    new {
                        Name = "Trứng Ngâm Tương Lòng Đào",
                        Category = 4, // Snack
                        Price = 12000m,
                        Desc = "Trứng gà ta luộc lòng đào béo ngậy, ướp trong sốt tương gia truyền thơm dịu ngọt mặn hài hòa ăn kèm cơm.",
                        Tag = 1, // Normal
                        Sales = 290,
                        Img = "/assets/comgaongbach/menu/trung_ngam_tuong.jpg"
                    },
                    new {
                        Name = "Nước Sâm Bí Đao Hạt Chia",
                        Category = 1, // Drink
                        Price = 18000m,
                        Desc = "Nấu từ bí đao tươi, lá dứa, la hán quả và hạt chia bổ dưỡng, thanh nhiệt giải khát trọn vẹn vị ngọt thanh mát.",
                        Tag = 4, // New
                        Sales = 410,
                        Img = "/assets/comgaongbach/menu/sam_bi_dao.jpg"
                    }
                };

                foreach (var m in comGaMenuItems)
                {
                    using (var cmd = new NpgsqlCommand(@"
                        INSERT INTO ""MenuItems"" (
                            ""Id"", ""TenantId"", ""Name"", ""Category"", ""Price"", ""Description"", ""Tag"", ""SalesCount"", ""ImageUrl"", ""IsActive"", ""CreatedAt""
                        ) VALUES (
                            @id, @tenantId, @name, @cat, @price, @desc, @tag, @sales, @img, true, NOW()
                        )", conn))
                    {
                        cmd.Parameters.AddWithValue("id", Guid.NewGuid());
                        cmd.Parameters.AddWithValue("tenantId", comGaTenantId);
                        cmd.Parameters.AddWithValue("name", m.Name);
                        cmd.Parameters.AddWithValue("cat", m.Category);
                        cmd.Parameters.AddWithValue("price", m.Price);
                        cmd.Parameters.AddWithValue("desc", m.Desc);
                        cmd.Parameters.AddWithValue("tag", m.Tag);
                        cmd.Parameters.AddWithValue("sales", m.Sales);
                        cmd.Parameters.AddWithValue("img", (object)m.Img ?? DBNull.Value);
                        cmd.ExecuteNonQuery();
                    }
                }

                // ==========================================
                // 3. SETUP ACCOUNTS FOR ALL TENANTS
                // ==========================================
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
                    new { Email = "manager@monari.com", Pass = "Manager@123", Role = 3, Name = "Monari Manager", TenantId = monariTenantId },

                    // Cơm Gà Ông Bách accounts
                    new { Email = "admin@comgaongbach.com", Pass = "Admin@123", Role = 1, Name = "Cơm Gà Ông Bách Admin", TenantId = comGaTenantId },
                    new { Email = "staff@comgaongbach.com", Pass = "Staff@123", Role = 2, Name = "Cơm Gà Ông Bách Staff", TenantId = comGaTenantId },
                    new { Email = "manager@comgaongbach.com", Pass = "Manager@123", Role = 3, Name = "Cơm Gà Ông Bách Manager", TenantId = comGaTenantId }
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
                            cmd.Parameters.AddWithValue("phone", "0938123789");
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
