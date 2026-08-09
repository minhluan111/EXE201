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

  const brandName = tenant?.name || "Quán";
  const brandDesc = isTaoTao
    ? "Tiệm cà phê ấm cúng mang đến hương vị cà phê kem muối béo ngậy đặc trưng, trà phô mai sánh mịn và các món trà trái cây dừa non tươi ngọt lành tại 102/16 Đ. Lê Lai, Ninh Kiều, Cần Thơ."
    : isMonari
    ? "Tiệm trà và bánh ngọt thủ công với set bánh trung thu cao cấp, coco matcha tươi mát, nước dừa quế hoa và không gian ấm cúng thư thái tại Đông Hòa, Hồ Chí Minh."
    : isComGa
    ? "Quán cơm gà gia truyền trứ danh với cơm gà luộc da vàng giòn ngọt thịt, gà quay xém cạnh thơm lừng, thịt xá xíu đậm đà và nước sâm bí đao thanh mát tại 146 Đường GS1, Đông Hòa, TP. Dĩ An."
    : isEmCoffee
    ? "Không gian làm việc xanh mát, thưởng thức các dòng cà phê rang mộc nguyên chất, phindi hạnh nhân thơm bùi và trà thảo mộc tươi ngon tại Thủ Đức, Hồ Chí Minh."
    : isHanHuyen
    ? "Chốn dừng chân bình yên hoài niệm giữa lòng phố thị, nơi thưởng thức những ly Phê xỉu, Phê đá và trà đào xanh nhài thanh khiết tại Quận 1, Hồ Chí Minh."
    : isCochin
    ? "Bistro nhà kính châu Âu xanh mát, không gian tao nhã phục vụ trà sữa ô long rang, Caffe Latte chuẩn Ý và trà hoa nhiệt đới tại Quận 1, Hồ Chí Minh."
    : isComTam
    ? "Quán cơm tấm gia truyền với hương vị đậm đà, sườn nướng mật ong béo ngậy và các món bún thịt nướng truyền thống ngon miệng."
    : isSamHouse 
    ? "Không gian học tập, làm việc yên tĩnh và hiện đại. Thưởng thức hương vị cà phê rang xay nguyên chất đậm đà, trà sữa và trà trái cây ngọt mát."
    : isMonQuanChat
    ? "Quán ăn món Quảng gia truyền với hương vị đậm đà, mộc mạc chuẩn vị miền Trung: Mỳ Quảng, Cao lầu, Bánh xèo, Bánh tráng cuốn thịt heo."
    : isHoaTeaRoom
    ? "Không gian thưởng trà thanh tịnh, trà bắp ASA thơm ngon béo ngậy cùng các trải nghiệm tô vẽ ly gốm đầy thú vị."
    : "Quán matcha cao cấp mang triết lý trà đạo Nhật Bản đến với Cần Thơ. Từng tách trà là một hành trình tĩnh tại và thiền định.";

  const infoItems = [
    { icon: MapPin, text: tenant?.address || (isTaoTao ? "102/16 Đ. Lê Lai, Ninh Kiều, Cần Thơ, Vietnam" : "146 Đường GS1, Đông Hòa, Hồ Chí Minh, Vietnam") },
    { icon: Clock,  text: `Mở cửa: ${tenant?.openHours || (isTaoTao ? "07:00 – 22:30" : "09:30 – 21:30")}\nMỗi ngày trong tuần` },
    { icon: Phone,  text: tenant?.hotline || (isTaoTao ? "0901 234 567" : "0938 123 789") },
    { icon: Mail,   text: tenant?.email || (isTaoTao ? "contact@taotaocafe.vn" : "contact@restaurant.com") },
  ];

  const watermarkEmoji = isTaoTao ? "🍎" :
    isMonari ? "🥮" :
    isComGa ? "雞" :
    isEmCoffee ? "☕" :
    isHanHuyen ? "☕" :
    isCochin ? "🌿" :
    isComTam ? "🌾" :
    isSamHouse ? "☕" :
    isMonQuanChat ? "🍲" :
    isHoaTeaRoom ? "🍃" :
    "茶";

  return (
    <footer style={{
      background: "linear-gradient(to bottom, #16161a, #0d0d10)",
      color: "rgba(240, 237, 228, 0.7)",
      position: "relative", 
      overflow: "hidden",
      borderTop: "1px solid var(--border)"
    }}>
      <div style={{ position: "absolute", top: -100, right: -100, width: 350, height: 350, borderRadius: "50%", background: "rgba(255,255,255,0.03)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.02)", filter: "blur(70px)", pointerEvents: "none" }} />

      <span style={{
        position: "absolute", bottom: -30, right: 30,
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 220, fontWeight: 800,
        color: "rgba(255,255,255,0.02)",
        lineHeight: 1, pointerEvents: "none", userSelect: "none"
      }}>
        {watermarkEmoji}
      </span>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 48, marginBottom: 64 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <img
                src={tenant?.logo || "/assets/images/logo.jpg"}
                alt="Logo"
                style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#fff" }}>
                {brandName}
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>
              {brandDesc}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {SOCIALS.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", transition: "all 0.2s"
                  }}
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#fff", marginBottom: 20 }}>
              Khám phá
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {LINKS["Khám phá"].map((l, i) => (
                <li key={i}>
                  <RouterLink to={l.to} style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}>
                    {l.label}
                  </RouterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#fff", marginBottom: 20 }}>
              Tài khoản
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {LINKS["Tài khoản"].map((l, i) => (
                <li key={i}>
                  <RouterLink to={l.to} style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}>
                    {l.label}
                  </RouterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#fff", marginBottom: 20 }}>
              Liên hệ
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {infoItems.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 13.5, color: "rgba(255,255,255,0.7)" }}>
                  <item.icon size={16} style={{ color: "var(--matcha)", flexShrink: 0, marginTop: 2 }} />
                  <span style={{ whiteSpace: "pre-line", lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          fontSize: 13,
          color: "rgba(255,255,255,0.4)"
        }}>
          <div>
            © {new Date().getFullYear()} {brandName}. Tất cả các quyền được bảo lưu.
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <span>Chính sách bảo mật</span>
            <span>Điều khoản sử dụng</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
