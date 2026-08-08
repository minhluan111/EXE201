import { useState } from "react";
import { useTenant } from "../../context/TenantContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Check, ChevronUp } from "lucide-react";

const ALL_SHOPS = [
  { key: "taotao", label: "Táo Tào cà phê", desc: "Cà phê & Kem muối", emoji: "🍎", color: "#C86828" },
  { key: "emcoffee", label: "Em Coffee", desc: "Cà phê & Không gian", emoji: "☕", color: "#8B5A2B" },
  { key: "hoatearoom", label: "Hòa Tea Room", desc: "Trà sữa & Vẽ ly", emoji: "🍃", color: "#1E4620" },
  { key: "monquanchat", label: "Món Quảng Chất", desc: "Đặc sản Miền Trung", emoji: "🍲", color: "#8B1A1A" },
  { key: "samhouse", label: "Cafe Sam Houses", desc: "Không gian kết nối", emoji: "☕", color: "#8B4513" },
  { key: "comtam", label: "Cơm Tấm Ngọ", desc: "Cơm tấm truyền thống", emoji: "🌾", color: "#E07B39" },
  { key: "matcha", label: "Yakishime", desc: "Trà đạo & Matcha Zen", emoji: "🍵", color: "#2D6A4F" },
  { key: "hanhuyen", label: "Quán Nước Hàn Huyên", desc: "Không gian yên bình", emoji: "☕", color: "#618269" },
  { key: "cochin", label: "Cochin Café", desc: "Nhà kính & Bistro", emoji: "🌿", color: "#2A5944" },
];

export default function DevTenantSwitcher() {
  const isLocal = import.meta.env.DEV && typeof window !== "undefined" && (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );

  const { tenant, switchTenant } = useTenant();
  const [open, setOpen] = useState(false);

  if (!isLocal) return null;

  const currentName = tenant?.name || "";
  const currentKey = ALL_SHOPS.find(s => 
    currentName.toLowerCase().includes(s.label.toLowerCase()) || 
    (tenant?.tenantName && tenant.tenantName.toLowerCase().includes(s.key))
  )?.key || (currentName.toLowerCase().includes("em") ? "emcoffee" : "matcha");

  const currentShop = ALL_SHOPS.find(s => s.key === currentKey) || ALL_SHOPS[0];

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      left: 20,
      zIndex: 99999,
      fontFamily: "Inter, sans-serif",
    }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              marginBottom: 10,
              background: "rgba(22, 22, 24, 0.94)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 18,
              padding: "10px",
              boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
              width: 250,
            }}
          >
            <div style={{
              padding: "4px 8px 8px",
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(255,255,255,0.45)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span>Chuyển Quán (Local Dev)</span>
              <span style={{ fontSize: 10, color: "#10B981" }}>● Live</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {ALL_SHOPS.map((shop) => {
                const isSelected = currentKey === shop.key;
                return (
                  <button
                    key={shop.key}
                    onClick={() => {
                      if (switchTenant) {
                        switchTenant(shop.key);
                      }
                      setOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: isSelected ? `1px solid ${shop.color}88` : "1px solid transparent",
                      background: isSelected ? `${shop.color}26` : "transparent",
                      color: isSelected ? "#ffffff" : "rgba(255,255,255,0.75)",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{shop.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: "#ffffff" }}>
                        {shop.label}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {shop.desc}
                      </div>
                    </div>
                    {isSelected && <Check size={14} style={{ color: "#10B981" }} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px 8px 10px",
          background: "rgba(24, 24, 28, 0.9)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 50,
          color: "#ffffff",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          fontSize: 13,
          fontWeight: 600,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
        }}
      >
        <span style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: `${currentShop.color}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
        }}>
          {currentShop.emoji}
        </span>
        <span>{currentShop.label}</span>
        <ChevronUp size={14} style={{
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
          opacity: 0.7,
        }} />
      </button>
    </div>
  );
}
