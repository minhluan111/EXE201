import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  teal: "#3E6A7A",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
};

export default function DashboardPage() {
  const stats = [
    {
      label: "Lượt Đặt Bàn",
      value: "142",
      icon: "📅",
      gradient: `linear-gradient(135deg, ${COLORS.moss} 0%, ${COLORS.forest} 100%)`,
    },
    {
      label: "Khách Hàng",
      value: "1,283",
      icon: "👥",
      gradient: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.forest} 100%)`,
    },
    {
      label: "Doanh Thu",
      value: "24.5M",
      icon: "💰",
      gradient: "linear-gradient(135deg, #facc15 0%, #eab308 100%)",
    },
    {
      label: "Đánh Giá TB",
      value: "4.8/5",
      icon: "⭐",
      gradient: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          py: 4,
          backgroundImage: `linear-gradient(135deg, ${COLORS.forest} 0%, ${COLORS.dark} 100%)`,
          color: COLORS.soft,
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, textTransform: "uppercase", mb: 1 }}
            >
              Bảng Điều Khiển Admin
            </Typography>
            <Typography sx={{ opacity: 0.8 }}>
              Chào mừng, Admin. Đây là thống kê tổng quan của hôm nay.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ py: 8, bgcolor: COLORS.soft }}>
        <Container maxWidth="lg">
          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {stats.map((stat, i) => (
                <Grid item xs={12} sm={6} lg={3} key={i}>
                  <motion.div variants={itemVariants}>
                    <Card
                      sx={{
                        backgroundImage: stat.gradient,
                        color: "white",
                        borderRadius: 3,
                        border: "none",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ fontSize: "32px", mb: 1 }}>
                          {stat.icon}
                        </Typography>
                        <Typography
                          sx={{
                            opacity: 0.8,
                            fontSize: "14px",
                            fontWeight: 600,
                            mb: 1,
                          }}
                        >
                          {stat.label}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: "28px", md: "32px" },
                          }}
                        >
                          {stat.value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* Welcome Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card
              sx={{
                borderRadius: 3,
                border: `1px solid rgba(0,0,0,0.08)`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: COLORS.forest,
                    mb: 2,
                  }}
                >
                  Nội Dung Quản Lý
                </Typography>
                <Typography sx={{ color: "#666", mb: 3, lineHeight: 1.6 }}>
                  Sử dụng menu bên cạnh để quản lý các dữ liệu khác nhau như
                  menu, bàn, đặt bàn, phản hồi và đánh giá. Dashboard này cung
                  cấp tổng quan toàn bộ hoạt động của hệ thống nhà hàng.
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        bgcolor: `${COLORS.moss}10`,
                        border: `1px solid ${COLORS.moss}30`,
                        borderRadius: 2,
                        p: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: COLORS.moss,
                          mb: 0.5,
                        }}
                      >
                        📋 Menu
                      </Typography>
                      <Typography sx={{ fontSize: "12px", opacity: 0.7 }}>
                        Quản lý các món ăn, giá cả, ảnh
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        bgcolor: `${COLORS.forest}10`,
                        border: `1px solid ${COLORS.forest}30`,
                        borderRadius: 2,
                        p: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: COLORS.forest,
                          mb: 0.5,
                        }}
                      >
                        🪑 Bàn
                      </Typography>
                      <Typography sx={{ fontSize: "12px", opacity: 0.7 }}>
                        Quản lý bàn, khu vực, sức chứa
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        bgcolor: `${COLORS.teal}10`,
                        border: `1px solid ${COLORS.teal}30`,
                        borderRadius: 2,
                        p: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: COLORS.teal,
                          mb: 0.5,
                        }}
                      >
                        📅 Đặt Bàn
                      </Typography>
                      <Typography sx={{ fontSize: "12px", opacity: 0.7 }}>
                        Xem và quản lý các lịch đặt bàn
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
