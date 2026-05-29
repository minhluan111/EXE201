import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { bookingCancel, bookingMe } from "../services/mockApi.js";
import { useAuth } from "../context/useAuthContext.js";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  teal: "#3E6A7A",
  cream: "#E9E5D4",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
};

export default function BookingHistoryPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("upcoming");
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setError("");
      setLoading(true);
      const res = await bookingMe({ token });
      if (!mounted) return;
      setList(res.ok ? res.data : []);
      setLoading(false);
    };
    run();
    return () => {
      mounted = false;
    };
  }, [token]);

  const view = list.filter((b) => {
    if (tab === "cancelled") return b.status === "cancelled";
    if (tab === "complete") return b.status === "confirmed";
    return b.status === "pending" || b.status === "confirmed";
  });

  const cancel = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn hủy lịch đặt bàn này?")) return;

    setCancelling(id);
    setError("");
    const res = await bookingCancel({ token, id });
    setCancelling(null);

    if (!res.ok) return setError(res.message || "Hủy thất bại");
    const refresh = await bookingMe({ token });
    setList(refresh.ok ? refresh.data : []);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#fbbf24";
      case "confirmed":
        return "#10b981";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return " Chờ xác nhận";
      case "confirmed":
        return " Đã xác nhận";
      case "cancelled":
        return " Đã hủy";
      default:
        return status;
    }
  };

  const tabs = [
    {
      key: "upcoming",
      label: " Sắp Diễn Ra",
      count: list.filter(
        (b) => b.status === "pending" || b.status === "confirmed",
      ).length,
    },
    {
      key: "complete",
      label: " Đã Hoàn Thành",
      count: list.filter((b) => b.status === "confirmed").length,
    },
    {
      key: "cancelled",
      label: "Đã Hủy",
      count: list.filter((b) => b.status === "cancelled").length,
    },
  ];

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
              Lịch Sử Đặt Bàn
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Content */}
      <Box sx={{ py: 8, bgcolor: COLORS.soft }}>
        <Container maxWidth="lg">
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 6 }}>
              {tabs.map((t) => (
                <Button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  variant={tab === t.key ? "contained" : "outlined"}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    backgroundColor: tab === t.key ? COLORS.forest : "white",
                    color: tab === t.key ? COLORS.cream : COLORS.dark,
                    borderColor: tab === t.key ? COLORS.forest : COLORS.cream,
                    "&:hover": {
                      backgroundColor:
                        tab === t.key ? COLORS.forest : COLORS.soft,
                      borderColor: COLORS.forest,
                    },
                  }}
                >
                  {t.label}
                </Button>
              ))}
            </Box>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <CircularProgress sx={{ color: COLORS.moss, mb: 2 }} />
              <Typography sx={{ color: "#666" }}>
                Đang tải dữ liệu...
              </Typography>
            </Box>
          )}

          {/* Empty State */}
          {!loading && view.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Box sx={{ textAlign: "center", py: 12 }}>
                <Typography variant="h2" sx={{ mb: 2 }}>
                  
                </Typography>
                <Typography variant="h5" sx={{ mb: 1, opacity: 0.7 }}>
                  Chưa có lịch đặt bàn
                </Typography>
                <Typography sx={{ opacity: 0.5 }}>
                  {tab === "upcoming" &&
                    "Hãy đặt bàn ngay để thưởng thức các món ăn tuyệt vời"}
                  {tab === "complete" &&
                    "Bạn chưa hoàn thành bất kỳ lịch đặt bàn nào"}
                  {tab === "cancelled" &&
                    "Bạn chưa hủy bất kỳ lịch đặt bàn nào"}
                </Typography>
              </Box>
            </motion.div>
          )}

          {/* Booking List */}
          {!loading && view.length > 0 && (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
              initial="hidden"
              animate="show"
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {view.map((b) => (
                  <motion.div
                    key={b.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 },
                    }}
                  >
                    <Card
                      sx={{
                        borderRadius: 3,
                        border: `1px solid ${COLORS.cream}`,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            justifyContent: "space-between",
                            alignItems: { xs: "start", md: "center" },
                            gap: 3,
                          }}
                        >
                          {/* Left: Booking Info */}
                          <Box sx={{ flex: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                mb: 2,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "18px",
                                  fontWeight: 600,
                                  color: COLORS.dark,
                                }}
                              >
                                Mã #{b.id}
                              </Typography>
                              <Chip
                                label={getStatusLabel(b.status)}
                                sx={{
                                  backgroundColor: `${getStatusColor(b.status)}20`,
                                  color: getStatusColor(b.status),
                                  fontWeight: 600,
                                }}
                              />
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                fontSize: "14px",
                                color: "#666",
                              }}
                            >
                              <Typography sx={{ fontSize: "14px" }}>
                                🪑{" "}
                                <span style={{ fontWeight: 600 }}>
                                  {b.table?.name}
                                </span>{" "}
                                • 📍 {b.table?.area}
                              </Typography>
                              <Typography sx={{ fontSize: "14px" }}>
                                📅{" "}
                                <span style={{ fontWeight: 600 }}>
                                  {b.booking_date}
                                </span>{" "}
                                • 🕐{" "}
                                <span style={{ fontWeight: 600 }}>
                                  {b.booking_time}
                                </span>
                              </Typography>
                              <Typography sx={{ fontSize: "14px" }}>
                                👥{" "}
                                <span style={{ fontWeight: 600 }}>
                                  {b.num_of_people} khách
                                </span>
                              </Typography>
                              {b.note && (
                                <Typography sx={{ fontSize: "14px" }}>
                                  📝 {b.note}
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          {/* Right: Actions */}
                          {tab === "upcoming" && (
                            <Button
                              onClick={() => cancel(b.id)}
                              disabled={cancelling === b.id}
                              variant="outlined"
                              sx={{
                                color: "#ef4444",
                                borderColor: "#ef4444",
                                textTransform: "none",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                "&:hover": {
                                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                                  borderColor: "#ef4444",
                                },
                                "&:disabled": {
                                  opacity: 0.5,
                                },
                              }}
                            >
                              {cancelling === b.id
                                ? "⏳ Hủy..."
                                : "❌ Hủy Lịch"}
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          )}
        </Container>
      </Box>
    </Box>
  );
}
