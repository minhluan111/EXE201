import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuthContext.js";
import { adminGetStats } from "../../services/apiClient.js";
import AdminHeader from "../../components/admin/AdminHeader.jsx";

const COLORS = {
  soft: "var(--bg)",
  matcha: "var(--matcha)",
  border: "var(--border)",
  text: "var(--text)",
};

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await adminGetStats({ token });
      if (res.ok) {
        setData(res.data);
      }
      setLoading(false);
    })();
  }, [token]);

  if (!user) return null;

  const isStaff = user.role === "staff";

  // Dynamic stats filtered by role
  const stats = [
    {
      label: "Lượt Đặt Hôm Nay",
      value: data ? data.todayReservations : "0",
      
      color: "var(--matcha)",
    },
    {
      label: "Tổng Lượt Đặt Bàn",
      value: data ? data.totalReservations : "0",
    
      color: "var(--text)",
    },
    {
      label: "Đã Xác Nhận",
      value: data ? data.confirmedReservations : "0",
    
      color: "#2F5B3E",
    },
    {
      label: "Đã Hoàn Thành",
      value: data ? data.completedReservations : "0",
   
      color: "#3E6A7A",
    },
    {
      label: "Đã Hủy Lịch",
      value: data ? data.cancelledReservations : "0",
   
      color: "#EF4444",
    },
    // Only show Total Users to Admin
    ...(!isStaff
      ? [
          {
            label: "Tổng Người Dùng",
            value: data ? data.totalUsers : "0",
         
            color: "#fb923c",
          },
        ]
      : []),
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          bgcolor: "var(--bg)",
        }}
      >
        <CircularProgress sx={{ color: "var(--matcha)" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "var(--bg)", minHeight: "100vh" }}>
      {/* Dynamic Header */}
      <AdminHeader
        title="Bảng điều khiển quản trị"
        subtitle={`Chào mừng quay trở lại, ${user.fullName}. Đây là số liệu thống kê tổng quan của hôm nay.`}
      />

      {/* Main Content */}
      <Box sx={{ py: 6 }}>
        <Container maxWidth="lg">
          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {stats.map((stat, i) => (
                <Grid item xs={12} sm={6} lg={4} key={i}>
                  <motion.div variants={itemVariants}>
                    <Card
                      sx={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "20px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          borderColor: "var(--matcha)",
                          boxShadow: "0 16px 40px rgba(107, 143, 62, 0.05)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: "28px !important" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <div>
                            <Typography
                              sx={{
                                color: "var(--text-muted)",
                                fontSize: "14px",
                                fontWeight: 600,
                                mb: 1,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {stat.label}
                            </Typography>
                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: 700,
                                fontSize: { xs: "28px", md: "36px" },
                                color: "var(--text)",
                                fontFamily: "'Outfit', sans-serif",
                              }}
                            >
                              {stat.value}
                            </Typography>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
