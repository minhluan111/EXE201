import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Coffee, MapPin, Clock, Phone, Mail, Heart, Share2, MessageCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

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
  const { user } = useAuth();
  const { tenant } = useTenant();
  const isComTam = tenant?.name?.toLowerCase().includes("cơm tấm") || tenant?.tenantName?.toLowerCase().includes("cơm tấm");
  const isSamHouse = tenant?.name?.toLowerCase().includes("sam house") || tenant?.tenantName?.toLowerCase().includes("samhouse");

  const brandName = tenant?.name || "Yakishime";
  const brandDesc = isComTam
    ? "Quán cơm tấm gia truyền với hương vị đậm đà, sườn nướng mật ong béo ngậy và các món bún thịt nướng truyền thống ngon miệng."
    : (isSamHouse 
        ? "Không gian học tập, làm việc yên tĩnh và hiện đại. Thưởng thức hương vị cà phê rang xay nguyên chất đậm đà, trà sữa và trà trái cây ngọt mát."
        : "Quán matcha cao cấp mang triết lý trà đạo Nhật Bản đến với Cần Thơ. Từng tách trà là một hành trình tĩnh tại và thiền định.");

  const textGreenLight = isComTam ? "rgba(244, 164, 96, 0.9)" : (isSamHouse ? "rgba(186, 175, 168, 0.9)" : "rgba(175, 215, 120, 0.9)");
  const borderGreen = isComTam ? "rgba(224, 123, 57, 0.12)" : (isSamHouse ? "rgba(139, 69, 19, 0.12)" : "rgba(141, 175, 90, 0.12)");
  const bgGlow1 = isComTam ? "rgba(224, 123, 57, 0.06)" : (isSamHouse ? "rgba(139, 69, 19, 0.06)" : "rgba(141, 175, 90, 0.06)");
  const bgGlow2 = isComTam ? "rgba(224, 123, 57, 0.04)" : (isSamHouse ? "rgba(139, 69, 19, 0.04)" : "rgba(107, 143, 62, 0.04)");
  const calligraphyColor = isComTam ? "rgba(224, 123, 57, 0.022)" : (isSamHouse ? "rgba(139, 69, 19, 0.022)" : "rgba(141, 175, 90, 0.022)");
  const borderSocial = isComTam ? "rgba(224, 123, 57, 0.15)" : (isSamHouse ? "rgba(139, 69, 19, 0.15)" : "rgba(141, 175, 90, 0.15)");
  const bgSocialHover = isComTam ? "rgba(224, 123, 57, 0.18)" : (isSamHouse ? "rgba(139, 69, 19, 0.18)" : "rgba(141, 175, 90, 0.18)");
  const textSocialHover = isComTam ? "rgba(244, 164, 96, 0.95)" : (isSamHouse ? "rgba(186, 175, 168, 0.95)" : "rgba(175, 215, 120, 0.95)");
  const borderSocialHover = isComTam ? "rgba(244, 164, 96, 0.4)" : (isSamHouse ? "rgba(139, 69, 19, 0.4)" : "rgba(175, 215, 120, 0.4)");
  const textLinkHover = isComTam ? "rgba(244, 164, 96, 0.95)" : (isSamHouse ? "rgba(139, 69, 19, 0.95)" : "rgba(175, 215, 120, 0.95)");
  const bgIconCircle = isComTam ? "rgba(224, 123, 57, 0.06)" : (isSamHouse ? "rgba(139, 69, 19, 0.06)" : "rgba(141, 175, 90, 0.06)");
  const textIconCircle = isComTam ? "rgba(244, 164, 96, 0.85)" : (isSamHouse ? "rgba(186, 175, 168, 0.85)" : "rgba(175, 215, 120, 0.85)");

  const infoItems = [
    { icon: MapPin, text: tenant?.address || "57 Nguyễn Cư Trinh,\nNinh Kiều, Cần Thơ" },
    { icon: Clock,  text: `Mở cửa: ${tenant?.openHours || "08:00 – 22:00"}\nMỗi ngày trong tuần` },
    { icon: Phone,  text: tenant?.hotline || "0909 123 456" },
    { icon: Mail,   text: tenant?.email || "hello@yakishime.vn" },
  ];

  return (
    <footer style={{
      background: isComTam
        ? "linear-gradient(to bottom, #1E0F05, #140A03)"
        : (isSamHouse 
            ? "linear-gradient(to bottom, #1C110C, #110B08)" 
            : "linear-gradient(to bottom, #0F1F12, #0A140C)"),
      color: "rgba(240, 237, 228, 0.7)",
      position: "relative", 
      overflow: "hidden",
      borderTop: `1px solid ${borderGreen}`
    }}>
      {/* Decorative blurry Zen rings */}
      <div style={{ position: "absolute", top: -100, right: -100, width: 350, height: 350, borderRadius: "50%", background: bgGlow1, filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: bgGlow2, filter: "blur(70px)", pointerEvents: "none" }} />

      {/* Ultra-Faint Japanese Calligraphy Watermark 'Cha' (Trà) or 'Com' (Cơm) */}
      <span style={{
        position: "absolute", bottom: -30, right: 30,
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 240, fontWeight: 800,
        color: calligraphyColor,
        lineHeight: 1, pointerEvents: "none", userSelect: "none"
      }}>
        {isComTam ? "飯" : (isSamHouse ? "☕" : "茶")}
      </span>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: 48, marginBottom: 64 }} className="footer-grid">
          
          {/* Column 1 – Brand Details */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              {isComTam 
                ? <span style={{ fontSize: 24 }}>🌾</span>
                : <Leaf size={24} style={{ color: textGreenLight, flexShrink: 0 }} />
              }
              <span style={{ 
                fontFamily: "'Cormorant Garamond', serif", 
                fontSize: 30, fontWeight: 700, color: "#fff",
                letterSpacing: "0.02em", textTransform: "capitalize"
              }}>
                {brandName}
              </span>
            </div>
            
            <p style={{ fontSize: 14.5, lineHeight: 1.8, maxWidth: 280, color: "rgba(240, 237, 228, 0.65)", marginBottom: 28 }}>
              {brandDesc}
            </p>
            
            {/* Social Icons */}
            <div style={{ display: "flex", gap: 12 }}>
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ y: -4, scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={label}
                  style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${borderSocial}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(240, 237, 228, 0.7)", transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.background = bgSocialHover; 
                    e.currentTarget.style.color = textSocialHover; 
                    e.currentTarget.style.borderColor = borderSocialHover;
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)"; 
                    e.currentTarget.style.color = "rgba(240, 237, 228, 0.7)"; 
                    e.currentTarget.style.borderColor = borderSocial;
                  }}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Columns 2 & 3 – Navigation Links */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 style={{ 
                color: textGreenLight, 
                fontSize: 13, fontWeight: 700, 
                letterSpacing: "0.15em", textTransform: "uppercase", 
                marginBottom: 24, borderBottom: `1px solid ${borderGreen}`,
                paddingBottom: 8
              }}>
                {heading}
              </h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {links.map((l) => (
                  <li key={l.to} style={{ marginBottom: 14 }}>
                    <RouterLink
                      to={l.to}
                      style={{ 
                        color: "rgba(240, 237, 228, 0.6)", 
                        textDecoration: "none", fontSize: 14.5, 
                        display: "inline-flex", alignItems: "center", gap: 6,
                        transition: "all 0.25s ease" 
                      }}
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.color = textLinkHover;
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.color = "rgba(240, 237, 228, 0.6)"; 
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <ArrowRight size={12} style={{ opacity: 0.6 }} />
                      {l.label}
                    </RouterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Column 4 – Shop Information */}
          <div>
            <h4 style={{ 
              color: textGreenLight, 
              fontSize: 13, fontWeight: 700, 
              letterSpacing: "0.15em", textTransform: "uppercase", 
              marginBottom: 24, borderBottom: `1px solid ${borderGreen}`,
              paddingBottom: 8
            }}>
              Thông Tin Liên Hệ
            </h4>
            {infoItems.map(({ icon: Icon, text }, idx) => (
              <div key={idx} style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: "flex-start" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: bgIconCircle,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: textIconCircle, flexShrink: 0, marginTop: 2
                }}>
                  <Icon size={14} />
                </div>
                <span style={{ fontSize: 13.5, lineHeight: 1.7, color: "rgba(240, 237, 228, 0.65)", whiteSpace: "pre-line" }}>
                  {text}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom copyright bar */}
        <div style={{
          borderTop: `1px solid ${borderGreen}`,
          paddingTop: 28,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 16,
        }}>
          <span style={{ fontSize: 13, color: "rgba(240, 237, 228, 0.4)" }}>
            © 2026 {brandName}. Mọi quyền được bảo lưu.
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {isComTam 
              ? <span style={{ fontSize: 14 }}>🌾</span>
              : (isSamHouse 
                  ? <Coffee size={14} style={{ color: "rgba(186,175,168,0.5)" }} />
                  : <Leaf size={14} style={{ color: "rgba(175,215,120,0.5)" }} />)
            }
            <span style={{ fontSize: 12, color: "rgba(240, 237, 228, 0.4)", fontFamily: "Inter, sans-serif" }}>
              {isComTam ? "Hương vị đậm đà chuẩn cơm mẹ nấu 🌾" : (isSamHouse ? "Crafted with Passion & Coffee in Dĩ An ☕" : "Crafted with Zen & Love in Cần Thơ 🍵")}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 36px !important; }
        }
        @media (max-width: 520px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
      `}</style>
    </footer>
  );
}
