using System;
using Npgsql;

namespace InvestigationScript
{
    class Program
    {
        static void Main(string[] args)
        {
            var connectionString = "Host=aws-1-ap-northeast-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.stmbydppmstrtrtvophm;Password=Tam910boidam;CommandTimeout=60;";
            
            Console.WriteLine("=================================================");
            Console.WriteLine("ĐANG KIỂM TRA KẾT NỐI BE VỚI TENANT EM COFFEE...");
            Console.WriteLine("=================================================");

            try
            {
                using var conn = new NpgsqlConnection(connectionString);
                conn.Open();
                Console.WriteLine("✅ Kết nối Supabase PostgreSQL: THÀNH CÔNG!\n");

                // 1. Kiểm tra Tenants
                Console.WriteLine("--- 1. BẢNG TENANTS ---");
                using (var cmd = new NpgsqlCommand("SELECT id, name, domain, theme_color, active FROM tenants ORDER BY created_at ASC", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var id = reader.GetGuid(0);
                        var name = reader.GetString(1);
                        var domain = reader.GetString(2);
                        var color = reader.IsDBNull(3) ? "null" : reader.GetString(3);
                        var active = reader.GetBoolean(4);
                        Console.WriteLine($"[Tenant] {id} | {name,-20} | {domain,-22} | {color} | Active={active}");
                    }
                }

                // 2. Kiểm tra RestaurantInfo
                Console.WriteLine("\n--- 2. BẢNG RestaurantInfo ---");
                using (var cmd = new NpgsqlCommand(@"
                    SELECT r.""TenantId"", t.name, r.""Address"", r.""Phone"", r.""OpeningHours"", r.""OpeningTime"", r.""ClosingTime""
                    FROM ""RestaurantInfo"" r
                    JOIN tenants t ON r.""TenantId"" = t.id", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var tenantId = reader.GetGuid(0);
                        var tenantName = reader.GetString(1);
                        var address = reader.GetString(2);
                        var phone = reader.GetString(3);
                        var hours = reader.GetString(4);
                        Console.WriteLine($"[Info] {tenantName,-20} | Phone: {phone,-12} | Hours: {hours,-15} | Addr: {address}");
                    }
                }

                // 3. Kiểm tra seating_areas
                Console.WriteLine("\n--- 3. BẢNG seating_areas CHO EM COFFEE ---");
                using (var cmd = new NpgsqlCommand(@"
                    SELECT s.area, s.table_type, s.total_tables, s.reservable_tables, s.preview_image, s.is_active
                    FROM seating_areas s
                    JOIN tenants t ON s.""TenantId"" = t.id
                    WHERE t.domain ILIKE '%emcoffee%'", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    int count = 0;
                    while (reader.Read())
                    {
                        count++;
                        var area = reader.GetString(0);
                        var tableType = reader.GetString(1);
                        var total = reader.GetInt32(2);
                        var reservable = reader.GetInt32(3);
                        var img = reader.IsDBNull(4) ? "no-image" : reader.GetString(4);
                        Console.WriteLine($"  [{count}] Area: {area,-22} | Type: {tableType,-38} | Tables: {reservable}/{total} | Img: {img}");
                    }
                    if (count == 0) Console.WriteLine("  ⚠️ Chưa có bàn nào cho Em Coffee (hoặc chưa chạy seed).");
                }

                // 4. Kiểm tra MenuItems
                Console.WriteLine("\n--- 4. BẢNG MenuItems CHO EM COFFEE ---");
                using (var cmd = new NpgsqlCommand(@"
                    SELECT m.""Name"", m.""Category"", m.""Price"", m.""Tag"", m.""ImageUrl"", m.""IsActive""
                    FROM ""MenuItems"" m
                    JOIN tenants t ON m.""TenantId"" = t.id
                    WHERE t.domain ILIKE '%emcoffee%'", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    int count = 0;
                    while (reader.Read())
                    {
                        count++;
                        var name = reader.GetString(0);
                        var cat = reader.GetInt32(1);
                        var price = reader.GetDecimal(2);
                        var tag = reader.GetInt32(3);
                        var img = reader.IsDBNull(4) ? "no-image" : reader.GetString(4);
                        Console.WriteLine($"  [{count}] Món: {name,-32} | Giá: {price:N0}đ | Cat={cat} | Tag={tag} | Img: {img}");
                    }
                    if (count == 0) Console.WriteLine("  ⚠️ Chưa có món nào cho Em Coffee (hoặc chưa chạy seed).");
                }

                // 5. Kiểm tra users (Account)
                Console.WriteLine("\n--- 5. BẢNG users CHO EM COFFEE ---");
                using (var cmd = new NpgsqlCommand(@"
                    SELECT u.full_name, u.email, u.phone, u.role
                    FROM users u
                    JOIN tenants t ON u.""TenantId"" = t.id
                    WHERE t.domain ILIKE '%emcoffee%'", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    int count = 0;
                    while (reader.Read())
                    {
                        count++;
                        var name = reader.GetString(0);
                        var email = reader.GetString(1);
                        var phone = reader.GetString(2);
                        var role = reader.GetInt32(3);
                        Console.WriteLine($"  [{count}] User: {name,-22} | Email: {email,-22} | Phone: {phone,-12} | Role: {role}");
                    }
                    if (count == 0) Console.WriteLine("  ⚠️ Chưa có user nào gán cho Em Coffee.");
                }

                Console.WriteLine("\n=================================================");
                Console.WriteLine("KIỂM TRA HOÀN TẤT!");
                Console.WriteLine("=================================================");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi kết nối DB: {ex.Message}");
            }
        }
    }
}
