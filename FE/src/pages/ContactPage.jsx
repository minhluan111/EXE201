import { useEffect, useState } from "react";
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
  Link,
  Alert,
} from "@mui/material";
import { restaurantInfoGet, feedbackCreate } from "../services/mockApi.js";
import { useAuth } from "../context/useAuthContext.js";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  teal: "#3E6A7A",
  cream: "#E9E5D4",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
};

export default function ContactPage() {
  const { token } = useAuth();
  const [info, setInfo] = useState(null);

  const [title, setTitle] = useState("Góp ý chất lượng");
  const [content, setContent] = useState(
    "Quán phục vụ tốt, mong có thêm combo giảm giá.",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await restaurantInfoGet();
      if (res.ok) setInfo(res.data);
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!token) return setError("Vui lòng đăng nhập để gửi phản hồi.");

    if (!title.trim()) return setError("Vui lòng nhập tiêu đề.");
    if (!content.trim()) return setError("Vui lòng nhập nội dung phản hồi.");

    setLoading(true);
    const res = await feedbackCreate({ token, title, content });
    setLoading(false);

    if (!res.ok) return setError(res.message || "Gửi phản hồi thất bại");
    setMessage("Cảm ơn bạn đã gửi đóng góp ý kiến cho quán");
    setTitle("");
    setContent("");
  };

  if (!info) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            
          </Typography>
          <Typography>Đang tải thông tin...</Typography>
        </Box>
      </Box>
    );
  }

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
                mb: 2,
              }}
            >
              Liên Hệ
            </Typography>
            <Typography sx={{ textAlign: "center", opacity: 0.7 }}>
              Chúng tôi luôn sẵn sàng lắng nghe ý kiến của bạn
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Content */}
      <Box sx={{ py: 8, bgcolor: COLORS.soft }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Left: Contact Info */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                {/* Info Card */}
                <Card
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${COLORS.cream}`,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    mb: 3,
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
                      Thông Tin Quán
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "16px",
                            color: COLORS.dark,
                            mb: 0.5,
                          }}
                        >
                          {info.name}
                        </Typography>
                        <Typography sx={{ color: "#666" }}>
                          {info.address}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ pt: 2, borderTop: `1px solid ${COLORS.cream}` }}
                      >
                        <Typography
                          sx={{ fontSize: "12px", color: "#666", mb: 0.5 }}
                        >
                          Hotline
                        </Typography>
                        <Link
                          href={`tel:${info.hotline}`}
                          sx={{
                            color: COLORS.moss,
                            fontWeight: 600,
                            textDecoration: "none",
                            "&:hover": { color: COLORS.forest },
                          }}
                        >
                          {info.hotline}
                        </Link>
                      </Box>

                      <Box>
                        <Typography
                          sx={{ fontSize: "12px", color: "#666", mb: 0.5 }}
                        >
                          Email
                        </Typography>
                        <Link
                          href={`mailto:${info.email}`}
                          sx={{
                            color: COLORS.moss,
                            fontWeight: 600,
                            textDecoration: "none",
                            "&:hover": { color: COLORS.forest },
                          }}
                        >
                          {info.email}
                        </Link>
                      </Box>

                      <Box>
                        <Typography
                          sx={{ fontSize: "12px", color: "#666", mb: 0.5 }}
                        >
                          Giờ mở cửa
                        </Typography>
                        <Typography
                          sx={{ fontWeight: 600, color: COLORS.dark }}
                        >
                          {info.openHours}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Map Card */}
                <Card
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${COLORS.cream}`,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ borderBottom: `1px solid ${COLORS.cream}`, p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: COLORS.forest,
                        textTransform: "uppercase",
                      }}
                    >
                      Vị Trí
                    </Typography>
                  </Box>
                  <Box
                    component="iframe"
                    title="map"
                    src={info.mapEmbedUrl}
                    sx={{
                      width: "100%",
                      height: 320,
                      border: "none",
                    }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </Card>
              </motion.div>
            </Grid>

            {/* Right: Feedback Form */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
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
                      Gửi Phản Hồi
                    </Typography>

                    <Box
                      component="form"
                      onSubmit={onSubmit}
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
                          Tiêu đề
                        </Typography>
                        <TextField
                          fullWidth
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Vd: Góp ý về chất lượng dịch vụ"
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
                           Nội dung
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={5}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Chia sẻ ý kiến của bạn..."
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
                          <Alert severity="error">{error}</Alert>
                        </motion.div>
                      )}

                      {message && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Alert severity="success">{message}</Alert>
                        </motion.div>
                      )}

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{
                          bgcolor: COLORS.moss,
                          color: "white",
                          textTransform: "none",
                          fontWeight: 600,
                          "&:hover": { bgcolor: COLORS.forest },
                          "&:disabled": { bgcolor: "#ccc" },
                        }}
                      >
                        {loading ? "Đang gửi..." : "Gửi Phản Hồi"}
                      </Button>
                    </Box>
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
