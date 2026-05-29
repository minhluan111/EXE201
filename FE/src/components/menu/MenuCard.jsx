import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Eye } from "lucide-react";

const BADGE_MAP = {
  best_seller: { label: "⭐ Best Seller", style: { background: "linear-gradient(135deg,#F59E0B,#EF4444)", color: "#fff" } },
  signature:   { label: "✦ Signature",   style: { background: "linear-gradient(135deg,#6B8F3E,#2F5B3E)", color: "#fff" } },
  trending:    { label: "🔥 Trending",    style: { background: "linear-gradient(135deg,#EF4444,#EC4899)", color: "#fff" } },
  new:         { label: "✨ New",         style: { background: "#3B82F6", color: "#fff" } },
};

export default function MenuCard({ item, onQuickView, onClick }) {
  const [hovered, setHovered] = useState(false);
  const badge = BADGE_MAP[item.tag];

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: hovered ? "0 20px 60px rgba(0,0,0,0.14)" : "0 4px 16px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "box-shadow 0.35s ease, transform 0.35s ease",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
        <img
          src={item.image_url}
          alt={item.name}
          loading="lazy"
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: hovered ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.5s ease",
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 55%)",
        }} />

        {/* Badge */}
        {badge && (
          <span style={{
            position: "absolute", top: 14, left: 14,
            padding: "4px 12px", borderRadius: 50,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
            ...badge.style,
          }}>
            {badge.label}
          </span>
        )}

        {/* Quick View button */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => { e.stopPropagation(); onQuickView?.(item); }}
          style={{
            position: "absolute", bottom: 14, right: 14,
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 50,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
            border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 700, color: "#1C1C1A",
          }}
        >
          <Eye size={13} /> Xem nhanh
        </motion.button>
      </div>

      {/* Content */}
      <div style={{ padding: "18px 20px" }}>
        {/* Name + Rating row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 20, fontWeight: 700,
            color: "var(--text)", margin: 0, lineHeight: 1.2, flex: 1,
          }}>
            {item.name}
          </h3>
          {item.avg_rating > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0, marginTop: 2 }}>
              <Star size={13} fill="#F59E0B" color="#F59E0B" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                {item.avg_rating}
              </span>
            </div>
          )}
        </div>

        {/* Category */}
        <span style={{
          display: "inline-block", padding: "2px 10px", borderRadius: 50,
          background: "var(--bg-alt)", color: "var(--text-muted)",
          fontSize: 11, fontWeight: 600, marginBottom: 10,
        }}>
          {item.category}
        </span>

        {/* Description */}
        <p style={{
          fontSize: 13, color: "var(--text-muted)", margin: "0 0 16px", lineHeight: 1.55,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {item.description}
        </p>

        {/* Ingredients */}
        {item.ingredients?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
            {item.ingredients.slice(0, 3).map((ing, i) => (
              <span key={i} style={{
                padding: "2px 8px", borderRadius: 50,
                border: "1px solid var(--border)",
                fontSize: 11, color: "var(--text-muted)",
              }}>
                {ing}
              </span>
            ))}
            {item.ingredients.length > 3 && (
              <span style={{ fontSize: 11, color: "var(--text-light)" }}>
                +{item.ingredients.length - 3} nữa
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 24, fontWeight: 700, color: "var(--matcha)",
          }}>
            {item.price.toLocaleString("vi-VN")}₫
          </span>
          <span style={{
            fontSize: 12, color: "var(--matcha)", fontWeight: 600,
            opacity: hovered ? 1 : 0.6, transition: "opacity 0.2s",
          }}>
            Chi tiết →
          </span>
        </div>
      </div>
    </motion.div>
  );
}
