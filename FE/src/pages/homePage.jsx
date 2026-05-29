import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Leaf, Clock, MapPin, Star, ArrowRight, Award,
  ChevronLeft, ChevronRight, Quote,
} from "lucide-react";
import { menuList } from "../services/mockApi";

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
    best_seller: { label: "⭐ Best Seller", cls: "badge-seller" },
    signature:   { label: "✦ Signature",   cls: "badge-signature" },
    trending:    { label: "🔥 Trending",    cls: "badge-seller" },
    new:         { label: "✨ New",         cls: "badge-new" },
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
  { url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80", h: 280, label: "Không gian thiền" },
  { url: "https://images.unsplash.com/photo-1593038756742-48c34b3b0e33?w=400&q=80", h: 200, label: "Trà đạo" },
  { url: "https://images.unsplash.com/photo-1631898039254-d91a35c32f1a?w=400&q=80", h: 260, label: "Matcha Latte" },
  { url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80", h: 220, label: "Parfait" },
  { url: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80", h: 300, label: "Warabi Mochi" },
  { url: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=400&q=80", h: 240, label: "Iced Matcha" },
];

// ── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Leaf,  title: "Nguyên liệu thuần khiết",   desc: "Matcha Uji ceremonial grade, nhập trực tiếp từ Kyoto, Nhật Bản." },
  { icon: Award, title: "Nghệ thuật Chado",           desc: "Từng tách trà được pha theo đúng nghi thức trà đạo truyền thống." },
  { icon: Clock, title: "Không gian Zen thư giãn",    desc: "Thiết kế nội thất minimalist Nhật Bản, ánh sáng tự nhiên, yên tĩnh." },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  const navigate = useNavigate();
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const heroRef = useRef(null);

  // Parallax scroll (background only – content stays visible)
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 160]);

  useEffect(() => {
    (async () => {
      const res = await menuList();
      setProducts(res.ok ? res.data : []);
      setLoading(false);
    })();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((i) => (i + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const bestSellers = products.filter((p) => ["best_seller", "signature"].includes(p.tag)).slice(0, 3);

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
            backgroundImage: "url('https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=1600&q=90')",
            backgroundSize: "cover", backgroundPosition: "center",
          }}
        />

        {/* Overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(15,31,18,0.85) 0%, rgba(47,91,62,0.75) 50%, rgba(15,31,18,0.8) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center bottom, rgba(107,143,62,0.15) 0%, transparent 70%)" }} />

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
                <Leaf size={13} /> Matcha · Zen · Premium
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(52px, 8vw, 96px)", fontWeight: 700,
              color: "#fff", margin: "0 0 16px",
              lineHeight: 1.0, letterSpacing: "-0.03em",
            }}>
              Where Every Sip<br />
              <span style={{ color: "rgba(175,215,120,0.95)", fontStyle: "italic" }}>Tells a Story</span>
            </motion.h1>

            {/* Sub */}
            <motion.p variants={fadeUp} style={{
              fontSize: "clamp(16px, 2.5vw, 20px)", color: "rgba(255,255,255,0.75)",
              maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7,
            }}>
              Matcha ceremonial grade từ Uji · Trà đạo Chado chính thống ·
              Không gian thiền định tại Cần Thơ
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/menu")}
                className="pulse-glow"
                style={{
                  padding: "16px 36px", borderRadius: 50,
                  background: "linear-gradient(135deg, var(--matcha), var(--forest))",
                  color: "#fff", border: "none", cursor: "pointer",
                  fontSize: 16, fontWeight: 700, letterSpacing: "0.01em",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                Khám phá Menu <ArrowRight size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/booking")}
                style={{
                  padding: "15px 36px", borderRadius: 50,
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  color: "#fff", border: "1.5px solid rgba(255,255,255,0.45)",
                  cursor: "pointer", fontSize: 16, fontWeight: 700,
                }}
              >
                Đặt bàn ngay
              </motion.button>
            </motion.div>

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
          FEATURES SECTION
      ══════════════════════════════════════════════════ */}
      <section style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div
            variants={stagger} initial="hidden"
            whileInView="show" viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 64 }}>
              <span style={{ color: "var(--matcha)", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Triết lý của chúng tôi
              </span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, color: "var(--text)", margin: "12px 0 0", lineHeight: 1.1 }}>
                Nghệ thuật trong từng tách trà
              </h2>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28 }}>
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i} variants={fadeUp}
                  whileHover={{ y: -6 }}
                  style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: 24, padding: "36px 32px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    transition: "box-shadow 0.3s ease",
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: "linear-gradient(135deg, rgba(107,143,62,0.15), rgba(47,91,62,0.08))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 22, color: "var(--matcha)",
                  }}>
                    <f.icon size={26} strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "0 0 10px" }}>
                    {f.title}
                  </h3>
                  <p style={{ color: "var(--text-muted)", margin: 0, lineHeight: 1.65, fontSize: 15 }}>
                    {f.desc}
                  </p>
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
                  Signature Drinks
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
              {loading
                ? [1, 2, 3].map((k) => <SkeletonCard key={k} />)
                : bestSellers.map((item) => (
                    <FeaturedCard
                      key={item.id}
                      item={item}
                      onClick={() => navigate(`/menu/${item.id}`)}
                    />
                  ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          GALLERY SECTION
      ══════════════════════════════════════════════════ */}
      <section style={{ padding: "0 0 96px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto 40px", padding: "0 24px" }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span style={{ color: "var(--matcha)", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Không gian quán
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, color: "var(--text)", margin: "8px 0 0" }}>
              Zen trong từng góc nhỏ
            </h2>
          </motion.div>
        </div>

        {/* Horizontal scroll gallery */}
        <div className="scroll-gallery" style={{ padding: "0 24px" }}>
          {GALLERY.map((g, i) => (
            <motion.div
              key={i}
              className="scroll-gallery-item img-zoom-wrap"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              style={{
                width: "clamp(200px, 28vw, 300px)",
                height: g.h, borderRadius: 20, overflow: "hidden",
                position: "relative",
              }}
            >
              <img src={g.url} alt={g.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "40px 16px 16px",
                background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                color: "#fff", fontSize: 13, fontWeight: 600,
              }}>
                {g.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════ */}
      <section style={{
        padding: "96px 24px",
        background: "linear-gradient(135deg, var(--forest-dark) 0%, var(--forest) 100%)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(141,175,90,0.08)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.04)", filter: "blur(60px)" }} />

        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span style={{ color: "rgba(175,215,120,0.8)", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Khách hàng nói gì
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, color: "#fff", margin: "12px 0 48px" }}>
              Đánh giá từ những người thân
            </h2>
          </motion.div>

          {/* Testimonial card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              style={{
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 24, padding: "40px 48px",
              }}
            >
              <Quote size={32} style={{ color: "rgba(175,215,120,0.6)", marginBottom: 20 }} />
              <p style={{ fontSize: 18, color: "rgba(255,255,255,0.9)", lineHeight: 1.75, margin: "0 0 28px", fontStyle: "italic" }}>
                "{TESTIMONIALS[activeTestimonial].text}"
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: "#fff", fontWeight: 700, marginBottom: 2 }}>
                    {TESTIMONIALS[activeTestimonial].name}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                    {TESTIMONIALS[activeTestimonial].role}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 3 }}>
                  {[...Array(TESTIMONIALS[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 32 }}>
            {TESTIMONIALS.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                whileHover={{ scale: 1.3 }}
                style={{
                  width: i === activeTestimonial ? 24 : 8,
                  height: 8, borderRadius: 99, border: "none", cursor: "pointer",
                  background: i === activeTestimonial ? "rgba(175,215,120,0.9)" : "rgba(255,255,255,0.3)",
                  transition: "all 0.3s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════ */}
      <section style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{
              textAlign: "center",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 32, padding: "64px 48px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.08)",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* BG blob */}
            <div style={{
              position: "absolute", top: -60, right: -60,
              width: 200, height: 200, borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(107,143,62,0.12), rgba(47,91,62,0.06))",
              filter: "blur(40px)",
            }} />

            <Leaf size={40} style={{ color: "var(--matcha)", marginBottom: 20, strokeWidth: 1.5 }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, color: "var(--text)", margin: "0 0 16px" }}>
              Đặt bàn ngay hôm nay
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 17, lineHeight: 1.7, maxWidth: 500, margin: "0 auto 36px" }}>
              Chọn bàn theo sơ đồ tương tác, xem bàn trống theo khung giờ thực tế.
            </p>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/booking")}
              className="btn-primary"
              style={{ margin: "0 auto" }}
            >
              Đặt bàn ngay <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
