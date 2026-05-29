import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from "@mui/material";
import { adminGetFeedbacks } from "../../services/mockApi.js";
import { useAuth } from "../../context/useAuthContext.js";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
};

export default function ManageFeedbacksPage() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await adminGetFeedbacks({ token });
      if (res.ok) setList(res.data);
      setLoading(false);
    })();
  }, [token]);

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
              Quản Lý Phản Hồi
            </Typography>
            <Typography sx={{ opacity: 0.8 }}>
              Xem và trả lời phản hồi từ khách hàng
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ py: 8, bgcolor: COLORS.soft }}>
        <Container maxWidth="lg">
          {loading ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <CircularProgress sx={{ color: COLORS.moss, mb: 2 }} />
              <Typography sx={{ color: "#666" }}>
                Đang tải dữ liệu...
              </Typography>
            </Box>
          ) : (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } },
              }}
              initial="hidden"
              animate="show"
            >
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
                {list.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 8, opacity: 0.6 }}>
                    <Typography sx={{ fontSize: "48px", mb: 2 }}>💬</Typography>
                    <Typography variant="h5">Không có phản hồi nào</Typography>
                  </Box>
                ) : (
                  list.map((feedback) => (
                    <motion.div
                      key={feedback.id}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0 },
                      }}
                    >
                      <Card
                        sx={{
                          borderRadius: 3,
                          border: `1px solid rgba(0,0,0,0.08)`,
                          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "start",
                              gap: 2,
                              mb: 1.5,
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 600, color: COLORS.dark }}
                            >
                              {feedback.title}
                            </Typography>
                            <Chip
                              label="Mới"
                              sx={{
                                backgroundColor: `${COLORS.moss}20`,
                                color: COLORS.moss,
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                          <Typography sx={{ color: "#666", mb: 1.5 }}>
                            {feedback.content}
                          </Typography>
                          <Typography sx={{ fontSize: "14px", opacity: 0.6 }}>
                            👤 {feedback.user?.full_name}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </Box>
            </motion.div>
          )}
        </Container>
      </Box>
    </Box>
  );
}
