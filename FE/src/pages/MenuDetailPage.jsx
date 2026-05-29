import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Link,
  Rating,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ChevronLeft } from "lucide-react";
import { menuDetail, menuReviews, reviewCreate } from "../services/mockApi.js";
import Loading from "../components/common/Loading.jsx";
import { useAuth } from "../context/useAuthContext.js";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  teal: "#3E6A7A",
  cream: "#E9E5D4",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
};

export default function MenuDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [a, b] = await Promise.all([menuDetail({ id }), menuReviews({ id })]);
    setMenu(a.ok ? a.data : null);
    setReviews(b.ok ? b.data : []);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      const [a, b] = await Promise.all([
        menuDetail({ id }),
        menuReviews({ id }),
      ]);
      if (cancelled) return;
      setMenu(a.ok ? a.data : null);
      setReviews(b.ok ? b.data : []);
      setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!comment.trim()) return setError("Vui lòng nhập nội dung đánh giá.");
    if (!rating) return setError("Vui lòng chọn số sao.");

    setSubmitting(true);
    const res = await reviewCreate({ token, menu_id: id, rating, comment });
    setSubmitting(false);

    if (!res.ok) return setError(res.message || "Gửi đánh giá thất bại");

    setComment("");
    await load();
  };

  if (loading) return <Loading />;
  if (!menu)
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
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h2" sx={{ mb: 2 }}>
            🔍
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.7 }}>
            Không tìm thấy món ăn
          </Typography>
        </Box>
      </Box>
    );

  return (
    <Box>
      {/* Navigation */}
      <Box
        sx={{
          py: 2,
          bgcolor: COLORS.soft,
          borderBottom: `1px solid ${COLORS.cream}`,
        }}
      >
        <Container maxWidth="lg">
          <Link
            component={RouterLink}
            to="/menu"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: COLORS.moss,
              fontWeight: 600,
              textDecoration: "none",
              "&:hover": { color: COLORS.forest },
            }}
          >
            <ChevronLeft size={20} />
            Quay lại Menu
          </Link>
        </Container>
      </Box>

      {/* Product Detail */}
      <Box sx={{ py: 8, bgcolor: COLORS.soft }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Grid container spacing={4} sx={{ mb: 8 }}>
              {/* Image */}
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Box
                    component="img"
                    src={menu.image_url || ""}
                    alt={menu.name}
                    sx={{
                      width: "100%",
                      height: 400,
                      objectFit: "cover",
                      borderRadius: 3,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    }}
                  />
                </motion.div>
              </Grid>

              {/* Info */}
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: COLORS.forest,
                      textTransform: "uppercase",
                      mb: 2,
                    }}
                  >
                    {menu.name}
                  </Typography>

                  {/* Tags */}
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}
                  >
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        bgcolor: COLORS.cream,
                        borderRadius: 2,
                        fontSize: "14px",
                        fontWeight: 600,
                        color: COLORS.dark,
                      }}
                    >
                      {menu.category}
                    </Box>
                    {menu.tag === "best_seller" && (
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          bgcolor: COLORS.moss,
                          borderRadius: 2,
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "white",
                        }}
                      >
                        ⭐ Best Seller
                      </Box>
                    )}
                    {menu.tag === "trending" && (
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          bgcolor: COLORS.teal,
                          borderRadius: 2,
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "white",
                        }}
                      >
                        🔥 Trending
                      </Box>
                    )}
                  </Box>

                  {/* Rating */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                      pb: 3,
                      borderBottom: `1px solid ${COLORS.cream}`,
                    }}
                  >
                    <Rating value={menu.avg_rating || 0} readOnly />
                    <Typography sx={{ color: "#666", fontSize: "14px" }}>
                      ({menu.avg_rating || 0}/5 • {menu.reviews_count || 0} đánh
                      giá)
                    </Typography>
                  </Box>

                  {/* Price */}
                  <Box
                    sx={{
                      mb: 3,
                      pb: 3,
                      borderBottom: `1px solid ${COLORS.cream}`,
                    }}
                  >
                    <Typography sx={{ fontSize: "12px", color: "#666", mb: 1 }}>
                      Giá
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "32px",
                        fontWeight: 700,
                        color: COLORS.moss,
                      }}
                    >
                      {menu.price.toLocaleString("vi-VN")}đ
                    </Typography>
                  </Box>

                  {/* Description */}
                  <Typography
                    sx={{
                      fontSize: "16px",
                      lineHeight: 1.8,
                      color: "#666",
                      mb: 3,
                    }}
                  >
                    {menu.description}
                  </Typography>

                  {/* Ingredients */}
                  {menu.ingredients && menu.ingredients.length > 0 && (
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: COLORS.forest,
                          textTransform: "uppercase",
                          mb: 2,
                        }}
                      >
                        Thành Phần
                      </Typography>
                      <Box component="ul" sx={{ pl: 0, mb: 0 }}>
                        {menu.ingredients.map((ingredient, i) => (
                          <Typography
                            key={i}
                            component="li"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              color: "#666",
                              mb: 1,
                              ml: 0,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: COLORS.moss,
                              }}
                            />
                            {ingredient}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Reviews Section */}
      <Box sx={{ py: 8, bgcolor: "white" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: COLORS.forest,
              textTransform: "uppercase",
              mb: 4,
            }}
          >
            Đánh Giá
          </Typography>

          {/* Add Review Form */}
          {token ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                sx={{
                  mb: 4,
                  borderRadius: 3,
                  border: `1px solid ${COLORS.cream}`,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: COLORS.dark,
                      mb: 3,
                    }}
                  >
                    Chia sẻ đánh giá của bạn
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
                        ⭐ Xếp hạng
                      </Typography>
                      <Rating
                        value={rating}
                        onChange={(e, newValue) => setRating(newValue)}
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
                        💬 Bình luận
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Chia sẻ cảm nhận của bạn về món này..."
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Alert severity="error">{error}</Alert>
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      sx={{
                        bgcolor: COLORS.moss,
                        color: "white",
                        "&:hover": { bgcolor: COLORS.forest },
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      {submitting ? "Đang gửi..." : "Gửi Đánh Giá"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Alert
              severity="info"
              sx={{
                mb: 4,
                backgroundColor: `${COLORS.forest}10`,
                borderColor: `${COLORS.forest}30`,
                color: COLORS.forest,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                "& .MuiAlert-icon": {
                  color: COLORS.forest,
                },
              }}
            >
              <Typography>Đăng nhập để gửi đánh giá của bạn</Typography>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                sx={{
                  bgcolor: COLORS.moss,
                  color: "white",
                  "&:hover": { bgcolor: COLORS.forest },
                  textTransform: "none",
                }}
              >
                Đăng Nhập
              </Button>
            </Alert>
          )}

          {/* Reviews List */}
          <Box>
            {reviews.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Box sx={{ textAlign: "center", py: 6, opacity: 0.6 }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    💭
                  </Typography>
                  <Typography>
                    Chưa có đánh giá nào. Hãy là người đầu tiên!
                  </Typography>
                </Box>
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 },
                  },
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {reviews.map((r) => (
                    <motion.div
                      key={r.id}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0 },
                      }}
                    >
                      <Card
                        sx={{
                          borderRadius: 2,
                          border: `1px solid ${COLORS.cream}`,
                          p: 3,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              sx={{ fontWeight: 600, color: COLORS.dark }}
                            >
                              {r.user?.full_name || "Khách"}
                            </Typography>
                            <Typography
                              sx={{ fontSize: "12px", color: "#999" }}
                            >
                              Đã mua
                            </Typography>
                          </Box>
                          <Rating value={r.rating || 0} readOnly size="small" />
                        </Box>
                        <Typography sx={{ color: "#666" }}>
                          {r.comment}
                        </Typography>
                      </Card>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
