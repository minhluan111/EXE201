import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Leaf, Clock, MapPin, Star, ArrowRight, Award,
  ChevronLeft, ChevronRight, Quote, MessageSquare, Sparkles, Users, Flame, Calendar, Coffee, Utensils
} from "lucide-react";
import { menuList, getTestimonials } from "../services/apiClient";
import { useTenant } from "@/context/TenantContext";

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

// ── Testimonials ─────────────────────────────────────────────────────────
const YAKISHIME_TESTIMONIALS = [
  { name: "Nguyễn Minh Anh", role: "Foodie & Blogger", rating: 5, text: "Đây là quán matcha chuẩn Nhật nhất tôi từng ghé thăm tại Việt Nam. Không gian yên tĩnh, ánh sáng tự nhiên tuyệt đẹp, và Matcha Oat Latte của họ thực sự đặc biệt!" },
  { name: "Trần Hữu Đức", role: "Nhiếp ảnh gia", rating: 5, text: "Warabi Mochi ở đây nhất định phải thử. Texture mochi tan trong miệng, bột Kinako thơm dịu. Không gian cũng rất aesthetic để chụp ảnh." },
  { name: "Lê Thị Thu Hà", role: "Kiến trúc sư", rating: 5, text: "Mỗi tuần tôi đều ghé uống Usucha. Cách pha trà theo nghi thức Chado truyền thống làm tôi rất xúc động. Nhân viên am hiểu và tận tâm." },
  { name: "Phạm Quốc Toàn", role: "Lập trình viên", rating: 5, text: "Iced Matcha Latte hoàn hảo để làm việc. Vừa uống vừa code cả buổi sáng mà không cần caffeine quá đà. Quán wifi tốt, ghế thoải mái." },
];

const MONARI_TESTIMONIALS = [
  { name: "Lê Phương Thảo", role: "Khách hàng thân thiết", rating: 5, text: "Set bánh trung thu của Monari vỏ bánh mềm thơm, nhân ngọt thanh vừa vặn không hề gắt. Hộp quà tặng cực kỳ sang trọng và chỉn chu!" },
  { name: "Trần Minh Quang", role: "Kiến trúc sư", rating: 5, text: "Không gian quán ấm cúng, view ban công ngắm phố rất chill. Coco Matcha và Nước dừa quế hoa ở đây uống cực kỳ ấn tượng." },
  { name: "Nguyễn Hoàng My", role: "Content Creator", rating: 5, text: "Góc nào trong quán chụp ảnh cũng đẹp lung linh. Trà ổi hồng và trà lựu đỏ trân châu giòn sần sật, nhân viên lại vô cùng lịch thiệp." },
  { name: "Phạm Đăng Khoa", role: "Khách quen cuối tuần", rating: 5, text: "Bàn sofa êm ái, thích hợp ngồi đọc sách hoặc họp nhóm làm việc. Rất yêu thích phong cách ấm áp tinh tế của Monari!" }
];

const COM_GA_TESTIMONIALS = [
  { name: "Nguyễn Văn Hùng", role: "Khách hàng thân thiết", rating: 5, text: "Cơm gà luộc ở Ông Bách da gà vàng giòn sần sật, thịt ngọt béo ngậy chấm mắm gừng cay nồng cực kỳ ngon miệng!" },
  { name: "Trần Mai Phương", role: "Food Blogger", rating: 5, text: "Combo gà luộc và gà quay 2 người ăn no căng bụng. Gà quay xém cạnh thơm lừng gia vị, hạt cơm dẻo vàng ươm rất thơm." },
  { name: "Lê Minh Tuấn", role: "Kỹ sư", rating: 5, text: "Nước sâm bí đao hạt chia thanh mát giải nhiệt tuyệt vời sau bữa cơm gà đậm đà. Trứng ngâm tương lòng đào cũng rất béo ngậy." },
  { name: "Phạm Thu Trang", role: "Nhân viên văn phòng", rating: 5, text: "Quán sạch sẽ, phục vụ nhanh nhẹn, bàn ghế sắp xếp thoáng mát. Cơm xá xíu đậm đà, thịt mềm ngọt chuẩn vị gia truyền." }
];

const TAOTAO_TESTIMONIALS = [
  { name: "Trần Thu Thảo", role: "Food Reviewer", rating: 5, text: "Cà phê kem muối ở Táo Tào thực sự đỉnh chóp, béo mặn ngọt hài hòa không đâu sánh bằng!" },
  { name: "Lê Hoàng Nam", role: "Khách quen Gò Vấp", rating: 5, text: "Trà sữa Ô Long phô mai rất thơm, lớp phô mai dẻo béo ngậy uống cực kỳ cuốn và không bị ngọt gắt!" },
  { name: "Nguyễn Mai Linh", role: "Freelancer", rating: 5, text: "Không gian tone cam đất ấm cúng, chụp hình góc nào cũng xinh xắn. Món Chanh leo dừa non giải nhiệt ngày hè siêu đã." },
  { name: "Phạm Quốc Huy", role: "Lập trình viên", rating: 5, text: "Bàn cạnh cửa sổ view đẹp, wifi mạnh, ngồi làm việc nhâm nhi cà phê kem muối cực kỳ thoải mái." }
];

const EM_COFFEE_TESTIMONIALS = [
  { name: "Bùi Mai Phương", role: "Khách hàng thân thiết", rating: 5, text: "Phindi Hạnh Nhân ở Em Coffee thơm nức mũi, vị béo bùi từ hạnh nhân quyện cà phê phin quá đỉnh!" },
  { name: "Đặng Quốc Bảo", role: "Sinh viên Thủ Đức", rating: 5, text: "Không gian xanh mát, nhiều ổ điện và bàn lớn rất thích hợp để họp nhóm và chạy deadline." },
  { name: "Võ Hoàng Yến", role: "Content Creator", rating: 5, text: "Trà Vải Atiso Đỏ chua chua ngọt ngọt rất vừa miệng, decor đồ uống cực kỳ bắt mắt và tươi tắn." },
  { name: "Nguyễn Đức Thắng", role: "Kỹ sư IT", rating: 5, text: "Cacao caramel đậm đà, nhân viên thân thiện và lúc nào cũng niềm nở chu đáo." }
];

const HAN_HUYEN_TESTIMONIALS = [
  { name: "Phan Thanh Tùng", role: "Nhà văn tự do", rating: 5, text: "Đúng chất Hàn Huyên! Quán yên bình, hoài niệm, ngồi uống Phê xỉu ngắm cây xanh thấy lòng nhẹ tênh." },
  { name: "Lê Thị Ngọc Ánh", role: "Giáo viên", rating: 5, text: "Phê đá đậm đà chuẩn vị truyền thống. Góc sân vườn ngồi buổi sáng sớm cực kỳ trong lành và chill." },
  { name: "Trần Đăng Khoa", role: "Thiết kế đồ họa", rating: 5, text: "Trà đào xanh nhài thơm thanh nhã, miếng đào giòn ngọt. Địa điểm lý tưởng để tâm sự cùng bạn bè." },
  { name: "Nguyễn Bích Ngọc", role: "Khách hàng thân thiết", rating: 5, text: "Không gian ấm cúng mang lại cảm giác thân thuộc như được trở về nhà bên những người thương." }
];

const COCHIN_TESTIMONIALS = [
  { name: "Hoàng Thùy Linh", role: "Fashion Stylist", rating: 5, text: "Không gian nhà kính của Cochin Café đẹp ngỡ ngàng, ánh sáng tự nhiên rực rỡ lên hình cực sang chảnh!" },
  { name: "Đỗ Minh Trí", role: "Kiến trúc sư", rating: 5, text: "Trà sữa Ô Long rang đậm vị trà, hậu vị thơm khói độc đáo khó quên. Rất đáng để thưởng thức thường xuyên!" },
  { name: "Nguyễn Phương Uyên", role: "Chuyên viên Marketing", rating: 5, text: "Trà ổi hồng và Caffe Latte ở đây ngon xuất sắc. Bàn ghế sofa êm ái, rất thích hợp hẹn hò cuối tuần." },
  { name: "Trịnh Công Minh", role: "Doanh nhân", rating: 5, text: "Dịch vụ chuyên nghiệp, menu phong phú từ cà phê Ý đến các loại trà hoa nhiệt đới thanh mát." }
];

const COM_TAM_TESTIMONIALS = [
  { name: "Nguyễn Minh Anh", role: "Foodie & Blogger", rating: 5, text: "Cơm tấm ở đây ngon xuất sắc, sườn nướng mật ong vừa mềm vừa đậm đà, nước mắm kẹo chua ngọt chuẩn vị Sài Gòn luôn!" },
  { name: "Trần Hữu Đức", role: "Nhiếp ảnh gia", rating: 5, text: "Không gian quán sạch sẽ, thoáng mát. Bún thịt nướng đầy đặn, thịt thơm nức mũi, chả giò giòn rụm ăn rất đã." },
  { name: "Lê Thị Thu Hà", role: "Kiến trúc sư", rating: 5, text: "Cơm tấm sườn bì chả truyền thống rất ngon. Quán phục vụ nhanh nhẹn dù lúc nào cũng đông khách." },
  { name: "Phạm Quốc Toàn", role: "Lập trình viên", rating: 5, text: "Bữa trưa lý tưởng của tôi. Đùi gà nướng mật ong siêu to khổng lồ, da giòn thịt ngọt béo. Giá cả rất phải chăng." },
];

const SAM_HOUSE_TESTIMONIALS = [
  { name: "Nguyễn Minh Anh", role: "Foodie & Học sinh", rating: 5, text: "Không gian ở Cafe Sam House cực kỳ lý tưởng để học bài. Cà phê muối béo ngậy mặn mặn đậm đà, rất vừa miệng!" },
  { name: "Trần Hữu Đức", role: "Freelancer", rating: 5, text: "Tôi thích góc bàn cạnh cửa sổ tầng 3, yên tĩnh và có đầy đủ ổ điện. Bạc xỉu của quán thơm nồng và không bị quá ngọt." },
  { name: "Lê Thị Thu Hà", role: "Kiến trúc sư", rating: 5, text: "Thiết kế tông gỗ ấm cúng tạo cảm giác rất dễ chịu. Trà xoài Macchiato có lớp kem sữa siêu béo mịn sánh ngậy, rất đáng tiền." },
  { name: "Phạm Quốc Toàn", role: "Lập trình viên", rating: 5, text: "Lục trà sữa mật ong trân châu trắng là món tủ của tôi mỗi lần làm việc ở đây. Quán chạy nhạc nhẹ nhàng, nhân viên thân thiện." },
];

const MON_QUAN_CHAT_TESTIMONIALS = [
  { name: "Nguyễn Minh Anh", role: "Khách quen xứ Quảng", rating: 5, text: "Mỳ Quảng tôm thịt ở đây ngon đúng điệu, nước nhân đậm đà, bánh tráng giòn rụm. Ăn một tô là nhớ ngay quê nhà Quảng Nam!" },
  { name: "Trần Hữu Đức", role: "Nhà báo du lịch", rating: 5, text: "Tôi cực kỳ ấn tượng với món Bánh tráng cuốn thịt heo ba chỉ. Rau sống siêu đa dạng, thịt heo luộc mềm và mắm nêm thì thơm ngon nồng nàn!" },
  { name: "Lê Thị Thu Hà", role: "Nhà thiết kế", rating: 5, text: "Không gian mộc mạc bên hồ cá koi làm tôi thấy rất thư thái. Cao lầu sợi mì dai sần sật, da heo giòn tan rất chuẩn vị Hội An." },
  { name: "Phạm Quốc Toàn", role: "Kỹ sư xây dựng", rating: 5, text: "Bánh xèo tôm thịt vỏ giòn rụm, nước sốt tương đậu phộng béo bùi ngon khó cưỡng. Địa điểm lý tưởng để họp mặt gia đình cuối tuần." }
];

const HOA_TEA_ROOM_TESTIMONIALS = [
  { name: "Nguyễn Minh Anh", role: "Khách hàng thân thiết", rating: 5, text: "Trà sữa bắp ASA rất thơm ngon và ngọt bùi tự nhiên. Không gian quán mang tông gỗ xanh cực kỳ tinh tế và thư giãn!" },
  { name: "Trần Hữu Đức", role: "Freelancer", rating: 5, text: "Góc bàn N2.4 cạnh cửa sổ là địa điểm làm việc yêu thích của tôi. Có đầy đủ ổ điện, wifi ổn định và không gian thì cực kỳ yên tĩnh." },
  { name: "Lê Thị Thu Hà", role: "Nhà thiết kế đồ họa", rating: 5, text: "Nước uống ngon miệng, đặc biệt là KUMORI kem tiramisu béo mịn. Trải nghiệm tô vẽ ly ở đây rất thú vị và đậm chất nghệ thuật." },
  { name: "Phạm Quốc Toàn", role: "Khách quen cuối tuần", rating: 5, text: "Cực kỳ thích Matcha Latte Coldwhisk của quán. Matcha được đánh bọt lạnh công phu, uống rất thanh mát và hậu ngọt dễ chịu." }
];

// ── Galleries ─────────────────────────────────────────────────────────
const YAKISHIME_GALLERY = [
  { url: "/assets/yakishime/space/khong_gian_quan.jpg", h: 280, label: "Không gian quán ấm cúng" },
  { url: "/assets/yakishime/space/khong_gian.jpg", h: 220, label: "Góc thiền tĩnh lặng" },
  { url: "/assets/yakishime/space/ko_gian_quan.jpg", h: 260, label: "Cửa sổ trúc xanh" },
  { url: "/assets/yakishime/space/ko_gian_1.jpg", h: 220, label: "Kệ trưng bày gốm sứ tinh tế" },
  { url: "/assets/yakishime/space/ko_gian.jpg", h: 280, label: "Đèn nghệ thuật lá sen" },
  { url: "/assets/yakishime/decor/img_6260.png", h: 240, label: "Bình gốm Nhật Bản" },
  { url: "/assets/yakishime/decor/img_6261.png", h: 260, label: "Lối vào an nhiên" },
  { url: "/assets/yakishime/decor/img_6262.png", h: 220, label: "Tĩnh lặng thiền đạo" },
];

const MONARI_GALLERY = [
  { url: "/assets/monari/decor/space_main.jpg", h: 280, label: "Quầy trái cây & bánh ngọt Monari" },
  { url: "/assets/monari/decor/space_1.jpg", h: 230, label: "Không gian trưng bày sang trọng" },
  { url: "/assets/monari/decor/space_2.jpg", h: 270, label: "Quầy bánh kẹo cao cấp" },
  { url: "/assets/monari/decor/space_3.jpg", h: 230, label: "Không gian decor ấm cúng" },
  { url: "/assets/monari/decor/space_view_1.jpg", h: 280, label: "Góc sofa êm dịu" },
  { url: "/assets/monari/decor/space_view_2.jpg", h: 240, label: "Quầy đồ uống tươi mát" },
];

const COM_GA_GALLERY = [
  { url: "/assets/comgaongbach/decor/space_main.jpg", h: 280, label: "Mặt tiền quán Cơm Gà Ông Bách" },
  { url: "/assets/comgaongbach/decor/space_1.jpg", h: 230, label: "Không gian quán" },
  { url: "/assets/comgaongbach/decor/space_2.jpg", h: 270, label: "Không gian quán" },
  { url: "/assets/comgaongbach/decor/space_3.jpg", h: 230, label: "Không gian thoáng đãng sạch sẽ" },
  { url: "/assets/comgaongbach/decor/space_4.jpg", h: 280, label: "Không gian quán" },
  { url: "/assets/comgaongbach/decor/space_5.jpg", h: 240, label: "Không gian quán" },
];

const TAOTAO_GALLERY = [
  { url: "/assets/taotao/decor/k_gian.jpg", h: 280, label: "Góc hoài niệm" },
  { url: "/assets/taotao/decor/k_gian_1.jpg", h: 220, label: "Mái ngói xưa" },
  { url: "/assets/taotao/decor/k_gian_2.jpg", h: 260, label: "Góc xưa" },
  { url: "/assets/taotao/decor/ko_gian_quan.jpg", h: 240, label: "Không gian quán" },
  { url: "/assets/taotao/decor/ko_gian_quan_1.jpg", h: 280, label: "Không gian quán" },
  { url: "/assets/taotao/decor/ko_gian_quan_2.jpg", h: 230, label: "Không gian quán" },
];

const EM_COFFEE_GALLERY = [
  { url: "/assets/emcoffee/decor/space_1.jpg", h: 280, label: "Em coffee đón bạn" },
  { url: "/assets/emcoffee/decor/space_2.jpg", h: 230, label: "Các món nước" },
  { url: "/assets/emcoffee/decor/space_3.jpg", h: 260, label: "Không gian bàn trong nhà" },
  { url: "/assets/emcoffee/decor/space_4.jpg", h: 240, label: "Không gian quán" },
  { url: "/assets/emcoffee/decor/space_5.jpg", h: 280, label: "Góc ngoài trời" },
  { url: "/assets/emcoffee/decor/space_6.jpg", h: 230, label: "Không gian trong quán" },
];

const HAN_HUYEN_GALLERY = [
  { url: "/assets/hanhuyen/decor/Ko gian(1).jpg", h: 280, label: "Góc tường hoài niệm" },
  { url: "/assets/hanhuyen/decor/Ko gian(2).jpg", h: 230, label: "Không gian lối đi" },
  { url: "/assets/hanhuyen/decor/Ko gian(3).jpg", h: 260, label: "Góc nhỏ tĩnh lặng" },
  { url: "/assets/hanhuyen/decor/Ko gian(4).jpg", h: 240, label: "Ban công lộng gió ngắm phố" },
  { url: "/assets/hanhuyen/decor/Ko gian(5).jpg", h: 280, label: "Không gian hàn huyên tâm tình" },
  { url: "/assets/hanhuyen/decor/Ko gian(6).jpg", h: 230, label: "Góc hoài niệm thân thuộc" },
];

const COCHIN_GALLERY = [
  { url: "/assets/cochin/decor/Ko gian(1).jpg", h: 280, label: "Không gian xanh" },
  { url: "/assets/cochin/decor/Ko gian(2).jpg", h: 230, label: "Không gian quán" },
  { url: "/assets/cochin/decor/Ko gian(3).jpg", h: 270, label: "Không gian cây xanh" },
  { url: "/assets/cochin/decor/Ko gian(4).jpg", h: 240, label: "Không gian cây xanh" },
  { url: "/assets/cochin/decor/Ko gian(5).jpg", h: 280, label: "Bàn ngoài trời thoáng mát" },
  { url: "/assets/cochin/decor/Ko gian(6).jpg", h: 240, label: "Góc cửa sổ đón nắng" },
];

const COM_TAM_GALLERY = [
  { url: "/assets/comtamno/n2_1.jpg", h: 280, label: "Bàn ngoài trời thoáng mát" },
  { url: "/assets/comtamno/n2_2.jpg", h: 220, label: "Bàn đôi trong nhà" },
  { url: "/assets/comtamno/n6_3.jpg", h: 260, label: "Bàn lớn cho gia đình" },
  { url: "/assets/comtamno/n4_1.jpg", h: 220, label: "Bàn 4 người ngoài sân" },
  { url: "/assets/comtamno/n4_2.jpg", h: 280, label: "Bàn ăn ấm cúng" },
  { url: "/assets/comtamno/n6_1.jpg", h: 240, label: "Bàn tiệc ngoài trời" },
];

const SAM_HOUSE_GALLERY = [
  { url: "/assets/samhouse/decor/img_4891.jpg", h: 280, label: "Góc check-in gấu bông" },
  { url: "/assets/samhouse/decor/img_4892.jpg", h: 220, label: "Mặt tiền đón khách" },
  { url: "/assets/samhouse/decor/img_4901.jpg", h: 260, label: "Góc check-in trăng tròn" },
  { url: "/assets/samhouse/decor/img_4902.jpg", h: 220, label: "Không gian ngoài trời lung linh" },
  { url: "/assets/samhouse/decor/img_4903.jpg", h: 280, label: "Lối lên lầu ấm cúng" },
  { url: "/assets/samhouse/decor/img_4904.jpg", h: 240, label: "Đội ngũ nhân viên thân thiện" },
];

const MON_QUAN_CHAT_GALLERY = [
  { url: "/assets/monquanchat/tables/ban_6.jpg", h: 280, label: "Không gian mộc mạc đậm chất quê" },
  { url: "/assets/monquanchat/decor/decor_2.jpg", h: 220, label: "Hồ cá Koi thư giãn ngoài trời" },
  { url: "/assets/monquanchat/tables/ban_7.jpg", h: 260, label: "Góc sân vườn thoáng đãng" },
  { url: "/assets/monquanchat/tables/ban_1.jpg", h: 220, label: "Không gian trong nhà máy lạnh" },
];

const HOA_TEA_ROOM_GALLERY = [
  { url: "/assets/hoatearoom/decor/decor_1.jpg", h: 280, label: "Góc phòng trà mộc mạc" },
  { url: "/assets/hoatearoom/decor/decor_2.jpg", h: 220, label: "Ban công tầng 2 thoáng đãng" },
  { url: "/assets/hoatearoom/decor/decor_3.jpg", h: 260, label: "Kệ sách gỗ và hoa sen" },
  { url: "/assets/hoatearoom/decor/decor_4.jpg", h: 220, label: "Góc thưởng trà tĩnh lặng" },
];

const THO_TESTIMONIALS = [
  { name: "Lê Quốc Bảo", role: "Kiến trúc sư", rating: 5, text: "Không gian Wabi-Sabi mộc mạc và ấm cúng đến từng chi tiết. Cà phê kem muối sánh béo mặn nhẹ cực kỳ vừa vặn, ngồi vẽ phác thảo cả buổi chiều rất thư thái." },
  { name: "Nguyễn Thùy Trang", role: "Food & Lifestyle Blogger", rating: 5, text: "Mulberry Kombucha và Pina Cold Brew ở Thô's thực sự xuất sắc! Vị chua thanh tự nhiên, dâu tằm tươi mọng nước. Bánh Croissant nướng bơ Pháp giòn rụm thơm nức." },
  { name: "Trần Hoàng Nam", role: "Lập trình viên", rating: 5, text: "Bàn làm việc tầng lửng và ban công view phố Đặng Văn Bi rất yên tĩnh, nhiều ổ cắm điện. Cà phê trứng nướng khè lửa thơm lừng béo ngậy không hề tanh." },
  { name: "Đặng Mai Anh", role: "Nhiếp ảnh gia", rating: 5, text: "Ánh sáng tự nhiên chiếu qua từng vệt tường vôi thô cực kỳ nghệ thuật. Tách Cappuccino gốm mộc thủ công tạo cảm giác rất trân quý và ấm lòng." },
];

const THO_GALLERY = [
  { url: "/assets/thocoffee/decor/hero.jpg", h: 280, label: "Không gian quán" },
  { url: "/assets/thocoffee/decor/space_main.jpg", h: 240, label: "Bàn gỗ & kệ sách hoài niệm" },
  { url: "/assets/thocoffee/decor/space_interior_2.jpg", h: 280, label: "Góc bàn đôi đón nắng chiều" },
  { url: "/assets/thocoffee/decor/space_interior_3.jpg", h: 230, label: "Bàn làm việc tầng lửng yên tĩnh" },
  { url: "/assets/thocoffee/decor/space_lounge.jpg", h: 270, label: "Tường vôi thô & vệt nắng tự nhiên" },
  { url: "/assets/thocoffee/decor/space_window.jpg", h: 250, label: "Không gian chỗ ngồi" },
  { url: "/assets/thocoffee/decor/space_balcony.jpg", h: 290, label: "Không gian chỗ ngồi " },
  { url: "/assets/thocoffee/decor/space_garden.jpg", h: 240, label: "Chỗ ngồi có cây xanh" },
  { url: "/assets/thocoffee/decor/space_counter.jpg", h: 260, label: "Không gian chỗ ngồi" },
  { url: "/assets/thocoffee/decor/bar_counter.jpg", h: 240, label: "Quầy Bar & Tháp Cold Brew" },
  { url: "/assets/thocoffee/decor/space_upstairs.jpg", h: 280, label: "Không gian lounge thư thái" },
  { url: "/assets/thocoffee/decor/space_staircase.jpg", h: 250, label: "Không gian chỗ ngồi" },
];

const THO_PHILOSOPHIES = [
  { kanji: "Mộc", romaji: "MỘC", title: "Vẻ Đẹp Nguyên Bản", desc: "Tôn vinh chất liệu tự nhiên — gỗ thô, tường vôi và ánh nắng dịu nhẹ tạo nên không gian Wabi-Sabi an yên, tĩnh tại." },
  { kanji: "Thủ", romaji: "THỦ", title: "Pha Chế Thủ Công", desc: "Từng giọt cà phê ủ lạnh, ly espresso hay tách trà hoa quả đều được nghệ nhân pha chế tỉ mỉ, trọn vẹn hương vị tinh túy." },
  { kanji: "Tươi", romaji: "TƯƠI", title: "Bánh Nướng Mỗi Ngày", desc: "Croissant bơ Pháp ngàn lớp, English Scones và Waffle vàng giòn được nướng nóng hổi tại chỗ mỗi sáng sớm." },
  { kanji: "Tâm", romaji: "TÂM", title: "Phục Vụ Chân Thành", desc: "Đón tiếp bạn như người thân ghé chơi nhà — nụ cười mộc mạc, sự ân cần và không gian thoải mái không gượng ép." },
];

// ── Philosophies ─────────────────────────────────────────────────────────
const YAKISHIME_PHILOSOPHIES = [
  { kanji: "和", romaji: "WA", title: "Hài Hòa", desc: "Cân bằng âm dương giữa con người và thiên nhiên. Trà ngon chắt lọc tinh hoa cỏ cây, hòa quyện tâm hồn thanh tịnh." },
  { kanji: "敬", romaji: "KEI", title: "Tôn Kính", desc: "Trân trọng từng tri kỷ ghé thăm. Nghi thức pha chế tỉ mỉ thể hiện lòng hiếu khách chân thành và sự tôn kính sâu sắc." },
  { kanji: "清", romaji: "SEI", title: "Thanh Khiết", desc: "Tinh sạch trong tâm hồn và nguyên liệu. Lá trà organic tinh tuyển từ Uji hòa cùng dòng nước suối ngọt lành thanh mát." },
  { kanji: "寂", romaji: "JAKU", title: "Tĩnh Lặng", desc: "Sự an nhiên tự tại đạt được sau khi tĩnh tâm. Đắm mình vào tĩnh lặng thanh nhã để tìm lại bản ngã bình yên." }
];

const MONARI_PHILOSOPHIES = [
  { kanji: "Bánh", romaji: "BÁNH", title: "Bánh Ngọt Thủ Công", desc: "Nguyên liệu cao cấp hảo hạng, từng chiếc bánh trung thu và bánh ngọt đều được nhào nặn thủ công tỉ mỉ, trọn vẹn hương vị." },
  { kanji: "Trà", romaji: "TRÀ", title: "Trà & Thảo Mộc", desc: "Trà lựu đỏ, trà ổi hồng và nước dừa quế hoa tự nhiên tươi mới, ngọt thanh bổ dưỡng, đánh thức mọi giác quan." },
  { kanji: "Ấm", romaji: "ẤM", title: "Không Gian Ấm Áp", desc: "Không gian trang nhã, ánh sáng ấm cúng cùng sofa êm dịu, là chốn dừng chân hoàn hảo để hẹn hò, làm việc và sum họp." },
  { kanji: "Tâm", romaji: "TÂM", title: "Phục Vụ Tận Tâm", desc: "Đón tiếp quý khách bằng sự chân thành, chu đáo và mến khách trong từng nụ cười và mỗi đĩa bánh, tách trà trao tay." }
];

const COM_GA_PHILOSOPHIES = [
  { kanji: "Gà", romaji: "GÀ", title: "Gà Ta Thả Vườn", desc: "Gà ta thả vườn tươi ngon mỗi ngày, thịt ngọt săn chắc tự nhiên, da vàng giòn chuẩn độ chín mọng." },
  { kanji: "Cơm", romaji: "CƠM", title: "Cơm Nấu Nước Cốt", desc: "Gạo tám thơm hạt dẻo nấu cùng nước luộc gà béo ngậy và mỡ gà vàng óng ánh thơm nức mũi." },
  { kanji: "Vị", romaji: "VỊ", title: "Nước Chấm Gia Truyền", desc: "Nước mắm gừng chua ngọt đậm đà gia truyền kết hợp sốt xá xíu mật ong tạo nên linh hồn đĩa cơm gà." },
  { kanji: "Tâm", romaji: "TÂM", title: "Phục Vụ Tận Tâm", desc: "Đón tiếp thực khách bằng cả tấm lòng mến khách, mang lại bữa ăn ấm áp trọn vẹn hương vị gia đình." }
];

const TAOTAO_PHILOSOPHIES = [
  { kanji: "Vị", romaji: "VỊ", title: "Đậm Đà Bản Sắc", desc: "Cà phê Robusta thơm nồng kết hợp lớp kem muối sánh ngậy mặn ngọt hòa quyện độc đáo khó cưỡng." },
  { kanji: "Tươi", romaji: "TƯƠI", title: "Trái Cây Tươi Mới", desc: "Chanh leo tươi, dừa non dẻo ngọt và trà hoa tự nhiên mang đến nguồn năng lượng tươi mát mỗi ngày." },
  { kanji: "Ấm", romaji: "ẤM", title: "Không Gian Ấm Cúng", desc: "Tông màu cam đất ấm áp, âm nhạc nhẹ nhàng và bàn ghế êm ái là chốn hẹn hò trò chuyện tuyệt vời." },
  { kanji: "Tâm", romaji: "TÂM", title: "Phục Vụ Tận Tình", desc: "Mỗi tách cà phê và ly trà trao tay đều chứa đựng sự chăm chút và nụ cười mến khách chân thành." }
];

const EM_COFFEE_PHILOSOPHIES = [
  { kanji: "Hạt", romaji: "HẠT", title: "Cà Phê Rang Mộc", desc: "Những hạt cà phê thượng hạng được chọn lọc tỉ mỉ, rang xay tại chỗ giữ trọn hương thơm nguyên bản." },
  { kanji: "Xanh", romaji: "XANH", title: "Không Gian Xanh Mát", desc: "Cây xanh ngập tràn cùng ánh sáng tự nhiên tạo nên không gian làm việc và học tập đầy cảm hứng." },
  { kanji: "Chất", romaji: "CHẤT", title: "Chất Lượng Tinh Tuyển", desc: "Sữa tươi thanh trùng, phindi hạnh nhân và cacao nguyên chất đem lại trải nghiệm thức uống tròn vị." },
  { kanji: "Tình", romaji: "TÌNH", title: "Kết Nối Thân Thương", desc: "Nơi mọi khoảnh khắc sum vầy bạn bè, gia đình và đồng nghiệp trở nên trọn vẹn và đáng nhớ." }
];

const HAN_HUYEN_PHILOSOPHIES = [
  { kanji: "Tĩnh", romaji: "TĨNH", title: "Bình Yên Lắng Đọng", desc: "Tạm gác lại ồn ào phố thị, thả mình vào không gian mộc mạc hoài niệm và tiếng nhạc êm đềm." },
  { kanji: "Phê", romaji: "PHÊ", title: "Cà Phê Truyền Thống", desc: "Phê đá đậm vị, Phê xỉu ba tầng ngọt béo đánh thức mọi cảm xúc thân thương quen thuộc." },
  { kanji: "Trà", romaji: "TRÀ", title: "Trà Hoa Thanh Mát", desc: "Trà đào xanh nhài, trà vải ngọt lành thanh nhiệt cơ thể và làm dịu nhẹ tâm hồn." },
  { kanji: "Tâm", romaji: "TÂM", title: "Chuyện Trò Hàn Huyên", desc: "Nơi gắn kết những câu chuyện tâm tình sâu lắng bên những ly nước thơm lành mộc mạc." }
];

const COCHIN_PHILOSOPHIES = [
  { kanji: "Nhã", romaji: "NHÃ", title: "Bistro Tinh Tế", desc: "Kiến trúc nhà kính châu Âu kết hợp Bistro hiện đại, mang lại không gian thưởng thức tao nhã." },
  { kanji: "Hương", romaji: "HƯƠNG", title: "Hương Vị Đặc Sắc", desc: "Trà sữa ô long rang thơm nồng hương khói, Latte chuẩn Ý cùng trà ổi hồng thanh mát tự nhiên." },
  { kanji: "Sắc", romaji: "SẮC", title: "Sắc Màu Tươi Mới", desc: "Trà thanh long đỏ và trà vải hoa hồng rực rỡ, khơi gợi cảm hứng sáng tạo và niềm vui tươi trẻ." },
  { kanji: "Tâm", romaji: "TÂM", title: "Trọn Vẹn Từng Giây", desc: "Đội ngũ chuyên nghiệp tận tâm, mang lại cho thực khách trải nghiệm ẩm thực đẳng cấp và thư thái." }
];

const COM_TAM_PHILOSOPHIES = [
  { kanji: "Chọn", romaji: "CHỌN", title: "Tuyển Chọn", desc: "Nguyên liệu tươi ngon tinh tuyển mỗi ngày. Gạo tấm thơm dẻo cùng sườn heo tẩm ướp mật ong gia truyền đặc sắc." },
  { kanji: "Lửa", romaji: "LỬA", title: "Lửa Hồng", desc: "Sườn được nướng trực tiếp trên bếp than hồng đỏ rực, giữ trọn vị ngọt tự nhiên, thơm nức mũi khi chín tới." },
  { kanji: "Vị", romaji: "VỊ", title: "Đậm Đà", desc: "Nước mắm kẹo chua ngọt gia truyền sánh mịn đậm vị, linh hồn của đĩa cơm tấm chuẩn vị miền Nam." },
  { kanji: "Tâm", romaji: "TÂM", title: "Chân Thành", desc: "Phục vụ thực khách bằng cả tấm lòng. Mang đến bữa ăn ngon miệng, ấm cúng và đầy ắp hương vị gia đình." }
];

const SAM_HOUSE_PHILOSOPHIES = [
  { kanji: "Hương", romaji: "HƯƠNG", title: "Hương Thơm", desc: "Hạt cà phê Robusta và Arabica tuyển chọn kỹ lưỡng, rang xay tại chỗ lan tỏa hương thơm nồng nàn quyến rũ." },
  { kanji: "Chất", romaji: "CHẤT", title: "Chất Lượng", desc: "Nguyên liệu tự nhiên sạch sẽ, sữa tươi thanh trùng béo mịn kết hợp trà hảo hạng mang lại thức uống mát lành tròn vị." },
  { kanji: "Tâm", romaji: "TÂM", title: "Chân Thành", desc: "Pha chế bằng cả sự cẩn thận và phục vụ bằng cả tấm lòng, mang đến cho thực khách những ly đồ uống hoàn hảo nhất." },
  { kanji: "Ấm", romaji: "ẤM", title: "Ấm Cúng", desc: "Không gian tông gỗ ấm áp, ánh sáng dịu nhẹ là nơi lý tưởng để tụ họp bạn bè, học tập làm việc hay thư giãn riêng tư." }
];

const MON_QUAN_CHAT_PHILOSOPHIES = [
  { kanji: "Vị", romaji: "VỊ", title: "Hương Vị Quảng", desc: "Nước nhân ngọt lịm từ tôm thịt cùng mắm nêm gia truyền, mang trọn tinh hoa ẩm thực xứ Quảng nồng ấm." },
  { kanji: "Chất", romaji: "CHẤT", title: "Chất Lượng", desc: "Rau rừng, bánh tráng nướng giòn rụm kết hợp thịt heo ba chỉ ngọt thơm tự nhiên sạch sẽ chuẩn VietGAP." },
  { kanji: "Mộc", romaji: "MỘC", title: "Mộc Mạc", desc: "Thiết kế không gian mang đậm bản sắc quê nhà miền Trung thanh bình, chân chất, tạo sự thoải mái gần gũi." },
  { kanji: "Tâm", romaji: "TÂM", title: "Tâm Huyết", desc: "Mang cả tấm lòng gửi gắm vào từng sợi mì Cao lầu, đĩa bánh xèo giòn tan, phục vụ quý khách như người thân." }
];

const HOA_TEA_ROOM_PHILOSOPHIES = [
  { kanji: "Hương", romaji: "HƯƠNG", title: "Hương Thơm", desc: "Hương thơm nồng nàn quyến rũ từ bột trà xanh Nhật Bản thượng hạng quyện cùng lớp sữa tươi béo ngậy." },
  { kanji: "Chất", romaji: "CHẤT", title: "Chất Lượng", desc: "Nguyên liệu tự nhiên thanh sạch, matcha Uji nhập khẩu trực tiếp kết hợp sữa tươi thanh trùng béo mịn tốt cho sức khỏe." },
  { kanji: "Mộc", romaji: "MỘC", title: "Mộc Mạc", desc: "Thiết kế không gian tối giản, mang đậm sắc màu thiền định tĩnh lặng, mang lại sự bình yên thư thái trong tâm hồn." },
  { kanji: "Tâm", romaji: "TÂM", title: "Tận Tâm", desc: "Mỗi tách trà đều được pha chế tỉ mỉ thủ công, gửi gắm trọn vẹn sự tận tâm chân thành tới quý khách." }
];

export default function HomePage() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const rawName = String(tenant?.name || "").toLowerCase();
  const tName = String(tenant?.tenantName || "").toLowerCase();

  const isTaoTao = rawName.includes("taotao") || rawName.includes("táo tào") || tName.includes("taotao");
  const isMonari = rawName.includes("monari") || tName.includes("monari");
  const isComGa = rawName.includes("cơm gà") || rawName.includes("ông bách") || tName.includes("comga");
  const isTho = rawName.includes("thô") || rawName.includes("artisan") || tName.includes("thocoffee");
  const isEmCoffee = !isTho && (rawName.includes("em coffee") || rawName.includes("em") || tName.includes("em"));
  const isHanHuyen = rawName.includes("hàn huyên") || tName.includes("hanhuyen");
  const isCochin = rawName.includes("cochin") || tName.includes("cochin");
  const isComTam = rawName.includes("cơm tấm") || tName.includes("comtam");
  const isSamHouse = rawName.includes("sam house") || tName.includes("samhouse");
  const isMonQuanChat = rawName.includes("quảng") || tName.includes("monquanchat");
  const isHoaTeaRoom = rawName.includes("hoa") || rawName.includes("hoà") || rawName.includes("hòa") || tName.includes("hoatearoom");
  const isMatcha = rawName.includes("yaki") || rawName.includes("matcha") || tName.includes("matcha") || (!isTaoTao && !isMonari && !isComGa && !isTho && !isEmCoffee && !isHanHuyen && !isCochin && !isComTam && !isSamHouse && !isMonQuanChat && !isHoaTeaRoom);

  const currentPhilosophies = isTaoTao ? TAOTAO_PHILOSOPHIES : (isMonari ? MONARI_PHILOSOPHIES : (isComGa ? COM_GA_PHILOSOPHIES : (isTho ? THO_PHILOSOPHIES : (isEmCoffee ? EM_COFFEE_PHILOSOPHIES : (isHanHuyen ? HAN_HUYEN_PHILOSOPHIES : (isCochin ? COCHIN_PHILOSOPHIES : (isComTam ? COM_TAM_PHILOSOPHIES : (isSamHouse ? SAM_HOUSE_PHILOSOPHIES : (isMonQuanChat ? MON_QUAN_CHAT_PHILOSOPHIES : (isHoaTeaRoom ? HOA_TEA_ROOM_PHILOSOPHIES : YAKISHIME_PHILOSOPHIES))))))))));
  const currentGallery = isTaoTao ? TAOTAO_GALLERY : (isMonari ? MONARI_GALLERY : (isComGa ? COM_GA_GALLERY : (isTho ? THO_GALLERY : (isEmCoffee ? EM_COFFEE_GALLERY : (isHanHuyen ? HAN_HUYEN_GALLERY : (isCochin ? COCHIN_GALLERY : (isComTam ? COM_TAM_GALLERY : (isSamHouse ? SAM_HOUSE_GALLERY : (isMonQuanChat ? MON_QUAN_CHAT_GALLERY : (isHoaTeaRoom ? HOA_TEA_ROOM_GALLERY : YAKISHIME_GALLERY))))))))));
  const defaultReviews = isTaoTao ? TAOTAO_TESTIMONIALS : (isMonari ? MONARI_TESTIMONIALS : (isComGa ? COM_GA_TESTIMONIALS : (isTho ? THO_TESTIMONIALS : (isEmCoffee ? EM_COFFEE_TESTIMONIALS : (isHanHuyen ? HAN_HUYEN_TESTIMONIALS : (isCochin ? COCHIN_TESTIMONIALS : (isComTam ? COM_TAM_TESTIMONIALS : (isSamHouse ? SAM_HOUSE_TESTIMONIALS : (isMonQuanChat ? MON_QUAN_CHAT_TESTIMONIALS : (isHoaTeaRoom ? HOA_TEA_ROOM_TESTIMONIALS : YAKISHIME_TESTIMONIALS))))))))));

  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [reviewsList, setReviewsList] = useState(defaultReviews);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const heroRef = useRef(null);

  const [quickGuests, setQuickGuests] = useState(2);
  const [quickDate, setQuickDate]     = useState("Hôm nay");

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 160]);

  useEffect(() => {
    setReviewsList(defaultReviews);
  }, [tenant]);

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

        if ((!res.ok || !testRes.ok) && retryCount < maxRetries) {
          retryCount++;
          setTimeout(loadData, retryDelay);
          return;
        }

        const loadedProducts = res.ok ? res.data : [];
        setProducts(loadedProducts);

        const enrichFallback = () => {
          if (loadedProducts.length > 0) {
            const enriched = defaultReviews.map(t => {
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
          const menuReviews = testRes.data.filter(r => {
            if (!r.menu_id) return false;
            return loadedProducts.some(p => String(p.id) === String(r.menu_id));
          });

          if (menuReviews.length > 0) {
            const topReviews = [...menuReviews]
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 5);

            const mapped = topReviews.map(r => {
              const product = loadedProducts.find(p => String(p.id) === String(r.menu_id));
              return {
                id: r.id,
                name: r.user?.full_name || "Khách Hàng Trải Nghiệm",
                role: `Khách hàng đánh giá · ${product ? product.name : "Thức uống"}`,
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
  }, [tenant]);

  useEffect(() => {
    if (reviewsList.length === 0) return;
    const t = setInterval(() => {
      setActiveTestimonial((i) => (i + 1) % reviewsList.length);
    }, 4500);
    return () => clearInterval(t);
  }, [reviewsList.length]);

  const bestSellers = products.filter((p) => ["best_seller", "signature", "trending"].includes(p.tag)).slice(0, 3);

  const handleQuickBook = () => {
    const targetDate = quickDate === "Hôm nay"
      ? new Date().toISOString().split("T")[0]
      : new Date(Date.now() + 86400000).toISOString().split("T")[0];
    navigate("/booking", { state: { guests: quickGuests, date: targetDate } });
  };

  const duplicatedGallery = [...currentGallery, ...currentGallery];

  // Dynamic hero background
  const heroBg = isTaoTao ? "url('/assets/taotao/decor/hero.jpg')" :
    isMonari ? "url('/assets/monari/decor/hero_bg.jpg')" :
    isComGa ? "url('/assets/comgaongbach/decor/space_main.jpg')" :
    isTho ? "url('/assets/thocoffee/decor/hero.jpg')" :
    isEmCoffee ? "url('/assets/emcoffee/decor/hero.jpg')" :
    isHanHuyen ? "url('/assets/hanhuyen/Ảnh bìa.jpg')" :
    isCochin ? "url('/assets/cochin/Ảnh bìa.jpg')" :
    isComTam ? "url('/assets/comtamno/hero.jpg')" :
    isSamHouse ? "url('/assets/samhouse/decor/hero_bg.jpg')" :
    isMonQuanChat ? "url('/assets/monquanchat/decor/hero_bg.jpg')" :
    isHoaTeaRoom ? "url('/assets/hoatearoom/decor/hero_bg.jpg')" :
    "url('/assets/images/hero_img.jpg')";

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
            backgroundImage: heroBg,
            backgroundSize: "cover", backgroundPosition: "center",
          }}
        />

        {/* Overlays */}
        <div style={{
          position: "absolute", inset: 0,
          background: isTaoTao
            ? "linear-gradient(135deg, rgba(35,18,10,0.85) 0%, rgba(95,45,20,0.75) 50%, rgba(35,18,10,0.8) 100%)"
            : (isMonari
              ? "linear-gradient(135deg, rgba(35,15,10,0.85) 0%, rgba(95,40,25,0.75) 50%, rgba(35,15,10,0.8) 100%)"
              : (isComGa
                ? "linear-gradient(135deg, rgba(35,15,5,0.85) 0%, rgba(120,53,15,0.75) 50%, rgba(35,15,5,0.8) 100%)"
                : (isTho
                  ? "linear-gradient(135deg, rgba(20,10,5,0.88) 0%, rgba(92,61,46,0.78) 50%, rgba(20,10,5,0.85) 100%)"
                  : (isEmCoffee
                    ? "linear-gradient(135deg, rgba(25,18,12,0.85) 0%, rgba(85,55,30,0.75) 50%, rgba(25,18,12,0.8) 100%)"
                    : (isHanHuyen
                      ? "linear-gradient(135deg, rgba(20,26,22,0.85) 0%, rgba(65,90,72,0.75) 50%, rgba(20,26,22,0.8) 100%)"
                      : (isCochin
                        ? "linear-gradient(135deg, rgba(15,28,20,0.85) 0%, rgba(42,89,68,0.75) 50%, rgba(15,28,20,0.8) 100%)"
                        : (isComTam
                          ? "linear-gradient(135deg, rgba(30,15,5,0.85) 0%, rgba(100,45,10,0.75) 50%, rgba(30,15,5,0.8) 100%)"
                          : (isSamHouse 
                              ? "linear-gradient(135deg, rgba(20,10,5,0.85) 0%, rgba(80,40,15,0.75) 50%, rgba(20,10,5,0.8) 100%)"
                              : (isMonQuanChat
                                  ? "linear-gradient(135deg, rgba(30,10,10,0.85) 0%, rgba(90,20,20,0.75) 50%, rgba(30,10,10,0.8) 100%)"
                                  : (isHoaTeaRoom
                                      ? "linear-gradient(135deg, rgba(6,18,12,0.85) 0%, rgba(30,70,40,0.75) 50%, rgba(6,18,12,0.8) 100%)"
                                      : "linear-gradient(135deg, rgba(15,31,18,0.85) 0%, rgba(47,91,62,0.75) 50%, rgba(15,31,18,0.8) 100%)"))))))))))
        }} />

        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center bottom, rgba(255,255,255,0.08) 0%, transparent 70%)"
        }} />

        {/* Content */}
        <div
          style={{
            position: "relative", zIndex: 2,
            textAlign: "center", padding: "0 24px",
            maxWidth: 850,
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
                border: "1px solid var(--matcha)",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em",
              }}>
                {isTaoTao ? "🍎" : (isMonari ? "🥮" : (isComGa ? "🍗" : (isTho ? "☕" : (isEmCoffee ? "☕" : (isHanHuyen ? "☕" : (isCochin ? "🌿" : (isComTam ? "🌾" : (isSamHouse ? "☕" : (isMonQuanChat ? "🍲" : (isHoaTeaRoom ? "🍃" : "🍵"))))))))))}
                {isTaoTao ? "Táo Tào cà phê · Cà Phê Muối & Trà Kem Phô Mai" :
                 isMonari ? "MONARI · Bánh Ngọt Thủ Công & Trà Thơm" :
                 isComGa ? "Cơm Gà Ông Bách · Cơm Gà Luộc & Gà Quay Gia Truyền" :
                 isTho ? "THÔ'S Artisan Coffee · Cà Phê Thủ Công & Bánh Nướng" :
                 isEmCoffee ? "Em Coffee · Cà Phê Rang Mộc & Không Gian Xanh" :
                 isHanHuyen ? "Quán Nước Hàn Huyên · Hoài Niệm & Bình Yên" :
                 isCochin ? "Cochin Café · Nhà Kính Bistro & Trà Hoa Nhiệt Đới" :
                 isComTam ? "Cơm Tấm Ngọ · Truyền Thống · Đậm Đà" :
                 isSamHouse ? "Cafe Sam Houses · Cà Phê · Kết Nối" :
                 isMonQuanChat ? "Món Quảng Chất · Đặc Sản Miền Trung" :
                 isHoaTeaRoom ? "Hòa Tea Room · Trà Sữa · Vẽ Ly" :
                 "Yakishime · Trà Đạo Zen · Uji Matcha"}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              className="sumie-fade"
              variants={fadeUp} 
              style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(52px, 8vw, 92px)", fontWeight: 700,
              color: "#fff", margin: "0 0 16px",
              lineHeight: 1.0, letterSpacing: "-0.02em",
            }}>
              {isTaoTao ? (
                <>
                  Táo Tào cà phê<br />
                  <span style={{ color: "var(--matcha-light)", fontStyle: "italic" }}>Cà Phê Kem Muối & Trà Phô Mai</span>
                </>
              ) : isMonari ? (
                <>
                  MONARI<br />
                  <span style={{ color: "var(--matcha-light)", fontStyle: "italic" }}>Bánh Ngọt Thủ Công & Trà Thơm</span>
                </>
              ) : isComGa ? (
                <>
                  Cơm Gà Ông Bách<br />
                  <span style={{ color: "var(--matcha-light)", fontStyle: "italic" }}>Hương Vị Gia Truyền Đậm Đà</span>
                </>
              ) : isTho ? (
                <>
                  THÔ'S Artisan Coffee<br />
                  <span style={{ color: "var(--matcha-light)", fontStyle: "italic" }}>Cà Phê Thủ Công & Không Gian Mộc Mạc</span>
                </>
              ) : isEmCoffee ? (
                <>
                  Em Coffee<br />
                  <span style={{ color: "var(--matcha-light)", fontStyle: "italic" }}>Không Gian & Cà Phê Rang Mộc</span>
                </>
              ) : isHanHuyen ? (
                <>
                  Quán Nước Hàn Huyên<br />
                  <span style={{ color: "var(--matcha-light)", fontStyle: "italic" }}>Chuyện Trò & Hoài Niệm Bình Yên</span>
                </>
              ) : isCochin ? (
                <>
                  Cochin Café<br />
                  <span style={{ color: "var(--matcha-light)", fontStyle: "italic" }}>Bistro Nhà Kính & Trà Thảo Mộc</span>
                </>
              ) : isComTam ? (
                <>
                  Cơm Tấm Ngọ<br />
                  <span style={{ color: "var(--matcha-light)", fontStyle: "italic" }}>Đậm Đà Vị Quê Hương</span>
                </>
              ) : isSamHouse ? (
                <>
                  Sam Houses<br />
                  <span style={{ color: "var(--matcha-light)", fontStyle: "italic" }}>Hương Vị Khó Quên</span>
                </>
              ) : isMonQuanChat ? (
                <>
                  Món Quảng Chất<br />
                  <span style={{ color: "var(--matcha-light)", fontStyle: "italic" }}>Đậm Đà Vị Miền Trung</span>
                </>
              ) : isHoaTeaRoom ? (
                <>
                  Hòa Tea Room<br />
                  <span style={{ color: "var(--matcha-light)", fontStyle: "italic" }}>Nhịp Sống Chậm Lại</span>
                </>
              ) : (
                <>
                  Mỗi Ngụm Trà<br />
                  <span style={{ color: "var(--matcha-light)", fontStyle: "italic" }}>Một Câu Chuyện Zen</span>
                </>
              )}
            </motion.h1>

            {/* Sub */}
            <motion.p variants={fadeUp} style={{
              fontSize: "clamp(16px, 2.2vw, 19px)", color: "rgba(255,255,255,0.85)",
              maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.7,
            }}>
              {isTaoTao
                ? "Cà phê kem muối béo ngậy sánh mịn · Trà sữa Ô Long phô mai đậm đà · Chanh leo dừa non thanh mát trong không gian ấm cúng"
                : isMonari
                ? "Set bánh trung thu thủ công cao cấp · Coco Matcha tươi mát · Nước dừa quế hoa thanh ngọt & không gian sofa sang trọng"
                : isComGa
                ? "Cơm gà luộc da vàng giòn ngọt thịt · Cơm gà quay xém cạnh thơm lừng · Sốt xá xíu đậm đà & nước sâm bí đao thanh mát"
                : isTho
                ? "Cold Brew tắc thanh mát · Cà phê kem muối béo ngậy · Mulberry Kombucha chua ngọt & Bánh sừng bò nướng bơ Pháp thơm lừng"
                : isEmCoffee
                ? "Phindi hạnh nhân béo ngậy · Trà vải atiso đỏ mát lạnh · Không gian làm việc xanh mát tràn ngập cảm hứng"
                : isHanHuyen
                ? "Phê xỉu ba tầng ngọt ngào · Phê đá rang mộc đậm đà · Tách trà thanh nhã bên hiên nhà hoài niệm bình yên"
                : isCochin
                ? "Trà sữa Ô Long rang nồng nàn · Caffe Latte chuẩn Ý · Bistro nhà kính xanh mát tràn ngập ánh sáng tự nhiên"
                : isComTam 
                ? "Cơm sườn bì chả gia truyền · Sườn nướng mật ong than hồng thơm ngọt · Canh rong biển thanh mát"
                : isSamHouse 
                ? "Cà phê muối béo ngậy · Trà sữa Olong đậm đà · Không gian học tập, làm việc yên tĩnh lý tưởng" 
                : isMonQuanChat
                ? "Mỳ Quảng thơm ngon · Bánh tráng cuốn thịt heo ba chỉ đậm vị · Cao lầu Hội An chuẩn vị miền Trung"
                : isHoaTeaRoom
                ? "Matcha dừa xiêm mát lạnh · Trà sữa lài Mia thơm ngát · Trải nghiệm tô vẽ ly gốm thư giãn"
                : "Matcha ceremonial grade từ Uji · Trà đạo Chado chính thống · Không gian thiền định tĩnh lặng"}
            </motion.p>

            {/* Info pills */}
            <motion.div variants={fadeUp} style={{
              display: "flex", gap: 24, justifyContent: "center", marginTop: 48,
              flexWrap: "wrap",
            }}>
              {[
                { icon: MapPin, text: tenant?.address || "32A Thống Nhất, P. 10, Gò Vấp, TP.HCM" },
                { icon: Clock, text: `${tenant?.openHours || tenant?.openingHours || "07:00 – 22:30"} mỗi ngày` },
                { icon: Star,  text: "4.9 ⭐ (200+ đánh giá)" },
              ].map((p, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  color: "rgba(255,255,255,0.85)", fontSize: 13.5,
                  background: "rgba(0,0,0,0.25)", padding: "6px 14px", borderRadius: 20,
                  backdropFilter: "blur(6px)"
                }}>
                  <p.icon size={15} style={{ color: "var(--matcha-light)" }} />
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
          PHILOSOPHY SECTION
      ══════════════════════════════════════════════════ */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div
            variants={stagger} initial="hidden"
            whileInView="show" viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 64 }}>
              <span style={{ color: "var(--matcha)", fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                {isTaoTao ? "Triết lý Táo Tào" :
                 isMonari ? "Triết lý Monari" :
                 isComGa ? "Triết lý ẩm thực" :
                 isTho ? "Triết lý Thô's Artisan" :
                 isEmCoffee ? "Triết lý Em Coffee" :
                 isHanHuyen ? "Triết lý Hàn Huyên" :
                 isCochin ? "Triết lý Cochin" :
                 isComTam ? "Triết lý ẩm thực" :
                 isSamHouse ? "Triết lý thức uống" :
                 isMonQuanChat ? "Triết lý ẩm thực" :
                 isHoaTeaRoom ? "Triết lý không gian" :
                 "Triết lý Trà đạo Chado"}
              </span>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(34px, 5vw, 52px)",
                fontWeight: 700, color: "var(--text)", margin: "12px 0 0",
                lineHeight: 1.15
              }}>
                {isTaoTao ? "Tinh tế trong từng tách cà phê & ly trà" :
                 isMonari ? "Nghệ thuật bánh ngọt & trà thơm" :
                 isComGa ? "Tinh hoa trong từng đĩa cơm gà" :
                 isTho ? "Mộc mạc nguyên bản & cà phê thủ công" :
                 isEmCoffee ? "Cà phê rang mộc & nguồn cảm hứng xanh" :
                 isHanHuyen ? "Khoảnh khắc bình yên & chuyện trò tâm tình" :
                 isCochin ? "Bistro nhà kính & hương vị thảo mộc tao nhã" :
                 isComTam ? "Tinh hoa trong từng đĩa cơm tấm" :
                 isSamHouse ? "Đậm đà trong từng tách cà phê" :
                 isMonQuanChat ? "Tinh hoa ẩm thực Quảng Nam" :
                 isHoaTeaRoom ? "Nghệ thuật thưởng trà & sáng tạo" :
                 "Nghệ thuật trong từng chén trà"}
              </h2>
              <div style={{ width: 60, height: 2, background: "var(--matcha)", margin: "20px auto 0" }} />
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 28 }}>
              {currentPhilosophies.map((p, i) => (
                <motion.div
                  key={i} variants={fadeUp}
                  whileHover={{ y: -8, scale: 1.01 }}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 24,
                    padding: "40px 28px 32px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 300
                  }}
                >
                  <span style={{
                    position: "absolute", 
                    top: 10, right: 10,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 90, 
                    fontWeight: 800,
                    color: "var(--matcha)",
                    opacity: 0.05,
                    lineHeight: 1, pointerEvents: "none", userSelect: "none"
                  }}>
                    {p.kanji}
                  </span>

                  <div>
                    <span style={{
                      display: "inline-block", padding: "3px 10px", borderRadius: 50,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid var(--border)",
                      color: "var(--matcha)",
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16
                    }}>
                      {p.romaji}
                    </span>

                    <h3 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "0 0 12px",
                      position: "relative", zIndex: 1
                    }}>
                      {p.title}
                    </h3>

                    <p style={{
                      color: "var(--text-muted)", margin: 0,
                      lineHeight: 1.7, fontSize: 14,
                      position: "relative", zIndex: 1
                    }}>
                      {p.desc}
                    </p>
                  </div>

                  <div style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: 16, marginTop: 20,
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: 13, fontWeight: 700, color: "var(--matcha)"
                  }}>
                    {`Hương vị ${tenant?.name || "quán"}`}
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
                  {isComTam || isMonQuanChat ? "Món Ăn Đặc Trưng" : (isMonari ? "Bánh Ngọt & Thức Uống Đặc Trưng" : "Thức Uống Đặc Trưng")}
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
                    <p style={{ fontSize: 44, margin: "0 0 12px" }}>☕</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>Không thể tải danh sách món</p>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 20px" }}>Kết nối tới máy chủ bị gián đoạn. Vui lòng kiểm tra lại.</p>
                    <button onClick={() => window.location.reload()} style={{ padding: "10px 24px", borderRadius: 50, background: "var(--matcha)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Tải lại trang</button>
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
              {`Không gian tại ${tenant?.name || "quán"}`}
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
                  background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.05em" }}>{g.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.85, fontWeight: 500 }}>
                    {tenant?.name || "Không gian quán"}
                  </span>
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
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ marginBottom: 48 }}
          >
            <span style={{ color: "var(--matcha-light)", fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Cảm nhận thực khách
            </span>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 700, color: "#fff", margin: "12px 0 0",
              lineHeight: 1.15
            }}>
              Đánh giá từ khách hàng thân thiết
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
                  background: "rgba(20, 20, 24, 0.75)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid var(--border)",
                  borderRadius: 32,
                  padding: "54px 48px",
                  boxShadow: "var(--shadow-lg)",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <span style={{
                  position: "absolute", top: 12, right: 36,
                  fontSize: 140, fontWeight: 900,
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "rgba(255,255,255,0.05)",
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
                      background: "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(12px)",
                      padding: "8px 18px 8px 10px",
                      borderRadius: "20px",
                      border: "1px solid var(--border)",
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
                        Đánh giá món
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
                    background: "rgba(255, 255, 255, 0.06)",
                    borderLeft: "3px solid var(--matcha)",
                    borderRadius: "10px",
                    padding: "14px 20px",
                    textAlign: "left",
                    maxWidth: "560px",
                    margin: "0 auto 36px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    border: "1px solid var(--border)",
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
                      {`Phản hồi từ ${tenant?.name || "Quán"}`}
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
                  boxShadow: i === activeTestimonial ? "0 2px 10px rgba(255,255,255,0.3)" : "none",
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
              background: "linear-gradient(135deg, var(--forest-dark) 0%, rgba(20,20,24,0.95) 100%)",
              border: "1px solid var(--border)",
              borderRadius: 36,
              padding: "60px 48px",
              boxShadow: "var(--shadow-lg)",
              position: "relative",
              overflow: "hidden",
            }}
          >
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
              {/* Left Column */}
              <div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 12px", borderRadius: 50,
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid var(--border)",
                  color: "var(--matcha-light)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", marginBottom: 18
                }}>
                  🟢 Trực tuyến: Đang mở nhận đặt chỗ
                </span>

                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(36px, 4.5vw, 48px)",
                  fontWeight: 700, color: "#fff", margin: "0 0 16px",
                  lineHeight: 1.15
                }}>
                  {isTaoTao ? "Không gian ấm cúng" :
                   isMonari ? "Góc hẹn sang trọng" :
                   isComGa ? "Bữa ăn gia đình trọn vị" :
                   isTho ? "Không gian mộc mạc Wabi-Sabi" :
                   isEmCoffee ? "Không gian làm việc lý tưởng" :
                   isHanHuyen ? "Góc nhỏ hàn huyên" :
                   isCochin ? "Bistro nhà kính thoáng đãng" :
                   isComTam ? "Bữa ăn ấm cúng" :
                   isSamHouse ? "Không gian ấm áp" :
                   isMonQuanChat ? "Bữa ăn đậm vị" :
                   isHoaTeaRoom ? "Góc nhỏ yên bình" :
                   "Trải nghiệm tĩnh lặng"}<br />
                  <span style={{ color: "var(--matcha)", fontStyle: "italic" }}>
                    {`tại ${tenant?.name || "quán"}`}
                  </span>
                </h2>

                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15.5, lineHeight: 1.7, margin: "0 0 28px", maxWidth: 440 }}>
                  {`Hãy đặt chỗ trước tại ${tenant?.name || "quán"} để giữ được vị trí bàn yêu thích và thưởng thức những món ăn thơm ngon nhất.`}
                </p>

                {/* Status indicator */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "12px 20px", borderRadius: 16,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)"
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    backgroundColor: "#10B981",
                    boxShadow: "0 0 8px #10B981",
                  }} />
                  <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13.5, fontWeight: 600 }}>
                    Hỗ trợ chọn bàn trực quan trên sơ đồ quán
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

                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>
                      Số lượng khách
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {(isTho ? [1, 2, 3, 4] : [2, 3, 4]).map((num) => {
                        const isSel = quickGuests === num;
                        return (
                          <button
                            key={num}
                            onClick={() => setQuickGuests(num)}
                            style={{
                              flex: 1, padding: "8px 0", borderRadius: 12,
                              border: isSel ? "1.5px solid var(--matcha)" : "1px solid rgba(255,255,255,0.15)",
                              background: isSel ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.03)",
                              color: isSel ? "#ffffff" : "rgba(255,255,255,0.75)",
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
                              border: isSel ? "1.5px solid var(--matcha)" : "1px solid rgba(255,255,255,0.15)",
                              background: isSel ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.03)",
                              color: isSel ? "#ffffff" : "rgba(255,255,255,0.75)",
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
                    Tiến hành chọn bàn <ArrowRight size={16} />
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
