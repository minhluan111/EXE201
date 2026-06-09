import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Leaf, Clock, MapPin, Star, ArrowRight, Award,
  ChevronLeft, ChevronRight, Quote, MessageSquare, Sparkles, Users, Flame, Calendar
} from "lucide-react";
import { menuList, getTestimonials } from "../services/apiClient";

// ── Stagger variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
};

// ── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 20, overflow: "hidden",
      background: "var(--bg-card)", border: "1px solid var(--border)",
    }}>
      <div className="skeleton" style={{ height: 220 }} />
      <div style={{ padding: 20 }}>
        <div className="skeleton" style={{ height: 20, width: "70%", marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 14, width: "90%", marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 14, width: "50%" }} />
      </div>
    </div>
  );
}

// ── Menu Card (mini) ─────────────────────────────────────────────────────────
function FeaturedCard({ item, onClick }) {
  const [hovered, setHovered] = useState(false);
  const badgeMap = {
    best_seller: { label: "⭐ Bán chạy nhất", cls: "badge-seller" },
    signature:   { label: "✦ Đặc trưng",   cls: "badge-signature" },
    trending:    { label: "🔥 Xu hướng",    cls: "badge-seller" },
    new:         { label: "✨ Mới",         cls: "badge-new" },
  };
  const badge = badgeMap[item.tag];

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6 }}
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        borderRadius: 20, overflow: "hidden",
        background: "var(--bg-card)", border: "1px solid var(--border)",
        cursor: "pointer",
        boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.14)" : "0 4px 20px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <div className="img-zoom-wrap" style={{ height: 220, position: "relative" }}>
        <img
          src={item.image_url}
          alt={item.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)",
        }} />
        {badge && (
          <span className={`badge ${badge.cls}`} style={{ position: "absolute", top: 14, left: 14, zIndex: 2 }}>
            {badge.label}
          </span>
        )}
      </div>
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0, lineHeight: 1.2 }}>
            {item.name}
          </h3>
          {item.avg_rating > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 3, color: "#F59E0B", flexShrink: 0 }}>
              <Star size={13} fill="#F59E0B" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{item.avg_rating}</span>
            </div>
          )}
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.5,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.description}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "var(--matcha)" }}>
            {item.price.toLocaleString("vi-VN")}₫
          </span>
          <span style={{ fontSize: 12, color: "var(--matcha)", fontWeight: 600 }}>Xem chi tiết →</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Testimonial data ─────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Nguyễn Minh Anh", role: "Foodie & Blogger", rating: 5, text: "Đây là quán matcha chuẩn Nhật nhất tôi từng ghé thăm tại Việt Nam. Không gian yên tĩnh, ánh sáng tự nhiên tuyệt đẹp, và Matcha Oat Latte của họ thực sự đặc biệt!" },
  { name: "Trần Hữu Đức", role: "Nhiếp ảnh gia", rating: 5, text: "Warabi Mochi ở đây nhất định phải thử. Texture mochi tan trong miệng, bột Kinako thơm dịu. Không gian cũng rất aesthetic để chụp ảnh." },
  { name: "Lê Thị Thu Hà", role: "Kiến trúc sư", rating: 5, text: "Mỗi tuần tôi đều ghé uống Usucha. Cách pha trà theo nghi thức Chado truyền thống làm tôi rất xúc động. Nhân viên am hiểu và tận tâm." },
  { name: "Phạm Quốc Toàn", role: "Lập trình viên", rating: 5, text: "Iced Matcha Latte hoàn hảo để làm việc. Vừa uống vừa code cả buổi sáng mà không cần caffeine quá đà. Quán wifi tốt, ghế thoải mái." },
];

// ── Gallery images ───────────────────────────────────────────────────────────
const GALLERY = [
  { url: "/assets/images/space_decor1.png", h: 280, label: "Góc phòng trà" },
  { url: "/assets/images/space_decor2.png", h: 220, label: "Bình hoa nghệ thuật" },
  { url: "/assets/images/space_decor3.png", h: 260, label: "Tĩnh lặng thiền đạo" },
  { url: "/assets/images/space_decor4.png", h: 220, label: "Bình sen thiền định" },
  { url: "/assets/images/space_decor5.jpg", h: 280, label: "Mặt tiền Yaki Café" },
  { url: "/assets/images/space_window.jpg", h: 240, label: "Cửa sổ trúc xanh" },
];

// ── Philosophy Watermarks & Pillars ───────────────────────────────────────────
const PHILOSOPHIES = [
  {
    kanji: "和",
    romaji: "WA",
    title: "Hài Hòa",
    desc: "Cân bằng âm dương giữa con người và thiên nhiên. Trà ngon chắt lọc tinh hoa cỏ cây, hòa quyện tâm hồn thanh tịnh."
  },
  {
    kanji: "敬",
    romaji: "KEI",
    title: "Tôn Kính",
    desc: "Trân trọng từng tri kỷ ghé thăm. Nghi thức pha chế tỉ mỉ thể hiện lòng hiếu khách chân thành và sự tôn kính sâu sắc."
  },
  {
    kanji: "清",
    romaji: "SEI",
    title: "Thanh Khiết",
    desc: "Tinh sạch trong tâm hồn và nguyên liệu. Lá trà organic tinh tuyển từ Uji hòa cùng dòng nước suối ngọt lành thanh mát."
  },
  {
    kanji: "寂",
    romaji: "JAKU",
    title: "Tĩnh Lặng",
    desc: "Sự an nhiên tự tại đạt được sau khi tĩnh tâm. Đắm mình vào tĩnh lặng thanh nhã để tìm lại bản ngã bình yên."
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  const navigate = useNavigate();
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [reviewsList, setReviewsList] = useState(TESTIMONIALS);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const heroRef = useRef(null);

  // No Shoji door curtain animation

  // States for Quick Booking Form
  const [quickGuests, setQuickGuests] = useState(2);
  const [quickDate, setQuickDate]     = useState("Hôm nay");

  // Parallax scroll (background only – content stays visible)
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 160]);

  useEffect(() => {
    let active = true;
    let retryCount = 0;
    const maxRetries = 6;
    const retryDelay = 2000;

    const loadData = async () => {
      try {
        setLoading(true);
        const [res, testRes] = await Promise.all([
          menuList(),
          getTestimonials()
        ]);

        if (!active) return;

        // If fetch fails but we haven't reached max retries, retry in a bit
        if ((!res.ok || !testRes.ok) && retryCount < maxRetries) {
          retryCount++;
          setTimeout(loadData, retryDelay);
          return;
        }

        const loadedProducts = res.ok ? res.data : [];
        setProducts(loadedProducts);
        
        const enrichFallback = () => {
          if (loadedProducts.length > 0) {
            const enriched = TESTIMONIALS.map(t => {
              const product = loadedProducts.find(p => 
                t.text.toLowerCase().includes(p.name.toLowerCase())
              ) || loadedProducts[0];

              return {
                ...t,
                role: product ? `Khách hàng đánh giá · ${product.name}` : t.role,
                foodImage: product ? product.image_url : null,
                foodName: product ? product.name : null,
                menu_id: product ? product.id : null,
              };
            });
            setReviewsList(enriched);
          }
        };

        if (testRes.ok && Array.isArray(testRes.data) && testRes.data.length > 0) {
          // Only keep reviews associated with a valid menu item in our database
          const menuReviews = testRes.data.filter(r => {
            if (!r.menu_id) return false;
            return loadedProducts.some(p => String(p.id) === String(r.menu_id));
          });

          if (menuReviews.length > 0) {
            // Filter and sort by rating desc, slice top 5
            const topReviews = [...menuReviews]
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 5);

            const mapped = topReviews.map(r => {
              const product = loadedProducts.find(p => String(p.id) === String(r.menu_id));
              return {
                id: r.id,
                name: r.user?.full_name || "Khách Hàng Trải Nghiệm",
                role: `Khách hàng đánh giá · ${product.name}`,
                rating: r.rating || 5,
                text: r.comment || "Tuyệt vời!",
                foodImage: product ? product.image_url : null,
                foodName: product ? product.name : null,
                menu_id: r.menu_id,
                reply: r.reply,
                replyAt: r.replyAt,
              };
            });
            setReviewsList(mapped);
          } else {
            enrichFallback();
          }
        } else {
          enrichFallback();
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to load homepage data:", err);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(loadData, retryDelay);
        } else {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => { active = false; };
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    if (reviewsList.length === 0) return;
    const t = setInterval(() => {
      setActiveTestimonial((i) => (i + 1) % reviewsList.length);
    }, 4500);
    return () => clearInterval(t);
  }, [reviewsList.length]);

  const bestSellers = products.filter((p) => ["best_seller", "signature"].includes(p.tag)).slice(0, 3);

  const handleQuickBook = () => {
    const targetDate = quickDate === "Hôm nay"
      ? new Date().toISOString().split("T")[0]
      : new Date(Date.now() + 86400000).toISOString().split("T")[0];
    navigate("/booking", { state: { guests: quickGuests, date: targetDate } });
  };

  const duplicatedGallery = [...GALLERY, ...GALLERY];

  return (
    <div style={{ background: "var(--bg)", overflowX: "hidden" }}>

      {/* ══════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          position: "relative", height: "100vh", minHeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Parallax BG */}
        <motion.div
          style={{
            position: "absolute", inset: "-20%",
            y: heroY,
            backgroundImage: "url('/assets/images/hero_img.jpg')",
            backgroundSize: "cover", backgroundPosition: "center",
          }}
        />

        {/* Overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(15,31,18,0.85) 0%, rgba(47,91,62,0.75) 50%, rgba(15,31,18,0.8) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center bottom, rgba(107,143,62,0.15) 0%, transparent 70%)" }} />

        {/* Falling Leaves Background Layer */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
          {[...Array(8)].map((_, i) => {
            const delay = i * 2.8;
            const left = 5 + (i * 12);
            const scale = 0.5 + (i % 3) * 0.25;
            return (
              <div
                key={i}
                className="falling-leaf"
                style={{
                  left: `${left}%`,
                  animationDelay: `${delay}s`,
                  transform: `scale(${scale})`,
                  animationDuration: `${14 + (i % 4) * 4}s`
                }}
              />
            );
          })}
        </div>

        {/* Content */}
        <div
          style={{
            position: "relative", zIndex: 2,
            textAlign: "center", padding: "0 24px",
            maxWidth: 800,
          }}
        >
          <motion.div
            variants={stagger} initial="hidden" animate="show"
          >
            {/* Eyebrow */}
            <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 18px", borderRadius: 50,
                border: "1px solid rgba(141,175,90,0.4)",
                background: "rgba(141,175,90,0.12)",
                color: "rgba(200,230,160,0.9)", fontSize: 13, fontWeight: 500, letterSpacing: "0.1em",
              }}>
                <Leaf size={13} /> Matcha · Zen · Cao cấp
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              className="sumie-fade"
              variants={fadeUp} 
              style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(52px, 8vw, 96px)", fontWeight: 700,
              color: "#fff", margin: "0 0 16px",
              lineHeight: 1.0, letterSpacing: "-0.03em",
            }}>
              Mỗi Ngụm Trà<br />
              <span style={{ color: "rgba(175,215,120,0.95)", fontStyle: "italic" }}>Một Câu Chuyện</span>
            </motion.h1>

            {/* Sub */}
            <motion.p variants={fadeUp} style={{
              fontSize: "clamp(16px, 2.5vw, 20px)", color: "rgba(255,255,255,0.75)",
              maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7,
            }}>
              Matcha ceremonial grade từ Uji · Trà đạo Chado chính thống ·
              Không gian thiền định tại Cần Thơ
            </motion.p>

            {/* CTAs removed since they exist in the navbar */}

            {/* Info pills */}
            <motion.div variants={fadeUp} style={{
              display: "flex", gap: 24, justifyContent: "center", marginTop: 48,
              flexWrap: "wrap",
            }}>
              {[
                { icon: MapPin, text: "57 Nguyễn Cư Trinh, Cần Thơ" },
                { icon: Clock, text: "08:00 – 22:00 mỗi ngày" },
                { icon: Star,  text: "4.9 ⭐ (200+ đánh giá)" },
              ].map((p, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  color: "rgba(255,255,255,0.7)", fontSize: 13,
                }}>
                  <p.icon size={14} style={{ color: "var(--matcha-light)" }} />
                  {p.text}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}
          style={{
            position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
            width: 26, height: 40, borderRadius: 13,
            border: "2px solid rgba(255,255,255,0.4)",
            display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 6,
          }}
        >
          <motion.div
            animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}
            style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.7)" }}
          />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════
          PHILOSOPHY SECTION (和 - 敬 - 清 - 寂)
      ══════════════════════════════════════════════════ */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div
            variants={stagger} initial="hidden"
            whileInView="show" viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 64 }}>
              <span style={{ color: "var(--matcha)", fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Triết lý Trà đạo Chado
              </span>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(36px, 5vw, 56px)",
                fontWeight: 700, color: "var(--text)", margin: "12px 0 0",
                lineHeight: 1.1
              }}>
                Nghệ thuật trong từng tách trà
              </h2>
              <div style={{ width: 60, height: 2, background: "var(--matcha)", margin: "20px auto 0" }} />
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 28 }}>
              {PHILOSOPHIES.map((p, i) => (
                <motion.div
                  key={i} variants={fadeUp}
                  whileHover={{ y: -10, scale: 1.02 }}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 28,
                    padding: "48px 32px 40px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 320
                  }}
                >
                  {/* Calligraphy Kanji Watermark */}
                  <span style={{
                    position: "absolute", top: -20, right: -10,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 160, fontWeight: 800,
                    color: "rgba(107, 143, 62, 0.04)",
                    lineHeight: 1, pointerEvents: "none", userSelect: "none"
                  }}>
                    {p.kanji}
                  </span>

                  <div>
                    {/* Romaji pill */}
                    <span style={{
                      display: "inline-block", padding: "3px 10px", borderRadius: 50,
                      background: "rgba(107,143,62,0.08)", color: "var(--matcha)",
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 18
                    }}>
                      {p.romaji}
                    </span>

                    <h3 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "0 0 14px",
                      position: "relative", zIndex: 1
                    }}>
                      {p.title}
                    </h3>

                    <p style={{
                      color: "var(--text-muted)", margin: 0,
                      lineHeight: 1.7, fontSize: 14.5,
                      position: "relative", zIndex: 1
                    }}>
                      {p.desc}
                    </p>
                  </div>

                  <div style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: 18, marginTop: 24,
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: 13, fontWeight: 700, color: "var(--matcha)"
                  }}>
                    Tinh thần Zen-Matcha
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BEST SELLERS SECTION
      ══════════════════════════════════════════════════ */}
      <section style={{ padding: "0 24px 96px", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div
            variants={stagger} initial="hidden"
            whileInView="show" viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
              <div>
                <span style={{ color: "var(--matcha)", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  Được yêu thích nhất
                </span>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, color: "var(--text)", margin: "8px 0 0" }}>
                  Món Nước Đặc Trưng
                </h2>
              </div>
              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => navigate("/menu")}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "var(--matcha)", fontWeight: 700, fontSize: 15,
                }}
              >
                Xem toàn bộ menu <ArrowRight size={16} />
              </motion.button>
            </motion.div>

            <motion.div
              key={loading ? "loading" : "loaded"}
              variants={stagger}
              initial="hidden"
              animate={loading ? "hidden" : "show"}
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}
            >
              {loading
                ? [1, 2, 3].map((k) => <SkeletonCard key={k} />)
                : bestSellers.length > 0
                ? bestSellers.map((item) => (
                    <FeaturedCard
                      key={item.id}
                      item={item}
                      onClick={() => navigate(`/menu/${item.id}`)}
                    />
                  ))
                : (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 24, padding: "48px 24px" }}>
                    <p style={{ fontSize: 44, margin: "0 0 12px" }}>🍵</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>Không thể tải danh sách món ăn</p>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 20px" }}>Kết nối tới máy chủ bị gián đoạn. Vui lòng kiểm tra lại.</p>
                    <button onClick={() => window.location.reload()} style={{ padding: "10px 24px", borderRadius: 50, background: "var(--matcha)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, boxShadow: "0 4px 12px rgba(107,143,62,0.2)" }}>Tải lại trang</button>
                  </div>
                )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          INFINITE AUTO-SCROLLING SPACE GALLERY
      ══════════════════════════════════════════════════ */}
      <section style={{ padding: "0 0 100px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto 36px", padding: "0 24px" }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span style={{ color: "var(--matcha)", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Không gian quán
            </span>
            <h2 className="sumie-fade" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, color: "var(--text)", margin: "8px 0 0" }}>
              Zen trong từng góc nhỏ
            </h2>
          </motion.div>
        </div>

        {/* Infinite Scrolling Gallery track */}
        <div style={{
          overflow: "hidden",
          width: "100%",
          position: "relative",
          padding: "20px 0",
        }}>
          {/* Mask edge shading */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 80,
            background: "linear-gradient(to right, var(--bg) 0%, transparent 100%)",
            zIndex: 3, pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0, width: 80,
            background: "linear-gradient(to left, var(--bg) 0%, transparent 100%)",
            zIndex: 3, pointerEvents: "none"
          }} />

          <motion.div
            style={{
              display: "flex",
              gap: 24,
              width: "max-content",
            }}
            animate={{ x: [0, "-50%"] }}
            transition={{
              ease: "linear",
              duration: 35,
              repeat: Infinity,
            }}
          >
            {duplicatedGallery.map((g, i) => (
              <motion.div
                key={i}
                className="img-zoom-wrap"
                whileHover={{ y: -8, scale: 1.02 }}
                style={{
                  width: "280px",
                  height: g.h,
                  borderRadius: 24,
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: "var(--shadow-md)",
                  border: "1px solid var(--border)",
                  flexShrink: 0,
                  cursor: "pointer"
                }}
              >
                <img src={g.url} alt={g.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  padding: "40px 20px 20px",
                  background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.05em" }}>{g.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.8, fontWeight: 500 }}>Không gian Yakishime</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIALS SECTION
      ══════════════════════════════════════════════════ */}
      <section style={{
        padding: "100px 24px",
        background: "linear-gradient(135deg, var(--forest-dark) 0%, var(--bg-alt) 150%)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative elements */}
        <div style={{ position: "absolute", top: -150, right: -150, width: 450, height: 450, borderRadius: "50%", background: "rgba(107,143,62,0.15)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: -150, left: -150, width: 450, height: 450, borderRadius: "50%", background: "rgba(107,143,62,0.06)", filter: "blur(80px)" }} />

        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ marginBottom: 48 }}
          >
            <span style={{ color: "rgba(175,215,120,0.9)", fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Cảm nhận thực khách
            </span>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 700, color: "#fff", margin: "12px 0 0",
              lineHeight: 1.15
            }}>
              Đánh giá từ những người thân
            </h2>
            <div style={{ width: 60, height: 2, background: "var(--matcha-light)", margin: "20px auto 0" }} />
          </motion.div>

          {/* Testimonial Card */}
          <div style={{ position: "relative", padding: "0 10px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -20 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                style={{
                  background: "rgba(22, 32, 25, 0.65)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(141, 175, 90, 0.18)",
                  borderRadius: 32,
                  padding: "54px 48px",
                  boxShadow: "var(--shadow-lg)",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Large double quote watermark */}
                <span style={{
                  position: "absolute", top: 12, right: 36,
                  fontSize: 140, fontWeight: 900,
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "rgba(141, 175, 90, 0.06)",
                  lineHeight: 1, pointerEvents: "none", userSelect: "none"
                }}>
                  “
                </span>

                {reviewsList[activeTestimonial]?.foodImage && (
                  <motion.div 
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (reviewsList[activeTestimonial]?.menu_id) {
                        navigate(`/menu/${reviewsList[activeTestimonial].menu_id}`);
                      }
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 14,
                      marginBottom: 26,
                      background: "rgba(107, 143, 62, 0.12)",
                      backdropFilter: "blur(12px)",
                      padding: "8px 18px 8px 10px",
                      borderRadius: "20px",
                      border: "1px solid rgba(141, 175, 90, 0.3)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <div style={{ 
                      position: "relative", 
                      width: 44, 
                      height: 44, 
                      borderRadius: "14px", 
                      overflow: "hidden", 
                      flexShrink: 0, 
                      border: "1px solid rgba(255,255,255,0.15)" 
                    }}>
                      <img 
                        src={reviewsList[activeTestimonial].foodImage} 
                        alt={reviewsList[activeTestimonial].foodName} 
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <span style={{ 
                        display: "block", 
                        fontSize: 11, 
                        color: "var(--matcha-light)", 
                        fontWeight: 700, 
                        letterSpacing: "0.05em", 
                        textTransform: "uppercase" 
                      }}>
                        Đánh giá món ăn
                      </span>
                      <span style={{ fontSize: 14, color: "#FFFFFF", fontWeight: 700 }}>
                        {reviewsList[activeTestimonial].foodName}
                      </span>
                    </div>
                    <div style={{
                      marginLeft: 10,
                      fontSize: 12,
                      color: "rgba(255, 255, 255, 0.6)",
                      fontWeight: 600,
                      borderLeft: "1px solid rgba(255, 255, 255, 0.18)",
                      paddingLeft: 12,
                    }}>
                      Chi tiết món ➔
                    </div>
                  </motion.div>
                )}

                <div style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 24, marginTop: reviewsList[activeTestimonial]?.foodImage ? 0 : 12 }}>
                  {[...Array(reviewsList[activeTestimonial]?.rating || 5)].map((_, i) => (
                    <Star key={i} size={18} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>

                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(18px, 2.5vw, 22px)",
                  color: "#E2E8F0",
                  lineHeight: 1.8,
                  margin: reviewsList[activeTestimonial]?.reply ? "0 0 20px" : "0 0 36px",
                  fontStyle: "italic",
                  fontWeight: 500,
                  letterSpacing: "0.01em"
                }}>
                  "{reviewsList[activeTestimonial]?.text || ""}"
                </p>

                {reviewsList[activeTestimonial]?.reply && (
                  <div style={{
                    background: "rgba(107, 143, 62, 0.12)",
                    borderLeft: "3px solid var(--matcha-light)",
                    borderRadius: "10px",
                    padding: "14px 20px",
                    textAlign: "left",
                    maxWidth: "560px",
                    margin: "0 auto 36px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    border: "1px solid rgba(141, 175, 90, 0.15)",
                    boxSizing: "border-box"
                  }}>
                    <span style={{ 
                      display: "block", 
                      fontSize: 11, 
                      color: "var(--matcha-light)", 
                      fontWeight: 700, 
                      textTransform: "uppercase", 
                      letterSpacing: "0.05em", 
                      marginBottom: 6 
                    }}>
                      🍵 Phản hồi từ Yakishime Manager
                    </span>
                    <p style={{ fontSize: 13.5, color: "#CBD5E1", margin: 0, lineHeight: 1.5, fontStyle: "normal" }}>
                      {reviewsList[activeTestimonial].reply}
                    </p>
                  </div>
                )}

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  paddingTop: 24
                }}>
                  {/* User Avatar Initials */}
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--matcha), var(--forest))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 15, fontWeight: 700,
                    boxShadow: "var(--shadow-sm)",
                    flexShrink: 0
                  }}>
                    {(reviewsList[activeTestimonial]?.name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>

                  <div style={{ textAlign: "left" }}>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
                      {reviewsList[activeTestimonial]?.name || ""}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 2 }}>
                      {reviewsList[activeTestimonial]?.role || ""}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 36 }}>
            {reviewsList.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                whileHover={{ scale: 1.3 }}
                style={{
                  width: i === activeTestimonial ? 32 : 10,
                  height: 10, borderRadius: 99, border: "none", cursor: "pointer",
                  background: i === activeTestimonial
                    ? "linear-gradient(135deg, var(--matcha), var(--matcha-light))"
                    : "rgba(255,255,255,0.22)",
                  boxShadow: i === activeTestimonial ? "0 2px 10px rgba(141,175,90,0.4)" : "none",
                  transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BREAK-THE-MOLD CTA BANNER
      ══════════════════════════════════════════════════ */}
      <section style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75 }}
            style={{
              background: "linear-gradient(135deg, var(--forest-dark) 0%, rgba(22,32,25,0.95) 100%)",
              border: "1px solid rgba(141, 175, 90, 0.22)",
              borderRadius: 36,
              padding: "60px 48px",
              boxShadow: "var(--shadow-lg)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Blurry glow background blobs */}
            <div style={{ position: "absolute", top: -50, left: -50, width: 250, height: 250, borderRadius: "50%", background: "rgba(107,143,62,0.18)", filter: "blur(50px)" }} />
            <div style={{ position: "absolute", bottom: -50, right: -50, width: 250, height: 250, borderRadius: "50%", background: "rgba(141,175,90,0.12)", filter: "blur(50px)" }} />

            {/* Split Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 40,
              alignItems: "center",
              position: "relative",
              zIndex: 2,
              textAlign: "left"
            }}>
              {/* Left Column – Philosophy & Hype */}
              <div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 12px", borderRadius: 50,
                  background: "rgba(141,175,90,0.15)",
                  color: "var(--matcha-light)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", marginBottom: 18
                }}>
                  🟢 Trực tuyến: 8 khách đang xem bàn
                </span>

                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(36px, 4.5vw, 48px)",
                  fontWeight: 700, color: "#fff", margin: "0 0 16px",
                  lineHeight: 1.15
                }}>
                  Trải nghiệm tĩnh lặng<br />
                  <span style={{ color: "rgba(175,215,120,0.95)", fontStyle: "italic" }}>trong từng góc thiền</span>
                </h2>

                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15.5, lineHeight: 1.7, margin: "0 0 28px", maxWidth: 440 }}>
                  Không gian trà đạo thiền định Yakishime giới hạn số lượng bàn ngồi để duy trì không khí tĩnh tại. Đăng ký sớm để giữ vị trí ngắm trà đạo tốt nhất.
                </p>

                {/* Status indicator */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "12px 20px", borderRadius: 16,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)"
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    backgroundColor: "#EF4444",
                    boxShadow: "0 0 8px #EF4444",
                  }} />
                  <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13.5, fontWeight: 600 }}>
                    Khung giờ tối nay chỉ còn 3 bàn trống!
                  </span>
                </div>
              </div>

              {/* Right Column – Interactive Quick Reservation */}
              <div style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 28,
                padding: 32,
                boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
              }}>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 20px"
                }}>
                  Đặt chỗ nhanh
                </h3>

                {/* Interactive State Form */}
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {/* Guest selector */}
                  <div>
                    <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>
                      Số lượng khách
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[2, 3, 4].map((num) => {
                        const isSel = quickGuests === num;
                        return (
                          <button
                            key={num}
                            onClick={() => setQuickGuests(num)}
                            style={{
                              flex: 1, padding: "8px 0", borderRadius: 12,
                              border: isSel ? "1.5px solid var(--matcha-light)" : "1px solid rgba(255,255,255,0.15)",
                              background: isSel ? "rgba(141,175,90,0.22)" : "rgba(255,255,255,0.03)",
                              color: isSel ? "var(--matcha-light)" : "rgba(255,255,255,0.75)",
                              fontSize: 13, fontWeight: 700, cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            {num} người
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date selector */}
                  <div>
                    <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>
                      Chọn thời gian
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["Hôm nay", "Ngày mai"].map((d) => {
                        const isSel = quickDate === d;
                        return (
                          <button
                            key={d}
                            onClick={() => setQuickDate(d)}
                            style={{
                              flex: 1, padding: "8px 0", borderRadius: 12,
                              border: isSel ? "1.5px solid var(--matcha-light)" : "1px solid rgba(255,255,255,0.15)",
                              background: isSel ? "rgba(141,175,90,0.22)" : "rgba(255,255,255,0.03)",
                              color: isSel ? "var(--matcha-light)" : "rgba(255,255,255,0.75)",
                              fontSize: 13, fontWeight: 700, cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Final Button */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleQuickBook}
                    className="pulse-glow btn-primary"
                    style={{
                      width: "100%", padding: "14px 0", marginTop: 8,
                      borderRadius: 14, background: "linear-gradient(135deg, var(--matcha), var(--matcha-light))",
                      color: "#fff", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                    }}
                  >
                    Tiến hành giữ chỗ <ArrowRight size={16} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
