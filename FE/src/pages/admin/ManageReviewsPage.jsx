import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Rating,
  Divider,
} from "@mui/material";
import { Star, MessageSquare, Coffee, Award, Send, Edit2, X } from "lucide-react";
import { useAuth } from "../../context/useAuthContext.js";
import { adminGetReviews, adminReplyReview } from "../../services/apiClient.js";
import AdminHeader from "../../components/admin/AdminHeader.jsx";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
  border: "rgba(0, 0, 0, 0.08)",
};

export default function ManageReviewsPage() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reply states
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [submitting, setSubmitting] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    const res = await adminGetReviews({ token });
    if (res.ok) {
      setList(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [token]);

  const handleSendReply = async (id) => {
    const text = replyText[id];
    if (!text?.trim()) return;

    setSubmitting(id);
    const res = await adminReplyReview({ token, id, reply: text });
    setSubmitting(null);

    if (res.ok) {
      setActiveReplyId(null);
      fetchReviews();
    }
  };

  // Statistics
  const totalReviews = list.length;
  const averageRating =
    totalReviews > 0
      ? Math.round((list.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
      : 0;

  const starDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = list.filter((r) => r.rating === stars).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, percentage };
  });

  return (
    <Box sx={{ bgcolor: "var(--bg)", minHeight: "100vh" }}>
      {/* Dynamic Header */}
      <AdminHeader
        title="Quản lý đánh giá của khách hàng"
        subtitle="Xem và theo dõi các đánh giá sao, nhận xét từ thực khách về món ăn và dịch vụ."
      />

      {/* Main Content */}
      <Box sx={{ py: 6, bgcolor: COLORS.soft }}>
        <Container maxWidth="lg">
          {loading ? (
            <Box sx={{ textAlign: "center", py: 12 }}>
              <CircularProgress sx={{ color: "var(--matcha)", mb: 2 }} />
              <Typography sx={{ color: "var(--text-muted)" }}>Đang tải đánh giá...</Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr 2.5fr"
                },
                gap: 4,
                alignItems: "start",
              }}
            >
              {/* Left Statistics Panel */}
              <Box>
                <Card
                  sx={{
                    borderRadius: 4,
                    border: "1px solid var(--border)",
                    background: "var(--bg-card)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                    position: "sticky",
                    top: 100,
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontFamily: "'Cormorant Garamond', serif",
                        color: "var(--matcha)",
                        mb: 3,
                        fontSize: "20px",
                      }}
                    >
                      Tổng quan đánh giá
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
                      <Typography sx={{ fontSize: "56px", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>
                        {averageRating}
                      </Typography>
                      <Rating value={averageRating} precision={0.1} readOnly sx={{ my: 1.5, color: "#FBBF24" }} />
                      <Typography sx={{ fontSize: "14px", color: "var(--text-muted)" }}>
                        Dựa trên {totalReviews} nhận xét
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Star distribution */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {starDistribution.map((dist) => (
                        <Box key={dist.stars} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Typography sx={{ fontSize: "13px", fontWeight: 600, minWidth: 40 }}>
                            {dist.stars} sao
                          </Typography>
                          <Box sx={{ flex: 1, height: 8, borderRadius: "4px", bgcolor: "var(--bg-alt)", overflow: "hidden" }}>
                            <Box
                              sx={{
                                height: "100%",
                                width: `${dist.percentage}%`,
                                bgcolor: dist.stars >= 4 ? "var(--matcha)" : dist.stars === 3 ? "#FBBF24" : "#EF4444",
                                borderRadius: "4px",
                              }}
                            />
                          </Box>
                          <Typography sx={{ fontSize: "13px", color: "var(--text-muted)", minWidth: 28, textAlign: "right" }}>
                            {dist.count}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Right Reviews List */}
              <Box>
                {list.length === 0 ? (
                  <Card sx={{ borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                    <CardContent sx={{ textAlign: "center", py: 12 }}>
                      <Typography sx={{ fontSize: "56px", mb: 2 }}>⭐️</Typography>
                      <Typography variant="h6">Chưa có đánh giá nào</Typography>
                      <Typography sx={{ mt: 1, fontSize: "14px", opacity: 0.6 }}>
                        Quán chưa nhận được bài đánh giá sao nào từ phía khách hàng.
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)"
                      },
                      gap: 3,
                    }}
                  >
                    {list.map((review, i) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        style={{ width: "100%", display: "flex" }}
                      >
                        <Card
                          sx={{
                            borderRadius: 4,
                            border: "1px solid var(--border)",
                            background: "var(--bg-card)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div>
                              {/* Star and name */}
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1.5 }}>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "var(--text)" }}>
                                    {review.guestName || "Thực khách"}
                                  </Typography>
                                  <Typography sx={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                    {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </Typography>
                                </Box>
                                <Rating value={review.rating} readOnly size="small" sx={{ color: "#FBBF24" }} />
                              </Box>

                              {/* Comment */}
                              <Typography sx={{ color: "var(--text)", mb: 2, fontSize: "15px", fontStyle: "italic", lineHeight: 1.6 }}>
                                "{review.comment || "Không có nhận xét bằng văn bản."}"
                              </Typography>
                            </div>

                            <div>
                              {/* MenuItem Tag */}
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, pb: 2 }}>
                                {review.menuItemId ? (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.8,
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: "50px",
                                      bgcolor: "rgba(107, 143, 62, 0.06)",
                                      border: "1px solid rgba(107, 143, 62, 0.1)",
                                      fontSize: "12px",
                                      color: "var(--matcha)",
                                      fontWeight: 600,
                                    }}
                                  >
                                    <Coffee size={12} />
                                    Đánh giá món ăn
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.8,
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: "50px",
                                      bgcolor: "rgba(0, 0, 0, 0.03)",
                                      border: "1px solid rgba(0, 0, 0, 0.06)",
                                      fontSize: "12px",
                                      color: "var(--text-muted)",
                                      fontWeight: 600,
                                    }}
                                  >
                                    <Award size={12} />
                                    Đánh giá chung dịch vụ
                                  </Box>
                                )}
                              </Box>

                              {/* Manager Reply Section */}
                              <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 1.5 }}>
                                {review.reply ? (
                                  activeReplyId === review.id ? (
                                    /* Edit existing reply */
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                      <textarea
                                        value={replyText[review.id] ?? review.reply}
                                        onChange={(e) => setReplyText({ ...replyText, [review.id]: e.target.value })}
                                        placeholder="Nhập câu trả lời của quán..."
                                        rows={3}
                                        style={{
                                          width: "100%", padding: "10px 12px", borderRadius: "10px",
                                          border: "1px solid var(--matcha)", outline: "none", resize: "none",
                                          fontFamily: "Inter, sans-serif", fontSize: "13.5px", background: "var(--bg-card)", color: "var(--text)",
                                          boxSizing: "border-box"
                                        }}
                                      />
                                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 1 }}>
                                        <button
                                          onClick={() => setActiveReplyId(null)}
                                          style={{
                                            background: "rgba(0,0,0,0.05)", border: "none", color: "var(--text-muted)",
                                            fontSize: "12px", padding: "6px 12px", borderRadius: "8px", fontWeight: 600, cursor: "pointer"
                                          }}
                                        >
                                          Hủy
                                        </button>
                                        <button
                                          onClick={() => handleSendReply(review.id)}
                                          disabled={submitting === review.id}
                                          style={{
                                            background: "var(--matcha)", border: "none", color: "#fff",
                                            fontSize: "12px", padding: "6px 12px", borderRadius: "8px", fontWeight: 600, cursor: "pointer"
                                          }}
                                        >
                                          {submitting === review.id ? "Đang gửi..." : "Cập nhật"}
                                        </button>
                                      </Box>
                                    </Box>
                                  ) : (
                                    /* Display existing reply */
                                    <Box sx={{
                                      background: "rgba(120, 139, 69, 0.05)",
                                      borderLeft: "3px solid var(--matcha)",
                                      borderRadius: "6px",
                                      p: 2,
                                      position: "relative"
                                    }}>
                                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                                        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "var(--matcha)", textTransform: "uppercase" }}>
                                          Phản hồi từ Quán 🍵
                                        </Typography>
                                        <button
                                          onClick={() => {
                                            setActiveReplyId(review.id);
                                            setReplyText({ ...replyText, [review.id]: review.reply });
                                          }}
                                          style={{
                                            background: "transparent", border: "none", cursor: "pointer",
                                            fontSize: "11px", fontWeight: 600, color: "var(--text-light)", display: "flex", alignItems: "center", gap: 3
                                          }}
                                        >
                                          <Edit2 size={11} /> Sửa
                                        </button>
                                      </Box>
                                      <Typography sx={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                                        {review.reply}
                                      </Typography>
                                    </Box>
                                  )
                                ) : activeReplyId === review.id ? (
                                  /* Write new reply */
                                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                    <textarea
                                      value={replyText[review.id] || ""}
                                      onChange={(e) => setReplyText({ ...replyText, [review.id]: e.target.value })}
                                      placeholder="Nhập phản hồi của quán cho khách hàng..."
                                      rows={3}
                                      style={{
                                        width: "100%", padding: "10px 12px", borderRadius: "10px",
                                        border: "1px solid var(--matcha)", outline: "none", resize: "none",
                                        fontFamily: "Inter, sans-serif", fontSize: "13.5px", background: "var(--bg-card)", color: "var(--text)",
                                        boxSizing: "border-box"
                                      }}
                                    />
                                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 1 }}>
                                      <button
                                        onClick={() => setActiveReplyId(null)}
                                        style={{
                                          background: "rgba(0,0,0,0.05)", border: "none", color: "var(--text-muted)",
                                          fontSize: "12px", padding: "6px 12px", borderRadius: "8px", fontWeight: 600, cursor: "pointer"
                                        }}
                                      >
                                        Hủy
                                      </button>
                                      <button
                                        onClick={() => handleSendReply(review.id)}
                                        disabled={submitting === review.id || !replyText[review.id]?.trim()}
                                        style={{
                                          background: "var(--matcha)", border: "none", color: "#fff",
                                          fontSize: "12px", padding: "6px 12px", borderRadius: "8px", fontWeight: 600, cursor: "pointer",
                                          opacity: (!replyText[review.id]?.trim() || submitting === review.id) ? 0.6 : 1
                                        }}
                                      >
                                        {submitting === review.id ? "Đang gửi..." : "Gửi phản hồi"}
                                      </button>
                                    </Box>
                                  </Box>
                                ) : (
                                  /* Show reply button */
                                  <button
                                    onClick={() => setActiveReplyId(review.id)}
                                    style={{
                                      alignSelf: "flex-start",
                                      background: "transparent",
                                      border: "1.5px solid var(--matcha)",
                                      color: "var(--matcha)",
                                      fontSize: "12.5px",
                                      fontWeight: 700,
                                      padding: "6px 16px",
                                      borderRadius: "50px",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 6,
                                      transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "rgba(107, 143, 62, 0.08)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = "transparent";
                                    }}
                                  >
                                    <MessageSquare size={13} /> Phản hồi đánh giá
                                  </button>
                                )}
                              </Box>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}
