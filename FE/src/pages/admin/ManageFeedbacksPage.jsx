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
  TextField,
  Button,
  Divider,
} from "@mui/material";
import { adminGetFeedbacks, adminReplyFeedback } from "../../services/apiClient.js";
import { useAuth } from "../../context/useAuthContext.js";
import AdminHeader from "../../components/admin/AdminHeader.jsx";

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

  // Reply state
  const [replyText, setReplyText] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [submitting, setSubmitting] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await adminGetFeedbacks({ token });
      if (res.ok) setList(res.data);
      setLoading(false);
    })();
  }, [token]);

  const handleSendReply = async (id) => {
    const text = replyText[id]?.trim();
    if (!text) return;

    setSubmitting(id);
    const res = await adminReplyFeedback({ token, id, reply: text });
    setSubmitting(null);

    if (res.ok) {
      setList((prev) => prev.map((item) => (item.id === id ? res.data : item)));
      setActiveReplyId(null);
      setReplyText((prev) => ({ ...prev, [id]: "" }));
    } else {
      alert(res.message || "Gửi phản hồi thất bại.");
    }
  };

  return (
    <Box sx={{ bgcolor: "var(--bg)", minHeight: "100vh" }}>
      {/* Dynamic Header */}
      <AdminHeader
        title="Quản lý ý kiến phản hồi"
        subtitle="Xem và phản hồi trực tiếp các đóng góp, ý kiến của thực khách."
      />

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
                  list.map((feedback) => {
                    const isReplied = !!feedback.reply;
                    const isReplying = activeReplyId === feedback.id;

                    return (
                      <motion.div
                        key={feedback.id}
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          show: { opacity: 1, y: 0 },
                        }}
                      >
                        <Card
                          sx={{
                            borderRadius: 4,
                            border: `1px solid rgba(0,0,0,0.06)`,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                            background: "var(--bg-card)",
                            overflow: "hidden",
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
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
                                Tiêu đề: {feedback.title}
                              </Typography>
                              <Chip
                                label={isReplied ? "Đã phản hồi" : "Mới"}
                                sx={{
                                  backgroundColor: isReplied ? "rgba(107, 143, 62, 0.1)" : `${COLORS.moss}20`,
                                  color: isReplied ? "var(--matcha)" : COLORS.moss,
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                            <Typography sx={{ color: "var(--text)", mb: 2, fontSize: "15px" }}>
                              Nội dung: {feedback.content}
                            </Typography>
                            
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                              <Typography sx={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
                                Người gửi: {feedback.user?.full_name || "Khách hàng"}
                              </Typography>
                              
                              {!isReplied && !isReplying && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => setActiveReplyId(feedback.id)}
                                  sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    background: "var(--matcha)",
                                    "&:hover": { background: "var(--forest)" },
                                  }}
                                >
                                  Phản hồi
                                </Button>
                              )}
                            </Box>

                            {/* Display reply if exists */}
                            {isReplied && (
                              <Box sx={{ mt: 3, p: 2, borderRadius: 3, background: "rgba(107,143,62,0.04)", borderLeft: "4px solid var(--matcha)" }}>
                                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "var(--matcha)", mb: 0.5 }}>
                                  Phản hồi từ quán:
                                </Typography>
                                <Typography sx={{ fontSize: "14px", color: "var(--text)" }}>
                                  {feedback.reply}
                                </Typography>
                              </Box>
                            )}

                            {/* Inline reply textarea */}
                            {isReplying && (
                              <Box sx={{ mt: 3 }}>
                                <Divider sx={{ my: 2 }} />
                                <Typography sx={{ fontSize: "14px", fontWeight: 600, mb: 1, color: "var(--text)" }}>
                                  Viết phản hồi:
                                </Typography>
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={2}
                                  placeholder="Nhập nội dung phản hồi gửi tới thực khách..."
                                  value={replyText[feedback.id] || ""}
                                  onChange={(e) => setReplyText(prev => ({ ...prev, [feedback.id]: e.target.value }))}
                                  size="small"
                                  sx={{
                                    mb: 1.5,
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "10px",
                                      background: "var(--bg-alt)",
                                      "& fieldset": { border: "none" },
                                    }
                                  }}
                                />
                                <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                                  <Button
                                    size="small"
                                    color="inherit"
                                    onClick={() => setActiveReplyId(null)}
                                    sx={{ textTransform: "none", borderRadius: "8px" }}
                                  >
                                    Hủy
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    disabled={submitting === feedback.id || !replyText[feedback.id]?.trim()}
                                    onClick={() => handleSendReply(feedback.id)}
                                    sx={{
                                      textTransform: "none",
                                      borderRadius: "8px",
                                      background: "var(--matcha)",
                                      "&:hover": { background: "var(--forest)" },
                                    }}
                                  >
                                    {submitting === feedback.id ? "Đang gửi..." : "Gửi"}
                                  </Button>
                                </Box>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </Box>
            </motion.div>
          )}
        </Container>
      </Box>
    </Box>
  );
}
