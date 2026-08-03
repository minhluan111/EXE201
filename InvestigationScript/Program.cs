using System;
using Npgsql;

namespace InvestigationScript
{
    class Program
    {
        static void Main(string[] args)
        {
            var connectionString = "Host=aws-1-ap-northeast-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.stmbydppmstrtrtvophm;Password=Tam910boidam;CommandTimeout=60;";
            
            using var conn = new NpgsqlConnection(connectionString);
            conn.Open();

            using var cmd = new NpgsqlCommand("SELECT r.""Id"", r.""TenantId"", t.""Name"", r.""HighRiskThresholdMinutes"", r.""MediumRiskThresholdMinutes"", r.""LowRiskThresholdMinutes"" FROM ""RestaurantInfo"" r LEFT JOIN ""Tenants"" t ON r.""TenantId"" = t.""Id""", conn);
            using var reader = cmd.ExecuteReader();
            
            Console.WriteLine("TenantId | TenantName | High | Medium | Low | Status");
            Console.WriteLine("-------------------------------------------------------");
            while (reader.Read())
            {
                var tenantId = reader.GetGuid(1);
                var tenantName = reader.IsDBNull(2) ? "Unknown" : reader.GetString(2);
                var high = reader.IsDBNull(3) ? (int?)null : reader.GetInt32(3);
                var medium = reader.IsDBNull(4) ? (int?)null : reader.GetInt32(4);
                var low = reader.IsDBNull(5) ? (int?)null : reader.GetInt32(5);
                
                string status = "VALID";
                if (high == null || high == 0 || medium == 0 || low == 0) status = "CORRUPTED (Zero/Null)";
                else if (high >= medium || medium >= low) status = "INVALID (Ordering)";

                Console.WriteLine($"{tenantId.ToString().Substring(0,8)} | {tenantName} | {high} | {medium} | {low} | {status}");
            }
        }
    }
}
