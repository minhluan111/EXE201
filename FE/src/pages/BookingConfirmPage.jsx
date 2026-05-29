import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
} from "@mui/material";
import { bookingCreate } from "../services/mockApi.js";
import { useAuth } from "../context/useAuthContext.js";
import { useBookingContext } from "../context/useBookingContext.js";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  teal: "#3E6A7A",
  cream: "#E9E5D4",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
};

export default function BookingConfirmPage() {
  const nav = useNavigate();
  const { user, token } = useAuth();
  const { selected, clear } = useBookingContext();

  const [note, setNote] = useState("");
  const [receiverName, setReceiverName] = useState(user?.full_name || "");
  const [receiverPhone, setReceiverPhone] = useState(user?.phone || "");
  const [receiverEmail, setReceiverEmail] = useState(user?.email || "");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!selected?.tableId) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: COLORS.soft,
        }}
      >
        <Container maxWidth="lg" sx={{ textAlign: "center" }}>
          <Typography variant="h2" sx={{ mb: 2 }}>
            
          </Typography>
          <Typography variant="h5" sx={{ mb: 3, opacity: 0.7 }}>
            Không có thông tin bàn đã chọn
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: COLORS.moss,
              color: "white",
              "&:hover": { bgcolor: COLORS.forest },
            }}
            onClick={() => nav("/booking")}
          >
            ← Quay lại Đặt Bàn
          </Button>
        </Container>
      </Box>
    );
  }

  const confirm = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    const res = await bookingCreate({
      token,
      table_id: selected.tableId,
      booking_date: selected.booking_date,
      booking_time: selected.booking_time,
      num_of_people: selected.num_of_people,
      note,
    });

    setLoading(false);

    if (!res.ok) {
      setError(res.message || "Đặt bàn thất bại");
      return;
    }

    setMessage(`Đặt bàn thành công! Mã đặt: ${res.data.id}`);
    clear();

    setTimeout(() => nav("/booking/history"), 1500);
  };

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
              Xác Nhận Đặt Bàn
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Content */}
      <Box sx={{ py: 8, bgcolor: COLORS.soft }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Left: Booking Details */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
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
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: COLORS.forest,
                        textTransform: "uppercase",
                        mb: 3,
                      }}
                    >
                      Thông Tin Đặt Bàn
                    </Typography>

                    <Box
                      sx={{ pb: 3, borderBottom: `1px solid ${COLORS.cream}` }}
                    >
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          sx={{ fontSize: "12px", color: "#666", mb: 0.5 }}
                        >
                          🏪 Nhà hàng
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "16px",
                            color: COLORS.dark,
                          }}
                        >
                          VIZZA Restaurant
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography
                          sx={{ fontSize: "12px", color: "#666", mb: 0.5 }}
                        >
                           Bàn
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "16px",
                            color: COLORS.dark,
                          }}
                        >
                          {selected.table?.name}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography
                          sx={{ fontSize: "12px", color: "#666", mb: 0.5 }}
                        >
                           Khu vực
                        </Typography>
                        <Typography
                          sx={{ fontWeight: 600, color: COLORS.dark }}
                        >
                          {selected.table?.area}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography
                          sx={{ fontSize: "12px", color: "#666", mb: 0.5 }}
                        >
                           Ngày giờ
                        </Typography>
                        <Typography
                          sx={{ fontWeight: 600, color: COLORS.dark }}
                        >
                          {selected.booking_date} - {selected.booking_time}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          sx={{ fontSize: "12px", color: "#666", mb: 0.5 }}
                        >
                           Số khách
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "16px",
                            color: COLORS.dark,
                          }}
                        >
                          {selected.num_of_people} người
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: COLORS.dark,
                          mb: 1,
                        }}
                      >
                         Ghi chú (tuỳ chọn)
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Vd: Cần ghế trẻ em, cần bàn gần cửa sổ..."
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "&:hover fieldset": { borderColor: COLORS.moss },
                            "&.Mui-focused fieldset": {
                              borderColor: COLORS.moss,
                            },
                          },
                        }}
                      />
                    </Box>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Alert severity="error" sx={{ mt: 2 }}>
                          {error}
                        </Alert>
                      </motion.div>
                    )}

                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Alert severity="success" sx={{ mt: 2 }}>
                          {message}
                        </Alert>
                      </motion.div>
                    )}

                    <Button
                      fullWidth
                      variant="contained"
                      disabled={loading || !!message}
                      onClick={confirm}
                      sx={{
                        bgcolor: COLORS.moss,
                        color: "white",
                        mt: 3,
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": { bgcolor: COLORS.forest },
                        "&:disabled": { bgcolor: "#ccc" },
                      }}
                    >
                      {loading
                        ? "⏳ Đang xử lý..."
                        : message
                          ? "➜ Chuyển hướng..."
                          : "✓ Xác Nhận Đặt Bàn"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Right: Receiver Info */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${COLORS.cream}`,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: COLORS.forest,
                        textTransform: "uppercase",
                        mb: 3,
                      }}
                    >
                      Thông Tin Người Nhận
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: COLORS.dark,
                            mb: 1,
                          }}
                        >
                          👤 Họ tên
                        </Typography>
                        <TextField
                          fullWidth
                          value={receiverName}
                          onChange={(e) => setReceiverName(e.target.value)}
                          placeholder="Nhập họ tên"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "&:hover fieldset": { borderColor: COLORS.moss },
                              "&.Mui-focused fieldset": {
                                borderColor: COLORS.moss,
                              },
                            },
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography
                          sx={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: COLORS.dark,
                            mb: 1,
                          }}
                        >
                           Số điện thoại
                        </Typography>
                        <TextField
                          fullWidth
                          value={receiverPhone}
                          onChange={(e) => setReceiverPhone(e.target.value)}
                          placeholder="0912345678"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "&:hover fieldset": { borderColor: COLORS.moss },
                              "&.Mui-focused fieldset": {
                                borderColor: COLORS.moss,
                              },
                            },
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography
                          sx={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: COLORS.dark,
                            mb: 1,
                          }}
                        >
                           Email
                        </Typography>
                        <TextField
                          fullWidth
                          type="email"
                          value={receiverEmail}
                          onChange={(e) => setReceiverEmail(e.target.value)}
                          placeholder="your@email.com"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "&:hover fieldset": { borderColor: COLORS.moss },
                              "&.Mui-focused fieldset": {
                                borderColor: COLORS.moss,
                              },
                            },
                          }}
                        />
                      </Box>
                    </Box>

                    <Alert
                      severity="info"
                      sx={{
                        mt: 3,
                        backgroundColor: `#2196f310`,
                        borderColor: `#2196f330`,
                        color: "#1976d2",
                        "& .MuiAlert-icon": {
                          color: "#1976d2",
                        },
                      }}
                    >
                      <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                         Thông tin về Demo
                      </Typography>
                      <Typography sx={{ fontSize: "14px" }}>
                        Thông tin người nhận chỉ hiển thị để tham khảo, không
                        được gửi riêng lên backend.
                      </Typography>
                    </Alert>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
