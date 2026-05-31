import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Star, Send, Sparkles } from "lucide-react";
import { menuDetail, menuReviews, reviewCreate } from "../services/apiClient.js";
import Loading from "../components/common/Loading.jsx";
import { useAuth } from "../context/useAuthContext.js";

// ── Rating Input for the Review Form ──────────────────────────────────────────
function InteractiveRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <motion.button
          type="button"
          key={s}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          style={{ border: "none", background: "transparent", cursor: "pointer", padding: 2 }}
        >
          <Star
            size={24}
            fill={(hover || value) >= s ? "#F59E0B" : "transparent"}
            color={(hover || value) >= s ? "#F59E0B" : "var(--text-light)"}
          />
        </motion.button>
      ))}
    </div>
  );
}

// ── Review Item component ──────────────────────────────────────────────────
function ReviewItem({ review }) {
  const initials = review.user?.full_name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "?";
  const date = new Date(review.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div style={{
      display: "flex", gap: 16, padding: "20px 0",
      borderBottom: "1px solid var(--border)",
    }}>
      {/* Avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, var(--matcha), var(--forest))",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: 14, fontWeight: 700,
        boxShadow: "var(--shadow-sm)"
      }}>
        {initials}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
              {review.user?.full_name ?? "Khách hàng"}
            </span>
            <div style={{ display: "flex", gap: 2, marginTop: 3 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} fill={i < review.rating ? "#F59E0B" : "transparent"} color={i < review.rating ? "#F59E0B" : "var(--text-light)"} />
              ))}
            </div>
          </div>
          <span style={{ fontSize: 13, color: "var(--text-light)" }}>{date}</span>
        </div>
        <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 4px", lineHeight: 1.6 }}>
          {review.comment}
        </p>

        {review.reply && (
          <div style={{
            marginTop: 12,
            background: "rgba(107, 143, 62, 0.05)",
            borderLeft: "3px solid var(--matcha)",
            borderRadius: "6px",
            padding: "10px 14px",
            boxShadow: "var(--shadow-sm)",
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

export default function MenuDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const [a, b] = await Promise.all([menuDetail({ id }), menuReviews({ id })]);
    setMenu(a.ok ? a.data : null);
    setReviews(b.ok ? b.data : []);
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
    setRating(5);
    await load();
  };

  if (loading) return <Loading />;

  if (!menu) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", background: "var(--bg)",
        padding: 24, textAlign: "center"
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          Không tìm thấy món ăn
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
          Món này không tồn tại hoặc đã được gỡ bỏ khỏi thực đơn.
        </p>
        <Link to="/menu" className="btn-primary">
          <ChevronLeft size={16} /> Quay lại thực đơn
        </Link>
      </div>
    );
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : (menu.avg_rating || 0);

  const BADGE_MAP = {
    best_seller: { label: "⭐ Best Seller", color: "#F59E0B" },
    signature:   { label: "✦ Signature",   color: "var(--matcha)" },
    trending:    { label: "🔥 Trending",    color: "#EF4444" },
    new:         { label: "✨ New",         color: "#3B82F6" },
  };
  const badge = BADGE_MAP[menu.tag];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Navigation */}
      <div style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
        padding: "16px 0",
        position: "sticky", top: 68, zIndex: 90
      }}>
        <div className="container-xl" style={{ display: "flex", alignItems: "center" }}>
          <Link
            to="/menu"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              color: "var(--matcha)", fontWeight: 600, fontSize: 15,
              textDecoration: "none", transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--forest)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--matcha)"}
          >
            <ChevronLeft size={18} />
            Quay lại Thực đơn
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="container-xl" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Detail Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 48,
            marginBottom: 64,
            alignItems: "start"
          }}>
            {/* Left – Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                position: "relative",
                borderRadius: 24,
                overflow: "hidden",
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                boxShadow: "var(--shadow-md)"
              }}
              className="img-zoom-wrap"
            >
              <img
                src={menu.image_url || ""}
                alt={menu.name}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: 500,
                  minHeight: 350,
                  objectFit: "cover",
                  display: "block"
                }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%)" }} />
              
              {badge && (
                <div style={{
                  position: "absolute", bottom: 20, left: 20,
                  padding: "6px 16px", borderRadius: 50,
                  background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)",
                  color: badge.color, fontSize: 13, fontWeight: 700,
                  boxShadow: "var(--shadow-sm)"
                }}>
                  {badge.label}
                </div>
              )}
            </motion.div>

            {/* Right – Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Category */}
              <span style={{
                display: "inline-block", padding: "4px 14px", borderRadius: 50,
                background: "var(--bg-alt)", color: "var(--text-muted)",
                fontSize: 12, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.06em", marginBottom: 12
              }}>
                {menu.category}
              </span>

              {/* Title */}
              <h1 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(32px, 5vw, 44px)", fontWeight: 700,
                color: "var(--text)", margin: "0 0 12px", lineHeight: 1.2,
                textTransform: "uppercase"
              }}>
                {menu.name}
              </h1>

              {/* Ratings */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--border)"
              }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.round(Number(avgRating)) ? "#F59E0B" : "transparent"} color={i < Math.round(Number(avgRating)) ? "#F59E0B" : "var(--text-light)"} />
                  ))}
                </div>
                <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 15 }}>{avgRating}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>({reviews.length} đánh giá)</span>
              </div>

              {/* Price */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "20px 24px", borderRadius: 20,
                background: "linear-gradient(135deg, rgba(107,143,62,0.08), rgba(47,91,62,0.04))",
                border: "1px solid rgba(107,143,62,0.15)",
                marginBottom: 28,
              }}>
                <span style={{ color: "var(--text-muted)", fontSize: 14 }}>Giá thành</span>
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 32, fontWeight: 700, color: "var(--matcha)",
                }}>
                  {menu.price.toLocaleString("vi-VN")}₫
                </span>
              </div>

              {/* Description */}
              <p style={{
                color: "var(--text-muted)", lineHeight: 1.8,
                fontSize: 16, margin: "0 0 32px"
              }}>
                {menu.description}
              </p>

              {/* Ingredients */}
              {menu.ingredients && menu.ingredients.length > 0 && (
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 28 }}>
                  <h3 style={{
                    fontSize: 12, fontWeight: 700, color: "var(--text-muted)",
                    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12
                  }}>
                    Thành phần món ăn
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {menu.ingredients.map((ing, i) => (
                      <span key={i} style={{
                        padding: "6px 16px", borderRadius: 50,
                        border: "1px solid var(--border)",
                        background: "var(--bg-alt)",
                        fontSize: 13, color: "var(--text-muted)",
                        transition: "all 0.2s",
                      }}>
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Reviews Section */}
          <div style={{
            background: "var(--bg-card)",
            borderRadius: 24,
            border: "1px solid var(--border)",
            padding: "36px 32px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 32, fontWeight: 700, color: "var(--text)",
              marginBottom: 32, display: "flex", alignItems: "center", gap: 10
            }}>
              <Sparkles size={24} style={{ color: "var(--matcha)" }} />
              Đánh giá của khách hàng
            </h2>

            {/* Write Review Form */}
            {user ? (
              <div style={{
                marginBottom: 48, padding: 24, borderRadius: 20,
                background: "var(--bg-alt)", border: "1px solid var(--border)"
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
                  Chia sẻ cảm nhận của bạn về món này 🍵
                </h3>
                
                <form onSubmit={onSubmit}>
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>
                      Xếp hạng chất lượng:
                    </span>
                    <InteractiveRating value={rating} onChange={setRating} />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <span style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>
                      Ý kiến của bạn:
                    </span>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Trà đậm vị, không gian quán rất ấm cúng..."
                      rows={4}
                      style={{
                        width: "100%", padding: "12px 16px",
                        borderRadius: 12, border: "1px solid var(--border)",
                        background: "var(--bg-card)", color: "var(--text)",
                        fontSize: 14, resize: "none", fontFamily: "Inter, sans-serif",
                        outline: "none", boxSizing: "border-box",
                        transition: "border-color 0.2s"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "var(--matcha)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                    />
                  </div>

                  {error && (
                    <div style={{ color: "#EF4444", fontSize: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                      ⚠️ {error}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: "12px 28px", borderRadius: 50,
                      background: "linear-gradient(135deg, var(--matcha), var(--forest))",
                      color: "#fff", border: "none", cursor: submitting ? "not-allowed" : "pointer",
                      fontSize: 14, fontWeight: 700,
                      display: "flex", alignItems: "center", gap: 8,
                      opacity: submitting ? 0.7 : 1,
                      boxShadow: "0 4px 16px rgba(107,143,62,0.25)"
                    }}
                  >
                    <Send size={14} />
                    {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                  </motion.button>
                </form>
              </div>
            ) : (
              <div style={{
                marginBottom: 40, padding: "20px 24px", borderRadius: 16,
                background: "rgba(107,143,62,0.06)", border: "1px solid rgba(107,143,62,0.15)",
                display: "flex", flexWrap: "wrap", justifyContent: "space-between",
                alignItems: "center", gap: 16
              }}>
                <span style={{ color: "var(--text-muted)", fontSize: 15 }}>
                  Đăng nhập để chia sẻ đánh giá của bạn về thực đơn.
                </span>
                <Link
                  to="/login"
                  style={{
                    padding: "10px 24px", borderRadius: 50,
                    background: "var(--matcha)", color: "#fff",
                    textDecoration: "none", fontSize: 14, fontWeight: 700,
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--forest)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "var(--matcha)"}
                >
                  Đăng nhập ngay
                </Link>
              </div>
            )}

            {/* Reviews List */}
            <div>
              {reviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>
                  <p style={{ fontSize: 44, margin: "0 0 12px" }}>💭</p>
                  <p style={{ fontSize: 15, margin: 0 }}>Chưa có đánh giá nào cho món này. Hãy là người đầu tiên!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {reviews.map((r) => (
                    <ReviewItem key={r.id} review={r} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
