import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Divider,
  Alert,
} from "@mui/material";
import { useAuth } from "../context/useAuthContext.js";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  teal: "#3E6A7A",
  cream: "#E9E5D4",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
};

export default function ProfilePage() {
  const { user } = useAuth();
  const info = useMemo(() => user || {}, [user]);

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          py: 6,
          backgroundImage: `linear-gradient(135deg, ${COLORS.forest}20 0%, ${COLORS.teal}10 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              sx={{
                textAlign: "center",
                fontWeight: 700,
                color: COLORS.forest,
                textTransform: "uppercase",
              }}
            >
              Hồ Sơ
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Content */}
      <Box sx={{ py: 8, bgcolor: COLORS.soft }}>
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card
              sx={{
                borderRadius: 3,
                border: `1px solid ${COLORS.cream}`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Avatar */}
                <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      backgroundImage: `linear-gradient(135deg, ${COLORS.moss} 0%, ${COLORS.forest} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "48px",
                      fontWeight: "bold",
                    }}
                  >
                    {info.full_name?.charAt(0)?.toUpperCase()}
                  </Box>
                </Box>

                {/* Name */}
                <Typography
                  variant="h4"
                  sx={{
                    textAlign: "center",
                    fontWeight: 700,
                    color: COLORS.forest,
                    textTransform: "uppercase",
                    mb: 4,
                  }}
                >
                  {info.full_name}
                </Typography>

                {/* Info */}
                <Box sx={{ space: 3 }}>
                  <Box
                    sx={{ pb: 2, borderBottom: `1px solid ${COLORS.cream}` }}
                  >
                    <Typography sx={{ fontSize: "12px", color: "#666", mb: 1 }}>
                       Email
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: COLORS.dark,
                      }}
                    >
                      {info.email}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      pb: 2,
                      borderBottom: `1px solid ${COLORS.cream}`,
                      pt: 2,
                    }}
                  >
                    <Typography sx={{ fontSize: "12px", color: "#666", mb: 1 }}>
                     Số điện thoại
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: COLORS.dark,
                      }}
                    >
                      {info.phone}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      pb: 2,
                      borderBottom: `1px solid ${COLORS.cream}`,
                      pt: 2,
                    }}
                  >
                    <Typography sx={{ fontSize: "12px", color: "#666", mb: 1 }}>
                       Vai trò
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: COLORS.dark,
                      }}
                    >
                      {info.role === "admin"
                        ? " Quản trị viên"
                        : info.role === "manager"
                        ? " Quản lý"
                        : info.role === "staff"
                        ? " Nhân viên"
                        : " Khách hàng"}
                    </Typography>
                  </Box>

                  <Box sx={{ pt: 2 }}>
                    <Typography sx={{ fontSize: "12px", color: "#666", mb: 1 }}>
                       Ngày tham gia
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: COLORS.dark,
                      }}
                    >
                      {new Date().toLocaleDateString("vi-VN")}
                    </Typography>
                  </Box>
                </Box>

                {/* Welcome Message */}
                <Box
                  sx={{ mt: 4, pt: 3, borderTop: `1px solid ${COLORS.cream}` }}
                >
                  <Alert
                    severity="info"
                    sx={{
                      backgroundColor: `${COLORS.forest}10`,
                      borderColor: `${COLORS.forest}30`,
                      color: COLORS.forest,
                      "& .MuiAlert-icon": {
                        color: COLORS.forest,
                      },
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                       Chào mừng bạn!
                    </Typography>
                    <Typography sx={{ fontSize: "14px" }}>
                      Cảm ơn bạn đã là thành viên của VIZZA. Hãy khám phá menu
                      và đặt bàn ngay!
                    </Typography>
                  </Alert>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
