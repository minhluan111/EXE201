import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { menuList } from "../services/mockApi.js";
import MenuCard from "../components/menu/MenuCard.jsx";
import QuickViewModal from "../components/menu/QuickViewModal.jsx";

const CATEGORIES = [
  { key: "all",        label: "Tất cả",     emoji: "🍵" },
  { key: "Traditional",label: "Traditional", emoji: "🎋" },
  { key: "Latte",      label: "Latte",       emoji: "☕" },
  { key: "Hojicha",    label: "Hojicha",     emoji: "🍂" },
  { key: "Desserts",   label: "Desserts",    emoji: "🍡" },
  { key: "Food",       label: "Food",        emoji: "🍙" },
];

const TAGS = [
  { key: "all",        label: "Tất cả" },
  { key: "best_seller",label: "Best Seller" },
  { key: "signature",  label: "Signature" },
  { key: "trending",   label: "Trending" },
];

// ── Skeleton grid ────────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
      {[...Array(6)].map((_, k) => (
        <div key={k} style={{ borderRadius: 20, overflow: "hidden", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="skeleton" style={{ height: 220 }} />
          <div style={{ padding: 20 }}>
            <div className="skeleton" style={{ height: 22, width: "65%", marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 13, width: "90%", marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 13, width: "55%", marginBottom: 18 }} />
            <div className="skeleton" style={{ height: 28, width: "40%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════
export default function MenuPage() {
  const navigate = useNavigate();
  const tabBarRef = useRef(null);

  const [q, setQ]               = useState("");
  const [category, setCategory] = useState("all");
  const [tag, setTag]           = useState("all");
  const [loading, setLoading]   = useState(true);
  const [items, setItems]       = useState([]);
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [tabSticky, setTabSticky]         = useState(false);

  // Fetch
  useEffect(() => {
    setLoading(true);
    menuList({ q, category, tag }).then((res) => {
      setItems(res.ok ? res.data : []);
      setLoading(false);
    });
  }, [q, category, tag]);

  // Sticky tabs detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setTabSticky(!entry.isIntersecting),
      { rootMargin: "-70px 0px 0px 0px", threshold: 0 },
    );
    if (tabBarRef.current) observer.observe(tabBarRef.current);
    return () => observer.disconnect();
  }, []);

  const hasFilters = q || category !== "all" || tag !== "all";
  const clearFilters = () => { setQ(""); setCategory("all"); setTag("all"); };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewItem && (
          <QuickViewModal item={quickViewItem} onClose={() => setQuickViewItem(null)} />
        )}
      </AnimatePresence>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1582793988951-9aed5509eb97?w=1400&q=80')",
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.35)",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(15,31,18,0.6), rgba(15,31,18,0.9))" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "100px 24px 80px" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span style={{ color: "rgba(175,215,120,0.8)", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Thực đơn
            </span>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(48px, 7vw, 80px)", fontWeight: 700,
              color: "#fff", margin: "10px 0 16px", lineHeight: 1.0,
            }}>
              Our Menu
            </h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 18, maxWidth: 540, lineHeight: 1.7 }}>
              Từng món được chọn lọc cẩn thận — nguyên liệu thuần khiết,<br />hương vị tinh tế theo triết lý Zen.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── STICKY TAB BAR ──────────────────────────────────── */}
      <div ref={tabBarRef} />
      <div style={{
        position: "sticky", top: 68, zIndex: 100,
        background: tabSticky ? "var(--glass-bg)" : "var(--bg)",
        backdropFilter: tabSticky ? "blur(20px)" : "none",
        borderBottom: "1px solid var(--border)",
        boxShadow: tabSticky ? "0 4px 20px rgba(0,0,0,0.08)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", gap: 4, overflowX: "auto", padding: "12px 0", scrollbarWidth: "none" }}>
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat.key}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(cat.key)}
                style={{
                  flexShrink: 0,
                  padding: "9px 20px", borderRadius: 50,
                  border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                  background: category === cat.key
                    ? "linear-gradient(135deg, var(--matcha), var(--forest))"
                    : "var(--bg-alt)",
                  color: category === cat.key ? "#fff" : "var(--text-muted)",
                  boxShadow: category === cat.key ? "0 4px 16px rgba(107,143,62,0.35)" : "none",
                  transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* Search + Tag filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search input */}
          <div style={{ position: "relative", flex: "1 1 260px", minWidth: 220 }}>
            <Search size={16} style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              color: "var(--text-muted)", pointerEvents: "none",
            }} />
            <input
              type="text"
              placeholder="Tìm món..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{
                width: "100%", padding: "11px 14px 11px 40px",
                borderRadius: 50, border: "1px solid var(--border)",
                background: "var(--bg-card)", color: "var(--text)",
                fontSize: 14, outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--matcha)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
            />
            {q && (
              <button onClick={() => setQ("")} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "transparent", border: "none", cursor: "pointer",
                color: "var(--text-muted)", display: "flex",
              }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Tag filter */}
          <div style={{ display: "flex", gap: 6 }}>
            {TAGS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTag(t.key)}
                style={{
                  padding: "10px 18px", borderRadius: 50, fontSize: 13,
                  fontWeight: 600, border: "1px solid",
                  borderColor: tag === t.key ? "var(--matcha)" : "var(--border)",
                  background: tag === t.key ? "rgba(107,143,62,0.1)" : "transparent",
                  color: tag === t.key ? "var(--matcha)" : "var(--text-muted)",
                  cursor: "pointer", transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Clear */}
          {hasFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={clearFilters}
              style={{
                padding: "10px 18px", borderRadius: 50, fontSize: 13,
                fontWeight: 600, border: "1px solid rgba(239,68,68,0.3)",
                background: "rgba(239,68,68,0.06)", color: "#EF4444",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <X size={13} /> Xóa bộ lọc
            </motion.button>
          )}
        </div>

        {/* Item count */}
        {!loading && (
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
            <span style={{ fontWeight: 700, color: "var(--matcha)" }}>{items.length}</span> món được tìm thấy
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <SkeletonGrid />
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "96px 0" }}
          >
            <div style={{ fontSize: 64, marginBottom: 20 }}>🍵</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
              Không tìm thấy món nào
            </h3>
            <p style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: 16 }}>
              Thử điều chỉnh bộ lọc hoặc tìm kiếm khác.
            </p>
            <button
              onClick={clearFilters}
              style={{
                padding: "12px 28px", borderRadius: 50,
                background: "linear-gradient(135deg, var(--matcha), var(--forest))",
                color: "#fff", border: "none", cursor: "pointer",
                fontSize: 15, fontWeight: 700,
              }}
            >
              Xem tất cả món
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={category + tag + q}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
            initial="hidden" animate="show"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}
          >
            {items.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onQuickView={(item) => setQuickViewItem(item)}
                onClick={() => navigate(`/menu/${item.id}`)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
