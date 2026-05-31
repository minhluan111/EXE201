import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { menuReviews, reviewCreate } from "../../services/mockApi";
import { useAuth } from "@/context/AuthContext";

// ── Star rating input ────────────────────────────────────────────────────────
function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <motion.button
          key={s}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          style={{ border: "none", background: "transparent", cursor: "pointer", padding: 2 }}
        >
          <Star
            size={22}
            fill={(hover || value) >= s ? "#F59E0B" : "transparent"}
            color={(hover || value) >= s ? "#F59E0B" : "var(--text-light)"}
          />
        </motion.button>
      ))}
    </div>
  );
}

// ── Review item ──────────────────────────────────────────────────────────────
function ReviewItem({ review }) {
  const initials = review.user?.full_name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "?";
  const date = new Date(review.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div style={{
      display: "flex", gap: 14, padding: "18px 0",
      borderBottom: "1px solid var(--border)",
    }}>
      {/* Avatar */}
      <div style={{
        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, var(--matcha), var(--forest))",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: 13, fontWeight: 700,
      }}>
        {initials}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
              {review.user?.full_name ?? "Khách hàng"}
            </span>
            <div style={{ display: "flex", gap: 2, marginTop: 3 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill={i < review.rating ? "#F59E0B" : "transparent"} color={i < review.rating ? "#F59E0B" : "var(--text-light)"} />
              ))}
            </div>
          </div>
          <span style={{ fontSize: 12, color: "var(--text-light)" }}>{date}</span>
        </div>
        <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
          {review.comment}
        </p>

        {review.reply && (
          <div style={{
            marginTop: 12,
            background: "rgba(107, 143, 62, 0.05)",
            borderLeft: "3px solid var(--matcha)",
            borderRadius: "6px",
            padding: "10px 14px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--matcha)", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                🍵 Phản hồi từ Yakishime Manager
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
              {review.reply}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUICK VIEW MODAL
// ═══════════════════════════════════════════════════════════════════════════
export default function QuickViewModal({ item, onClose }) {
  const { user, token } = useAuth();
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [newRating, setNewRating]   = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (!item) return;
    document.body.style.overflow = "hidden";
    setLoading(true);
    menuReviews({ id: item.id }).then((res) => {
      setReviews(res.ok ? res.data : []);
      setLoading(false);
    });
    return () => { document.body.style.overflow = ""; };
  }, [item]);

  if (!item) return null;

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleSubmitReview = async () => {
    if (!newComment.trim()) { setSubmitError("Vui lòng nhập nhận xét."); return; }
    setSubmitting(true); setSubmitError("");
    const res = await reviewCreate({ token, menu_id: item.id, rating: newRating, comment: newComment });
    setSubmitting(false);
    if (res.ok) {
      setNewComment(""); setNewRating(5);
      const refresh = await menuReviews({ id: item.id });
      if (refresh.ok) setReviews(refresh.data);
    } else {
      setSubmitError(res.message ?? "Có lỗi xảy ra.");
    }
  };

  const BADGE_MAP = {
    best_seller: { label: "⭐ Best Seller", color: "#F59E0B" },
    signature:   { label: "✦ Signature",   color: "var(--matcha)" },
    trending:    { label: "🔥 Trending",    color: "#EF4444" },
    new:         { label: "✨ New",         color: "#3B82F6" },
  };
  const badge = BADGE_MAP[item.tag];

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 1100,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
            }}
          />

          {/* Centering Wrapper */}
          <div style={{
            position: "fixed", inset: 0, zIndex: 1101,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none"
          }}>
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              style={{
                pointerEvents: "auto",
                width: "min(96vw, 960px)",
                maxHeight: "90vh",
                background: "var(--bg-card)",
                borderRadius: 28,
                border: "1px solid var(--border)",
                boxShadow: "0 40px 120px rgba(0,0,0,0.25)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: 16, right: 16, zIndex: 10,
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(0,0,0,0.45)", color: "#fff",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={18} />
            </button>

            {/* Body */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
              flex: 1, overflow: "hidden",
            }}
              className="modal-grid"
            >
              {/* Left – Image */}
              <div style={{ position: "relative", minHeight: 400 }}>
                <img
                  src={item.image_url}
                  alt={item.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)" }} />

                {/* Badge */}
                {badge && (
                  <div style={{
                    position: "absolute", bottom: 20, left: 20,
                    padding: "6px 16px", borderRadius: 50,
                    background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)",
                    color: badge.color, fontSize: 13, fontWeight: 700,
                  }}>
                    {badge.label}
                  </div>
                )}
              </div>

              {/* Right – Details + Reviews */}
              <div style={{ overflowY: "auto", padding: "32px 28px" }}>
                {/* Header */}
                <div style={{ marginBottom: 20 }}>
                  <span style={{
                    display: "inline-block", padding: "3px 12px", borderRadius: 50,
                    background: "var(--bg-alt)", color: "var(--text-muted)",
                    fontSize: 12, fontWeight: 600, marginBottom: 10,
                  }}>
                    {item.category}
                  </span>
                  <h2 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 30, fontWeight: 700, color: "var(--text)", margin: "0 0 8px", lineHeight: 1.2,
                  }}>
                    {item.name}
                  </h2>

                  {/* Rating summary */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} fill={i < Math.round(Number(avgRating)) ? "#F59E0B" : "transparent"} color={i < Math.round(Number(avgRating)) ? "#F59E0B" : "var(--text-light)"} />
                      ))}
                    </div>
                    <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 15 }}>{avgRating}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: 13 }}>({reviews.length} đánh giá)</span>
                  </div>

                  <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 20px", fontSize: 15 }}>
                    {item.description}
                  </p>

                  {/* Ingredients */}
                  {item.ingredients?.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                        Thành phần
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {item.ingredients.map((ing, i) => (
                          <span key={i} style={{
                            padding: "4px 12px", borderRadius: 50,
                            border: "1px solid var(--border)",
                            background: "var(--bg-alt)",
                            fontSize: 12, color: "var(--text-muted)",
                          }}>
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 20px", borderRadius: 16,
                    background: "linear-gradient(135deg, rgba(107,143,62,0.08), rgba(47,91,62,0.04))",
                    border: "1px solid rgba(107,143,62,0.15)",
                    marginBottom: 28,
                  }}>
                    <span style={{ color: "var(--text-muted)", fontSize: 14 }}>Giá</span>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 28, fontWeight: 700, color: "var(--matcha)",
                    }}>
                      {item.price.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>

                {/* Reviews */}
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                    Đánh giá của khách hàng
                  </h3>

                  {loading ? (
                    <div style={{ padding: "24px 0" }}>
                      {[1, 2].map((k) => (
                        <div key={k} style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 8 }} />
                            <div className="skeleton" style={{ height: 12, width: "90%" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : reviews.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: 14, padding: "20px 0" }}>
                      Chưa có đánh giá. Hãy là người đầu tiên! 🍵
                    </p>
                  ) : (
                    <div style={{ maxHeight: 280, overflowY: "auto" }}>
                      {reviews.map((r) => <ReviewItem key={r.id} review={r} />)}
                    </div>
                  )}

                  {/* Write review */}
                  {user && (
                    <div style={{ marginTop: 20, padding: "20px", borderRadius: 16, background: "var(--bg-alt)", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
                        Viết đánh giá của bạn
                      </div>
                      <StarInput value={newRating} onChange={setNewRating} />
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn..."
                        rows={3}
                        style={{
                          width: "100%", marginTop: 12, padding: "10px 14px",
                          borderRadius: 12, border: "1px solid var(--border)",
                          background: "var(--bg-card)", color: "var(--text)",
                          fontSize: 14, resize: "none", fontFamily: "Inter, sans-serif",
                          outline: "none", boxSizing: "border-box",
                        }}
                      />
                      {submitError && (
                        <div style={{ color: "#EF4444", fontSize: 13, marginTop: 6 }}>{submitError}</div>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={handleSubmitReview}
                        disabled={submitting}
                        style={{
                          marginTop: 10, padding: "10px 20px", borderRadius: 50,
                          background: "linear-gradient(135deg, var(--matcha), var(--forest))",
                          color: "#fff", border: "none", cursor: submitting ? "not-allowed" : "pointer",
                          fontSize: 13, fontWeight: 700,
                          display: "flex", alignItems: "center", gap: 6,
                          opacity: submitting ? 0.7 : 1,
                        }}
                      >
                        <Send size={13} />
                        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    )}

      <style>{`
        @media (max-width: 640px) {
          .modal-grid { grid-template-columns: 1fr !important; }
          .modal-grid > div:first-child { min-height: 220px !important; max-height: 260px; }
        }
      `}</style>
    </AnimatePresence>
  );
}
