import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, MapPin, Clock, Phone, Mail, Heart, Share2, MessageCircle } from "lucide-react";

const LINKS = {
  "Khám phá": [
    { label: "Trang chủ",   to: "/" },
    { label: "Menu",        to: "/menu" },
    { label: "Đặt bàn",     to: "/booking" },
    { label: "Liên hệ",     to: "/contact" },
  ],
  "Tài khoản": [
    { label: "Đăng nhập",   to: "/login" },
    { label: "Đăng ký",     to: "/register" },
    { label: "Hồ sơ",       to: "/profile" },
    { label: "Lịch sử đặt", to: "/booking/history" },
  ],
};

const SOCIALS = [
  { icon: Heart,         label: "Instagram", href: "#" },
  { icon: Share2,        label: "Facebook",  href: "#" },
  { icon: MessageCircle, label: "Twitter",   href: "#" },
];

export default function Footer() {
  return (
    <footer style={{
      background: "var(--forest-dark)",
      color: "rgba(255,255,255,0.75)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Orbs */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(141,175,90,0.07)", filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.03)", filter: "blur(60px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 24px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: 48, marginBottom: 56 }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Leaf size={22} style={{ color: "rgba(175,215,120,0.85)" }} />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: "#fff" }}>
                yakishime
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.8, maxWidth: 260, marginBottom: 24 }}>
              Quán matcha cao cấp mang triết lý trà đạo Nhật Bản đến với Cần Thơ.
              Từng tách trà là một hành trình thiền định.
            </p>
            {/* Socials */}
            <div style={{ display: "flex", gap: 10 }}>
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ y: -4, scale: 1.1 }}
                  aria-label={label}
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.7)", transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(141,175,90,0.2)"; e.currentTarget.style.color = "rgba(175,215,120,0.9)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Nav links */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 style={{ color: "rgba(175,215,120,0.85)", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>
                {heading}
              </h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {links.map((l) => (
                  <li key={l.to} style={{ marginBottom: 12 }}>
                    <RouterLink
                      to={l.to}
                      style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(175,215,120,0.9)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
                    >
                      {l.label}
                    </RouterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 style={{ color: "rgba(175,215,120,0.85)", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>
              Thông tin
            </h4>
            {[
              { icon: MapPin, text: "57 Nguyễn Cư Trinh,\nNinh Kiều, Cần Thơ" },
              { icon: Clock,  text: "Mở cửa: 08:00 – 22:00\nMỗi ngày trong tuần" },
              { icon: Phone,  text: "0909 123 456" },
              { icon: Mail,   text: "hello@yakishime.vn" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
                <Icon size={15} style={{ color: "rgba(175,215,120,0.7)", marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.65)", whiteSpace: "pre-line" }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 24,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12,
        }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            © 2026 Yakishime Matcha. Mọi quyền được bảo lưu.
          </span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Leaf size={13} style={{ color: "rgba(175,215,120,0.5)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
              Crafted with love in Cần Thơ 🍵
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 520px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
