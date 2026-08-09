import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { menuList } from "../services/apiClient.js";
import MenuCard from "../components/menu/MenuCard.jsx";
import QuickViewModal from "../components/menu/QuickViewModal.jsx";
import { useTenant } from "@/context/TenantContext";

const MATCHA_CATEGORIES = [
  { key: "all",        label: "Tất cả",      emoji: "🍵" },
  { key: "Combo",      label: "Combo ưu đãi", emoji: "🎁" },
  { key: "Traditional",label: "Truyền thống", emoji: "🍵" },
  { key: "Latte",      label: "Latte",        emoji: "🥛" },
  { key: "Hojicha",    label: "Hojicha",      emoji: "🍂" },
  { key: "Desserts",   label: "Tráng miệng",  emoji: "🍰" },
  { key: "Food",       label: "Món ăn",       emoji: "🍡" },
];

const TAOTAO_CATEGORIES = [
  { key: "all",        label: "Tất cả",               emoji: "🍎" },
  { key: "Traditional",label: "Cà Phê & Kem Muối",    emoji: "☕" },
  { key: "Latte",      label: "Trà Sữa & Kem Phô Mai", emoji: "🧀" },
  { key: "Desserts",   label: "Tráng Miệng",          emoji: "🍰" },
];

const EM_COFFEE_CATEGORIES = [
  { key: "all",        label: "Tất cả",              emoji: "☕" },
  { key: "Coffee",     label: "Cà Phê Phin & Phindi", emoji: "☕" },
  { key: "FruitTea",   label: "Trà Hoa & Trái Cây",   emoji: "🍃" },
  { key: "Latte",      label: "Cacao & Sữa Tươi",     emoji: "🥛" },
];

const HAN_HUYEN_CATEGORIES = [
  { key: "all",        label: "Tất cả",          emoji: "☕" },
  { key: "Coffee",     label: "Phê Truyền Thống", emoji: "☕" },
  { key: "FruitTea",   label: "Trà Thanh Mát",    emoji: "🍃" },
  { key: "Latte",      label: "Đặc Biệt",        emoji: "✨" },
];

const COCHIN_CATEGORIES = [
  { key: "all",        label: "Tất cả",             emoji: "🌿" },
  { key: "MilkTea",    label: "Trà Sữa Ô Long",     emoji: "🧋" },
  { key: "Coffee",     label: "Cà Phê & Latte",     emoji: "☕" },
  { key: "FruitTea",   label: "Trà Hoa Nhiệt Đới",  emoji: "🍹" },
  { key: "Drink",      label: "Thức Uống Khác",     emoji: "🍫" },
];

const COM_TAM_CATEGORIES = [
  { key: "all",        label: "Tất cả",      emoji: "🌾" },
  { key: "Combo",      label: "Combo ưu đãi", emoji: "🎁" },
  { key: "MainCourse", label: "Món chính",    emoji: "🍚" },
  { key: "Drink",      label: "Đồ uống",      emoji: "🥤" },
];

const SAM_HOUSE_CATEGORIES = [
  { key: "all",        label: "Tất cả",       emoji: "☕" },
  { key: "Combo",      label: "Combo ưu đãi", emoji: "🎁" },
  { key: "Coffee",     label: "Cà phê",       emoji: "☕" },
  { key: "MilkTea",    label: "Trà sữa",      emoji: "🧋" },
  { key: "FruitTea",   label: "Trà trái cây", emoji: "🍹" },
  { key: "Other",      label: "Khác",         emoji: "✨" },
];

const HOA_TEA_ROOM_CATEGORIES = [
  { key: "all",           label: "Tất cả",            emoji: "🍵" },
  { key: "Combo",         label: "Combo ưu đãi",       emoji: "🎁" },
  { key: "MatchaSpecial", label: "Matcha Đặc Sản",     emoji: "✨" },
  { key: "MatchaClassic", label: "Matcha Truyền Thống", emoji: "🍃" },
  { key: "MilkTea",       label: "Trà Sữa & Set Quà",  emoji: "🎁" },
  { key: "Experiences",   label: "Trải nghiệm",       emoji: "🎨" },
];

const MONARI_CATEGORIES = [
  { key: "all",        label: "Tất cả",                  emoji: "🥮" },
  { key: "Combo",      label: "Bánh Trung Thu & Quà Tặng", emoji: "🎁" },
  { key: "Drink",      label: "Trà & Thức Uống",         emoji: "🥥" },
  { key: "Dessert",    label: "Bánh Ngọt",                emoji: "🍰" },
];

const COM_GA_CATEGORIES = [
  { key: "all",        label: "Tất cả",      emoji: "🍗" },
  { key: "Combo",      label: "Combo ưu đãi", emoji: "🎁" },
  { key: "MainCourse", label: "Món ăn",       emoji: "🍚" },
  { key: "Drink",      label: "Nước uống",    emoji: "🥤" },
];

const TAGS = [
  { key: "all",        label: "Tất cả" },
  { key: "best_seller",label: "Bán chạy nhất" },
  { key: "trending",   label: "Xu hướng" },
  { key: "new",        label: "Món mới" },
];

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

export default function MenuPage() {
  const navigate = useNavigate();
  const tabBarRef = useRef(null);
  const { tenant } = useTenant();
  const rawName = String(tenant?.name || "").toLowerCase();
  const tName = String(tenant?.tenantName || "").toLowerCase();

  const isTaoTao = rawName.includes("taotao") || rawName.includes("táo tào") || tName.includes("taotao");
  const isMonari = rawName.includes("monari") || tName.includes("monari");
  const isComGa = rawName.includes("cơm gà") || rawName.includes("ông bách") || tName.includes("comga");
  const isEmCoffee = rawName.includes("em coffee") || rawName.includes("em") || tName.includes("em");
  const isHanHuyen = rawName.includes("hàn huyên") || tName.includes("hanhuyen");
  const isCochin = rawName.includes("cochin") || tName.includes("cochin");
  const isComTam = rawName.includes("cơm tấm") || tName.includes("comtam");
  const isSamHouse = rawName.includes("sam house") || tName.includes("samhouse");
  const isMonQuanChat = rawName.includes("quảng") || tName.includes("monquanchat");
  const isHoaTeaRoom = rawName.includes("hoa") || rawName.includes("hoà") || rawName.includes("hòa") || tName.includes("hoatearoom");

  const CATEGORIES = isTaoTao ? TAOTAO_CATEGORIES :
    isMonari ? MONARI_CATEGORIES :
    isComGa ? COM_GA_CATEGORIES :
    isEmCoffee ? EM_COFFEE_CATEGORIES :
    isHanHuyen ? HAN_HUYEN_CATEGORIES :
    isCochin ? COCHIN_CATEGORIES :
    (isComTam || isMonQuanChat) ? COM_TAM_CATEGORIES :
    isSamHouse ? SAM_HOUSE_CATEGORIES :
    isHoaTeaRoom ? HOA_TEA_ROOM_CATEGORIES :
    MATCHA_CATEGORIES;

  const [q, setQ]               = useState("");
  const [category, setCategory] = useState("all");
  const [tag, setTag]           = useState("all");
  const [loading, setLoading]   = useState(true);
  const [items, setItems]       = useState([]);
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [tabSticky, setTabSticky]         = useState(false);
  const [availableCategoryKeys, setAvailableCategoryKeys] = useState([]);

  useEffect(() => {
    setLoading(true);
    menuList({ q, category, tag })
      .then((res) => {
        if (res && res.ok) {
          setItems(res.data || []);
          if (category === "all" && !q && tag === "all") {
            const keys = Array.from(new Set((res.data || []).map((item) => item.category)));
            setAvailableCategoryKeys(keys);
          }
        } else {
          setItems([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load menu list:", err);
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [q, category, tag, tenant]);

  const visibleCategories = useMemo(() => {
    if (availableCategoryKeys.length === 0) return CATEGORIES;
    return CATEGORIES.filter((cat) => cat.key === "all" || cat.key === "Combo" || availableCategoryKeys.includes(cat.key) || availableCategoryKeys.includes(cat.key + "s"));
  }, [CATEGORIES, availableCategoryKeys]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setTabSticky(!entry.isIntersecting),
      { rootMargin: "-70px 0px 0px 0px", threshold: 0 },
    );
    if (tabBarRef.current) observer.observe(tabBarRef.current);
    return () => observer.disconnect();
  }, []);

  const heroBg = isTaoTao ? "url('/assets/taotao/decor/hero.jpg')" :
    isMonari ? "url('/assets/monari/decor/space_main.jpg')" :
    isComGa ? "url('/assets/comgaongbach/decor/space_main.jpg')" :
    isEmCoffee ? "url('/assets/emcoffee/decor/hero.jpg')" :
    isHanHuyen ? "url('/assets/hanhuyen/Ảnh bìa.jpg')" :
    isCochin ? "url('/assets/cochin/Ảnh bìa.jpg')" :
    isComTam ? "url('/assets/comtamno/hero.jpg')" :
    isSamHouse ? "url('/assets/samhouse/decor/hero_bg.jpg')" :
    isMonQuanChat ? "url('/assets/monquanchat/decor/hero_bg.jpg')" :
    isHoaTeaRoom ? "url('/assets/hoatearoom/decor/hero_bg.jpg')" :
    "url('https://images.unsplash.com/photo-1582793988951-9aed5509eb97?w=1400&q=80')";

  const menuDesc = isTaoTao ? "Cà phê Robusta thơm đậm kết hợp kem muối sánh ngậy béo mặn, cùng các loại trà phô mai béo dẻo và chanh leo dừa non thanh mát." :
    isMonari ? "Từng chiếc bánh trung thu và ly trà được chế biến thủ công tỉ mỉ — nguyên liệu hảo hạng, hương vị ngọt thanh và trọn vẹn." :
    isComGa ? "Thưởng thức cơm gà luộc da vàng giòn ngọt thịt, gà quay gia truyền đậm đà, trứng ngâm tương lòng đào béo ngậy cùng nước sâm bí đao thanh mát." :
    isEmCoffee ? "Thưởng thức Phindi hạnh nhân béo bùi, Trà vải atiso đỏ thanh nhiệt và các món cà phê rang mộc nguyên chất tinh tế." :
    isHanHuyen ? "Những ly Phê xỉu ba tầng ngọt béo, Phê đá đậm vị và trà đào xanh nhài mang đậm dư vị hoài niệm bình yên." :
    isCochin ? "Hương vị trà sữa ô long rang khói đặc trưng, Caffe Latte chuẩn Ý và các thức uống trà hoa nhiệt đới tao nhã." :
    isComTam ? "Từng đĩa cơm sườn, bát bún thịt nướng được tẩm ướp đậm đà — sườn nướng than hồng mật ong thơm ngon trọn vị." :
    isSamHouse ? "Khám phá hương vị cà phê rang xay nguyên chất đậm vị, cùng các loại trà sữa và trà xoài Macchiato thơm mát đặc biệt." :
    isMonQuanChat ? "Thưởng thức mỳ Quảng tôm thịt đậm đà, Cao lầu Hội An chuẩn vị và bánh tráng cuốn thịt heo ba chỉ ngọt thơm chuẩn vị xứ Quảng." :
    isHoaTeaRoom ? "Thưởng thức các hương vị trà sữa lài Mia thơm ngát, matcha dừa xiêm béo ngậy và trải nghiệm vẽ ly gốm thư giãn." :
    "Từng món được chọn lọc cẩn thận — nguyên liệu thuần khiết từ Uji, hương vị tinh tế theo triết lý Zen.";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <AnimatePresence>
        {quickViewItem && (
          <QuickViewModal item={quickViewItem} onClose={() => setQuickViewItem(null)} />
        )}
      </AnimatePresence>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: heroBg,
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.35)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(15,15,20,0.6), rgba(15,15,20,0.9))"
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "100px 24px 80px" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(48px, 7vw, 80px)", fontWeight: 700,
              color: "#fff", margin: "10px 0 16px", lineHeight: 1.0,
            }}>
              Thực Đơn
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 18, maxWidth: 600, lineHeight: 1.7 }}>
              {menuDesc}
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
          <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 0", scrollbarWidth: "none" }}>
            {visibleCategories.map((cat) => (
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
                  boxShadow: category === cat.key ? "0 4px 16px rgba(0,0,0,0.2)" : "none",
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
        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
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
          </div>

          <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
            {TAGS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTag(t.key)}
                style={{
                  padding: "8px 16px", borderRadius: 50,
                  border: "1px solid",
                  borderColor: tag === t.key ? "var(--matcha)" : "var(--border)",
                  background: tag === t.key ? "var(--matcha)" : "transparent",
                  color: tag === t.key ? "#fff" : "var(--text-muted)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
            <p style={{ fontSize: 44, margin: "0 0 12px" }}>☕</p>
            <p style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", margin: "0 0 6px" }}>Không tìm thấy món phù hợp</p>
            <p style={{ fontSize: 14, margin: 0 }}>Vui lòng thử từ khóa khác hoặc chọn danh mục khác.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {items.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onQuickView={() => setQuickViewItem(item)}
                onClick={() => navigate(`/menu/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
