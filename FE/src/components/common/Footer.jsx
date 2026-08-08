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
  const isMonari = tenant?.name?.toLowerCase().includes("monari") || tenant?.tenantName?.toLowerCase().includes("monari");
  const isComTam = tenant?.name?.toLowerCase().includes("cơm tấm") || tenant?.tenantName?.toLowerCase().includes("cơm tấm");
  const isSamHouse = tenant?.name?.toLowerCase().includes("sam house") || tenant?.tenantName?.toLowerCase().includes("samhouse");
  const isMonQuanChat = tenant?.name?.toLowerCase().includes("quảng") || tenant?.tenantName?.toLowerCase().includes("monquanchat") || tenant?.tenantName?.toLowerCase().includes("monquangchat");
  const isHoaTeaRoom = tenant?.name?.toLowerCase().includes("hoa") || tenant?.name?.toLowerCase().includes("hoà") || tenant?.name?.toLowerCase().includes("hòa") || tenant?.tenantName?.toLowerCase().includes("hoa");
  const isEmCoffee = tenant?.name?.toLowerCase().includes("em coffee") || tenant?.name?.toLowerCase() === "em" || tenant?.tenantName?.toLowerCase().includes("emcoffee");
  const isTaoTao = tenant?.name?.toLowerCase().includes("táo") || tenant?.name?.toLowerCase().includes("taotao") || String(tenant?.tenantName).toLowerCase().includes("taotao");
  const isHanHuyen = tenant?.name?.toLowerCase().includes("hàn") || tenant?.tenantName?.toLowerCase().includes("hanhuyen") || String(tenant?.domain).toLowerCase().includes("hanhuyen");
  const isCochin = tenant?.name?.toLowerCase().includes("cochin") || tenant?.tenantName?.toLowerCase().includes("cochin") || String(tenant?.tenantName).toLowerCase().includes("cochin") || String(tenant?.domain).toLowerCase().includes("cochin") || localStorage.getItem("tenant_is_cochin") === "true";

  const brandName = tenant?.name || (isMonari ? "MONARI" : (isCochin ? "Cochin Café" : (isHanHuyen ? "Quán Nước Hàn Huyên" : "Yakishime")));
  const brandDesc = isMonari
    ? "Tiệm bánh ngọt thủ công & trà thơm cao cấp tại TP. Hồ Chí Minh. Thưởng thức hương vị bánh trung thu tinh tuyển, trà lựu đỏ và nước dừa quế hoa trong không gian trang nhã, ấm cúng."
    : (isComTam
    ? "Quán cơm tấm gia truyền với hương vị đậm đà, sườn nướng mật ong béo ngậy và các món bún thịt nướng truyền thống ngon miệng."
    : (isSamHouse 
        ? "Không gian học tập, làm việc yên tĩnh và hiện đại. Thưởng thức hương vị cà phê rang xay nguyên chất đậm đà, trà sữa và trà trái cây ngọt mát."
        : (isMonQuanChat
            ? "Quán ăn món Quảng gia truyền với hương vị đậm đà, mộc mạc chuẩn vị miền Trung: Mỳ Quảng, Cao lầu, Bánh xèo, Bánh tráng cuốn thịt heo."
            : (isHoaTeaRoom
                ? "Không gian thưởng trà thanh tịnh, trà bắp ASA thơm ngon béo ngậy cùng các trải nghiệm tô vẽ ly gốm đầy thú vị."
                : (isEmCoffee
                    ? "Không gian cà phê acoustic ấm cúng, thư giãn và yên tĩnh. Thưởng thức cà phê phindi béo ngậy, trà hoa atiso thanh mát và làm việc hiệu quả."
                    : (isTaoTao
                        ? "Không gian mang đậm chất retro, hoài cổ với sắc đỏ trầm ấm. Cà phê kem muối đặc trưng cùng trà đạo đậm vị."
                        : (isHanHuyen
                            ? "Không gian quán nước Hàn Huyên mộc mạc và an yên giữa lòng Cần Thơ. Thưởng thức trà đào xanh nhài thanh mát, cà phê phin đậm đà cùng góc ngồi làm việc, đọc sách lý tưởng."
                            : (isCochin
                                ? "Không gian nhà kính Bistro phong cách châu Âu ngập tràn ánh sáng tại Vinhomes Grand Park. Thưởng thức hương vị Latte nghệ thuật, Sô cô la và Trà trái cây thơm lành."
                                : "Quán matcha cao cấp mang triết lý trà đạo Nhật Bản đến với Cần Thơ. Từng tách trà là một hành trình tĩnh tại và thiền định."))))))));

  const textGreenLight = isMonari ? "rgba(232, 146, 124, 0.95)" : (isComTam ? "rgba(244, 164, 96, 0.9)" : (isSamHouse ? "rgba(186, 175, 168, 0.9)" : (isMonQuanChat ? "rgba(224, 150, 150, 0.9)" : (isHoaTeaRoom ? "rgba(108, 191, 122, 0.9)" : (isEmCoffee ? "rgba(230, 175, 120, 0.9)" : (isTaoTao ? "rgba(217, 83, 79, 0.9)" : (isHanHuyen ? "rgba(122, 157, 131, 0.95)" : (isCochin ? "rgba(163, 223, 181, 0.95)" : "rgba(175, 215, 120, 0.9)"))))))));
  const borderGreen = isMonari ? "rgba(200, 109, 81, 0.15)" : (isComTam ? "rgba(224, 123, 57, 0.12)" : (isSamHouse ? "rgba(139, 69, 19, 0.12)" : (isMonQuanChat ? "rgba(139, 26, 26, 0.12)" : (isHoaTeaRoom ? "rgba(46, 111, 64, 0.12)" : (isEmCoffee ? "rgba(139, 90, 43, 0.12)" : (isTaoTao ? "rgba(155, 46, 34, 0.12)" : (isHanHuyen ? "rgba(97, 130, 105, 0.18)" : (isCochin ? "rgba(42, 89, 68, 0.25)" : "rgba(141, 175, 90, 0.12)"))))))));
  const bgGlow1 = isMonari ? "rgba(200, 109, 81, 0.08)" : (isComTam ? "rgba(224, 123, 57, 0.06)" : (isSamHouse ? "rgba(139, 69, 19, 0.06)" : (isMonQuanChat ? "rgba(139, 26, 26, 0.06)" : (isHoaTeaRoom ? "rgba(46, 111, 64, 0.06)" : (isEmCoffee ? "rgba(139, 90, 43, 0.06)" : (isTaoTao ? "rgba(155, 46, 34, 0.06)" : (isHanHuyen ? "rgba(97, 130, 105, 0.08)" : (isCochin ? "rgba(42, 89, 68, 0.1)" : "rgba(141, 175, 90, 0.06)"))))))));
  const bgGlow2 = isMonari ? "rgba(200, 109, 81, 0.05)" : (isComTam ? "rgba(224, 123, 57, 0.04)" : (isSamHouse ? "rgba(139, 69, 19, 0.04)" : (isMonQuanChat ? "rgba(139, 26, 26, 0.04)" : (isHoaTeaRoom ? "rgba(46, 111, 64, 0.04)" : (isEmCoffee ? "rgba(139, 90, 43, 0.04)" : (isTaoTao ? "rgba(155, 46, 34, 0.04)" : (isHanHuyen ? "rgba(97, 130, 105, 0.05)" : (isCochin ? "rgba(200, 138, 62, 0.06)" : "rgba(107, 143, 62, 0.04)"))))))));
  const calligraphyColor = isMonari ? "rgba(200, 109, 81, 0.03)" : (isComTam ? "rgba(224, 123, 57, 0.022)" : (isSamHouse ? "rgba(139, 69, 19, 0.022)" : (isMonQuanChat ? "rgba(139, 26, 26, 0.022)" : (isHoaTeaRoom ? "rgba(46, 111, 64, 0.022)" : (isEmCoffee ? "rgba(139, 90, 43, 0.022)" : (isTaoTao ? "rgba(155, 46, 34, 0.022)" : (isHanHuyen ? "rgba(97, 130, 105, 0.03)" : (isCochin ? "rgba(42, 89, 68, 0.04)" : "rgba(141, 175, 90, 0.022)"))))))));
  const borderSocial = isMonari ? "rgba(200, 109, 81, 0.2)" : (isComTam ? "rgba(224, 123, 57, 0.15)" : (isSamHouse ? "rgba(139, 69, 19, 0.15)" : (isMonQuanChat ? "rgba(139, 26, 26, 0.15)" : (isHoaTeaRoom ? "rgba(46, 111, 64, 0.15)" : (isEmCoffee ? "rgba(139, 90, 43, 0.15)" : (isTaoTao ? "rgba(155, 46, 34, 0.15)" : (isHanHuyen ? "rgba(97, 130, 105, 0.2)" : (isCochin ? "rgba(42, 89, 68, 0.3)" : "rgba(141, 175, 90, 0.15)"))))))));
  const bgSocialHover = isMonari ? "rgba(200, 109, 81, 0.22)" : (isComTam ? "rgba(224, 123, 57, 0.18)" : (isSamHouse ? "rgba(139, 69, 19, 0.18)" : (isMonQuanChat ? "rgba(139, 26, 26, 0.18)" : (isHoaTeaRoom ? "rgba(46, 111, 64, 0.18)" : (isEmCoffee ? "rgba(139, 90, 43, 0.18)" : (isTaoTao ? "rgba(155, 46, 34, 0.18)" : (isHanHuyen ? "rgba(97, 130, 105, 0.25)" : (isCochin ? "rgba(42, 89, 68, 0.25)" : "rgba(141, 175, 90, 0.18)"))))))));
  const textSocialHover = isMonari ? "#fff" : (isComTam ? "rgba(244, 164, 96, 0.95)" : (isSamHouse ? "rgba(186, 175, 168, 0.95)" : (isMonQuanChat ? "rgba(224, 150, 150, 0.95)" : (isHoaTeaRoom ? "rgba(108, 191, 122, 0.95)" : (isEmCoffee ? "rgba(230, 175, 120, 0.95)" : (isTaoTao ? "rgba(217, 83, 79, 0.95)" : (isHanHuyen ? "#fff" : (isCochin ? "#fff" : "rgba(175, 215, 120, 0.95)"))))))));
  const borderSocialHover = isMonari ? "rgba(232, 146, 124, 0.5)" : (isComTam ? "rgba(244, 164, 96, 0.4)" : (isSamHouse ? "rgba(139, 69, 19, 0.4)" : (isMonQuanChat ? "rgba(139, 26, 26, 0.4)" : (isHoaTeaRoom ? "rgba(46, 111, 64, 0.4)" : (isEmCoffee ? "rgba(139, 90, 43, 0.4)" : (isTaoTao ? "rgba(155, 46, 34, 0.4)" : (isHanHuyen ? "rgba(97, 130, 105, 0.25)" : (isCochin ? "rgba(163, 223, 181, 0.5)" : "rgba(175, 215, 120, 0.4)"))))))));
  const textLinkHover = isMonari ? "rgba(232, 146, 124, 0.95)" : (isComTam ? "rgba(244, 164, 96, 0.95)" : (isSamHouse ? "rgba(139, 69, 19, 0.95)" : (isMonQuanChat ? "rgba(224, 150, 150, 0.95)" : (isHoaTeaRoom ? "rgba(108, 191, 122, 0.95)" : (isEmCoffee ? "rgba(230, 175, 120, 0.95)" : (isTaoTao ? "rgba(217, 83, 79, 0.95)" : (isHanHuyen ? "rgba(122, 157, 131, 0.95)" : (isCochin ? "rgba(163, 223, 181, 0.95)" : "rgba(175, 215, 120, 0.95)"))))))));
  const bgIconCircle = isMonari ? "rgba(200, 109, 81, 0.1)" : (isComTam ? "rgba(224, 123, 57, 0.06)" : (isSamHouse ? "rgba(139, 69, 19, 0.06)" : (isMonQuanChat ? "rgba(139, 26, 26, 0.06)" : (isHoaTeaRoom ? "rgba(46, 111, 64, 0.06)" : (isEmCoffee ? "rgba(139, 90, 43, 0.06)" : (isTaoTao ? "rgba(155, 46, 34, 0.06)" : (isHanHuyen ? "rgba(97, 130, 105, 0.08)" : (isCochin ? "rgba(42, 89, 68, 0.1)" : "rgba(141, 175, 90, 0.06)"))))))));
  const textIconCircle = isMonari ? "rgba(232, 146, 124, 0.95)" : (isComTam ? "rgba(244, 164, 96, 0.85)" : (isSamHouse ? "rgba(186, 175, 168, 0.85)" : (isMonQuanChat ? "rgba(224, 150, 150, 0.85)" : (isHoaTeaRoom ? "rgba(108, 191, 122, 0.85)" : (isEmCoffee ? "rgba(230, 175, 120, 0.85)" : (isTaoTao ? "rgba(217, 83, 79, 0.85)" : (isHanHuyen ? "rgba(122, 157, 131, 0.95)" : (isCochin ? "rgba(163, 223, 181, 0.9)" : "rgba(175, 215, 120, 0.85)"))))))));

  const infoItems = [
    { icon: MapPin, text: tenant?.address || (isMonari ? "250 Trần Hưng Đạo, Đông Hòa, Hồ Chí Minh, Vietnam" : (isMonQuanChat ? "201 QL1K, Đông Hòa, Dĩ An, Bình Dương" : (isSamHouse ? "Đường GS1, Đông Hòa, Dĩ An, Bình Dương" : (isHoaTeaRoom ? "18/2 Đường số 4, Đông Hòa, Dĩ An, Bình Dương" : (isEmCoffee ? "Thủ Đức, TP. Hồ Chí Minh" : (isTaoTao ? "102/16 Đ. Lê Lai, Ninh Kiều, Cần Thơ" : (isCochin ? "58 Đ. D2A, KĐT Vinhomes Grand Park, Long Bình, TP. Thủ Đức, TP.HCM" : "57 Nguyễn Cư Trinh,\nNinh Kiều, Cần Thơ"))))))) },
    { icon: Clock,  text: `Mở cửa: ${tenant?.openHours || (isMonari ? "07:30 – 22:30" : (isMonQuanChat ? "10:00 – 22:00" : (isSamHouse ? "07:30 – 22:00" : (isHoaTeaRoom ? "08:30 – 22:00" : (isEmCoffee ? "07:00 – 22:30" : (isTaoTao ? "07:30 – 22:30" : (isCochin ? "07:00 – 22:00" : "08:00 – 22:00")))))))}` + "\nMỗi ngày trong tuần" },
    { icon: Phone,  text: tenant?.hotline || (isMonari ? "0908 123 456" : (isMonQuanChat ? "0907 888 999" : (isSamHouse ? "0762 801 234" : (isHoaTeaRoom ? "0356 789 012" : (isEmCoffee ? "0901 234 567" : (isTaoTao ? "0766 853 358" : (isCochin ? "0909 686 868" : "0945781173"))))))) },
    { icon: Mail,   text: tenant?.email || (isMonari ? "contact@monari.vn" : (isMonQuanChat ? "monquanchat@gmail.com" : (isSamHouse ? "cafesamhouse@gmail.com" : (isHoaTeaRoom ? "contact@hoatearoom.vn" : (isEmCoffee ? "contact@emcoffee.vn" : (isTaoTao ? "contact@taotao.vn" : (isCochin ? "contact@cochincafe.vn" : "hello@yakishime.vn"))))))) },
  ];

  return (
    <footer style={{
      background: isMonari
        ? "linear-gradient(to bottom, #230F0A, #140805)"
        : (isComTam
        ? "linear-gradient(to bottom, #1E0F05, #140A03)"
        : (isSamHouse 
            ? "linear-gradient(to bottom, #1C110C, #110B08)" 
            : (isMonQuanChat
                ? "linear-gradient(to bottom, #2B0A0A, #190505)"
                : (isCochin
                    ? "linear-gradient(to bottom, #10261D, #08150F)"
                    : "linear-gradient(to bottom, #0F1F12, #0A140C)")))),
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
        {isMonari ? "🥮" : (isComTam ? "飯" : (isSamHouse || isEmCoffee || isTaoTao ? "☕" : (isMonQuanChat ? "食" : (isHoaTeaRoom ? "和" : (isCochin ? "🌿" : (isHanHuyen ? "🍃" : "茶"))))))}
      </span>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: 48, marginBottom: 64 }} className="footer-grid">
          
          {/* Column 1 – Brand Details */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              {isMonari
                ? <span style={{ fontSize: 24 }}>🥮</span>
                : (isComTam
                ? <span style={{ fontSize: 24 }}>🌾</span>
                : (isMonQuanChat
                    ? <span style={{ fontSize: 24 }}>🍲</span>
                    : (isSamHouse || isEmCoffee || isTaoTao || isHanHuyen || isCochin
                        ? <Coffee size={24} style={{ color: textGreenLight, flexShrink: 0 }} />
                        : <Leaf size={24} style={{ color: textGreenLight, flexShrink: 0 }} />)))
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
            {isMonari
              ? <span style={{ fontSize: 14 }}>🥮</span>
              : (isComTam
              ? <span style={{ fontSize: 14 }}>🌾</span>
              : (isSamHouse 
                  ? <Coffee size={14} style={{ color: "rgba(186,175,168,0.5)" }} />
                  : (isMonQuanChat
                      ? <span style={{ fontSize: 14 }}>🍲</span>
                      : <Leaf size={14} style={{ color: "rgba(175,215,120,0.5)" }} />)))
            }
            <span style={{ fontSize: 12, color: "rgba(240, 237, 228, 0.4)", fontFamily: "Inter, sans-serif" }}>
              {isMonari ? "Crafted with Passion & Warmth in Hồ Chí Minh 🥮" : (isComTam ? "Hương vị đậm đà chuẩn cơm mẹ nấu 🌾" : (isSamHouse ? "Crafted with Passion & Coffee in Dĩ An ☕" : (isMonQuanChat ? "Hương vị ẩm thực miền Trung đậm chất 🍲" : "Crafted with Zen & Love in Cần Thơ 🍵")))}
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
