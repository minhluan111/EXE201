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

                // 1. List Tenants
                Console.WriteLine("=== TENANTS ===");
                Guid? hoaTenantId = null;
                using (var cmd = new NpgsqlCommand("SELECT id, name, domain FROM tenants", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var id = reader.GetGuid(0);
                        var name = reader.GetString(1);
                        var domain = reader.GetString(2);
                        Console.WriteLine($"Tenant: {name} | Domain: {domain} | ID: {id}");
                        if (domain.Contains("hoatearoom") || name.ToLower().Contains("hoa"))
                        {
                            hoaTenantId = id;
                        }
                    }
                }

                if (hoaTenantId == null)
                {
                    Console.WriteLine("Warning: Could not find Hoa Tea Room tenant in DB. Creating one...");
                    hoaTenantId = Guid.NewGuid();
                    using (var cmd = new NpgsqlCommand("INSERT INTO tenants (id, name, domain, active, created_at) VALUES (@id, @name, @domain, true, NOW())", conn))
                    {
                        cmd.Parameters.AddWithValue("id", hoaTenantId.Value);
                        cmd.Parameters.AddWithValue("name", "Hoà Tea Room");
                        cmd.Parameters.AddWithValue("domain", "hoatearoom.localhost");
                        cmd.ExecuteNonQuery();
                    }
                    Console.WriteLine($"Created tenant Hoà Tea Room with ID: {hoaTenantId}");
                }
                else
                {
                    Console.WriteLine($"Found Hoa Tea Room tenant with ID: {hoaTenantId}");
                }

                // 2. Query all staff users
                Console.WriteLine("\n=== USERS ===");
                using (var cmd = new NpgsqlCommand("SELECT id, email, full_name, role, \"TenantId\" FROM users", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var id = reader.GetGuid(0);
                        var email = reader.GetString(1);
                        var name = reader.GetString(2);
                        var role = reader.GetInt32(3);
                        var tenantId = reader.IsDBNull(4) ? (Guid?)null : reader.GetGuid(4);
                        Console.WriteLine($"User: {name} | Email: {email} | Role: {role} | TenantId: {tenantId} | ID: {id}");
                    }
                }

                // 3. Update or Insert staff@hoatearoom.com
                Console.WriteLine("\n=== UPDATING/INSERTING STAFF ACCOUNT ===");
                string targetEmail = "staff@hoatearoom.com";
                string plainPassword = "Staff@123";
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(plainPassword, 11); // hash with BCrypt

                bool userExists = false;
                using (var cmd = new NpgsqlCommand("SELECT COUNT(1) FROM users WHERE email = @email", conn))
                {
                    cmd.Parameters.AddWithValue("email", targetEmail);
                    long count = (long)cmd.ExecuteScalar();
                    userExists = count > 0;
                }

                if (userExists)
                {
                    Console.WriteLine($"User {targetEmail} exists. Updating password and ensuring TenantId matches...");
                    using (var cmd = new NpgsqlCommand("UPDATE users SET password_hash = @hash, role = 2, \"TenantId\" = @tenantId WHERE email = @email", conn))
                    {
                        cmd.Parameters.AddWithValue("hash", hashedPassword);
                        cmd.Parameters.AddWithValue("tenantId", hoaTenantId.Value);
                        cmd.Parameters.AddWithValue("email", targetEmail);
                        cmd.ExecuteNonQuery();
                    }
                    Console.WriteLine("Update complete.");
                }
                else
                {
                    Console.WriteLine($"User {targetEmail} does not exist. Creating new staff user...");
                    using (var cmd = new NpgsqlCommand("INSERT INTO users (id, full_name, email, phone, password_hash, role, created_at, \"TenantId\") VALUES (@id, @name, @email, @phone, @hash, @role, NOW(), @tenantId)", conn))
                    {
                        cmd.Parameters.AddWithValue("id", Guid.NewGuid());
                        cmd.Parameters.AddWithValue("name", "Staff Hoa Tea Room");
                        cmd.Parameters.AddWithValue("email", targetEmail);
                        cmd.Parameters.AddWithValue("phone", "0123456789");
                        cmd.Parameters.AddWithValue("hash", hashedPassword);
                        cmd.Parameters.AddWithValue("role", 2); // Role 2 = Staff
                        cmd.Parameters.AddWithValue("tenantId", hoaTenantId.Value);
                        cmd.ExecuteNonQuery();
                    }
                    Console.WriteLine("Insert complete.");
                }

                // Verify login query
                using (var cmd = new NpgsqlCommand("SELECT password_hash, role, \"TenantId\" FROM users WHERE email = @email", conn))
                {
                    cmd.Parameters.AddWithValue("email", targetEmail);
                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            var hash = reader.GetString(0);
                            var role = reader.GetInt32(1);
                            var tenant = reader.IsDBNull(2) ? (Guid?)null : reader.GetGuid(2);
                            bool match = BCrypt.Net.BCrypt.Verify(plainPassword, hash);
                            Console.WriteLine($"Verification - Email: {targetEmail} | Role: {role} | TenantId: {tenant} | Password verified: {match}");
                        }
                    }
                }
            }
        }
    }
}
