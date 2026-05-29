import { motion } from "framer-motion";
import { Box, Container, Typography, Card, CardContent } from "@mui/material";

const COLORS = {
  forest: "#2F5B3E",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
};

export default function ManageBookingsPage() {
  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          py: 4,
          backgroundImage: `linear-gradient(135deg, ${COLORS.forest} 0%, ${COLORS.dark} 100%)`,
          color: "#E9E5D4",
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
              Quản Lý Đặt Bàn
            </Typography>
            <Typography sx={{ opacity: 0.8 }}>
              Xem danh sách, xác nhận hoặc hủy các lịch đặt bàn
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ py: 8, bgcolor: COLORS.soft }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card
              sx={{
                borderRadius: 3,
                border: `1px solid rgba(0,0,0,0.08)`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 12 }}>
                <Typography sx={{ fontSize: "48px", mb: 2 }}>📅</Typography>
                <Typography variant="h5">Tính Năng Quản Lý Đặt Bàn</Typography>
                <Typography sx={{ mt: 1, fontSize: "14px", opacity: 0.6 }}>
                  Đây là bản mock - chức năng quản lý đặt bàn sẽ được triển khai
                  trong phiên bản tiếp theo
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
