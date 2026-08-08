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

// ── Testimonial data ─────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Nguyễn Minh Anh", role: "Foodie & Blogger", rating: 5, text: "Đây là quán matcha chuẩn Nhật nhất tôi từng ghé thăm tại Việt Nam. Không gian yên tĩnh, ánh sáng tự nhiên tuyệt đẹp, và Matcha Oat Latte của họ thực sự đặc biệt!" },
  { name: "Trần Hữu Đức", role: "Nhiếp ảnh gia", rating: 5, text: "Warabi Mochi ở đây nhất định phải thử. Texture mochi tan trong miệng, bột Kinako thơm dịu. Không gian cũng rất aesthetic để chụp ảnh." },
  { name: "Lê Thị Thu Hà", role: "Kiến trúc sư", rating: 5, text: "Mỗi tuần tôi đều ghé uống Usucha. Cách pha trà theo nghi thức Chado truyền thống làm tôi rất xúc động. Nhân viên am hiểu và tận tâm." },
  { name: "Phạm Quốc Toàn", role: "Lập trình viên", rating: 5, text: "Iced Matcha Latte hoàn hảo để làm việc. Vừa uống vừa code cả buổi sáng mà không cần caffeine quá đà. Quán wifi tốt, ghế thoải mái." },
];

const COM_TAM_TESTIMONIALS = [
  { name: "Nguyễn Minh Anh", role: "Foodie & Blogger", rating: 5, text: "Cơm tấm ở đây ngon xuất sắc, sườn nướng mật ong vừa mềm vừa đậm đà, nước mắm kẹo chua ngọt chuẩn vị Sài Gòn luôn!" },
  { name: "Trần Hữu Đức", role: "Nhiếp ảnh gia", rating: 5, text: "Không gian quán sạch sẽ, thoáng mát. Bún thịt nướng đầy đặn, thịt thơm nức mũi, chả giò giòn rụm ăn rất đã." },
  { name: "Lê Thị Thu Hà", role: "Kiến trúc sư", rating: 5, text: "Cơm tấm Long Xuyên hạt nhuyễn ăn kèm bì, trứng kho rất ngon. Quán phục vụ nhanh nhẹn dù lúc nào cũng đông khách." },
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

const GALLERY = [
  { url: "/assets/yakishime/space/khong_gian_quan.jpg", h: 280, label: "Không gian quán ấm cúng" },
  { url: "/assets/yakishime/space/khong_gian.jpg", h: 220, label: "Góc thiền tĩnh lặng" },
  { url: "/assets/yakishime/space/ko_gian_quan.jpg", h: 260, label: "Cửa sổ trúc xanh" },
  { url: "/assets/yakishime/space/ko_gian_1.jpg", h: 220, label: "Kệ trưng bày gốm sứ tinh tế" },
  { url: "/assets/yakishime/space/ko_gian.jpg", h: 280, label: "Đèn nghệ thuật lá sen" },
  { url: "/assets/yakishime/decor/img_6260.png", h: 240, label: "Bình gốm Nhật Bản" },
  { url: "/assets/yakishime/decor/img_6261.png", h: 260, label: "Lối vào an nhiên" },
  { url: "/assets/yakishime/decor/img_6262.png", h: 220, label: "Tĩnh lặng thiền đạo" },
  { url: "/assets/yakishime/decor/img_6263.png", h: 280, label: "Bình hoa nghệ thuật" },
  { url: "/assets/yakishime/decor/img_6265.png", h: 260, label: "Cây thông nghệ thuật" },
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
  { url: "/assets/samhouse/decor/img_4903.jpg", h: 280, label: "Lối lên lầu" },
  { url: "/assets/samhouse/decor/img_4904.jpg", h: 240, label: "Đội ngũ nhân viên thân thiện" },
  { url: "/assets/samhouse/decor/img_4905.jpg", h: 260, label: "Đội ngũ nhân viên thân thiện" },
];

const MON_QUAN_CHAT_GALLERY = [
  { url: "/assets/monquanchat/tables/ban_6.jpg", h: 280, label: "Không gian mộc mạc đậm chất quê" },
  { url: "/assets/monquanchat/decor/decor_2.jpg", h: 220, label: "Hồ cá Koi thư giãn ngoài trời" },
  { url: "/assets/monquanchat/tables/ban_7.jpg", h: 260, label: "Góc sân vườn thoáng đãng" },
  { url: "/assets/monquanchat/tables/ban_1.jpg", h: 220, label: "Không gian trong nhà máy lạnh" },
];

// ── Philosophy Watermarks & Pillars ───────────────────────────────────────────
const PHILOSOPHIES = [
  {
    kanji: "和",
    romaji: "WA",
    title: "Hài Hòa",
    desc: "Cân bằng âm dương giữa con người và thiên nhiên. Trà ngon chắt lọc tinh hoa cỏ cây, hòa quyện tâm hồn thanh tịnh."
  },
  {
    kanji: "敬",
    romaji: "KEI",
    title: "Tôn Kính",
    desc: "Trân trọng từng tri kỷ ghé thăm. Nghi thức pha chế tỉ mỉ thể hiện lòng hiếu khách chân thành và sự tôn kính sâu sắc."
  },
  {
    kanji: "清",
    romaji: "SEI",
    title: "Thanh Khiết",
    desc: "Tinh sạch trong tâm hồn và nguyên liệu. Lá trà organic tinh tuyển từ Uji hòa cùng dòng nước suối ngọt lành thanh mát."
  },
  {
    kanji: "寂",
    romaji: "JAKU",
    title: "Tĩnh Lặng",
    desc: "Sự an nhiên tự tại đạt được sau khi tĩnh tâm. Đắm mình vào tĩnh lặng thanh nhã để tìm lại bản ngã bình yên."
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const COM_TAM_PHILOSOPHIES = [
  {
    kanji: "Chọn",
    romaji: "CHỌN",
    title: "Tuyển Chọn",
    desc: "Nguyên liệu tươi ngon tinh tuyển mỗi ngày. Gạo tấm thơm dẻo cùng sườn heo tẩm ướp mật ong gia truyền đặc sắc."
  },
  {
    kanji: "Lửa",
    romaji: "LỬA",
    title: "Lửa Hồng",
    desc: "Sườn được nướng trực tiếp trên bếp than hồng đỏ rực, giữ trọn vị ngọt tự nhiên, thơm nức mũi khi chín tới."
  },
  {
    kanji: "Vị",
    romaji: "VỊ",
    title: "Đậm Đà",
    desc: "Nước mắm kẹo chua ngọt gia truyền sánh mịn đậm vị, linh hồn của đĩa cơm tấm chuẩn vị miền Nam."
  },
  {
    kanji: "Tâm",
    romaji: "TÂM",
    title: "Chân Thành",
    desc: "Phục vụ thực khách bằng cả tấm lòng. Mang đến bữa ăn ngon miệng, ấm cúng và đầy ắp hương vị gia đình."
  }
];

const SAM_HOUSE_PHILOSOPHIES = [
  {
    kanji: "Hương",
    romaji: "HƯƠNG",
    title: "Hương Thơm",
    desc: "Hạt cà phê Robusta và Arabica tuyển chọn kỹ lưỡng, rang xay tại chỗ lan tỏa hương thơm nồng nàn quyến rũ."
  },
  {
    kanji: "Chất",
    romaji: "CHẤT",
    title: "Chất Lượng",
    desc: "Nguyên liệu tự nhiên sạch sẽ, sữa tươi thanh trùng béo mịn kết hợp trà hảo hạng mang lại thức uống mát lành tròn vị."
  },
  {
    kanji: "Tâm",
    romaji: "TÂM",
    title: "Chân Thành",
    desc: "Pha chế bằng cả sự cẩn thận và phục vụ bằng cả tấm lòng, mang đến cho thực khách những ly đồ uống hoàn hảo nhất."
  },
  {
    kanji: "Ấm",
    romaji: "ẤM",
    title: "Ấm Cúng",
    desc: "Không gian tông gỗ ấm áp, ánh sáng dịu nhẹ là nơi lý tưởng để tụ họp bạn bè, học tập làm việc hay thư giãn riêng tư."
  }
];

const MON_QUAN_CHAT_PHILOSOPHIES = [
  {
    kanji: "Vị",
    romaji: "VỊ",
    title: "Hương Vị Quảng",
    desc: "Nước nhân ngọt lịm từ tôm thịt cùng mắm nêm gia truyền, mang trọn tinh hoa ẩm thực xứ Quảng nồng ấm."
  },
  {
    kanji: "Chất",
    romaji: "CHẤT",
    title: "Chất Lượng",
    desc: "Rau rừng, bánh tráng nướng giòn rụm kết hợp thịt heo ba chỉ ngọt thơm tự nhiên sạch sẽ chuẩn VietGAP."
  },
  {
    kanji: "Mộc",
    romaji: "MỘC",
    title: "Mộc Mạc",
    desc: "Thiết kế không gian mang đậm bản sắc quê nhà miền Trung thanh bình, chân chất, tạo sự thoải mái gần gũi."
  },
  {
    kanji: "Tâm",
    romaji: "TÂM",
    title: "Tâm Huyết",
    desc: "Mang cả tấm lòng gửi gắm vào từng sợi mì Cao lầu, đĩa bánh xèo giòn tan, phục vụ quý khách như người thân."
  }
];

const HOA_TEA_ROOM_TESTIMONIALS = [
  { name: "Nguyễn Minh Anh", role: "Khách hàng thân thiết", rating: 5, text: "Trà sữa bắp ASA rất thơm ngon và ngọt bùi tự nhiên. Không gian quán mang tông gỗ xanh cực kỳ tinh tế và thư giãn!" },
  { name: "Trần Hữu Đức", role: "Freelancer", rating: 5, text: "Góc bàn N2.4 cạnh cửa sổ là địa điểm làm việc yêu thích của tôi. Có đầy đủ ổ điện, wifi ổn định và không gian thì cực kỳ yên tĩnh." },
  { name: "Lê Thị Thu Hà", role: "Nhà thiết kế đồ họa", rating: 5, text: "Nước uống ngon miệng, đặc biệt là KUMORI kem tiramisu béo mịn. Trải nghiệm tô vẽ ly ở đây rất thú vị và đậm chất nghệ thuật." },
  { name: "Phạm Quốc Toàn", role: "Khách quen cuối tuần", rating: 5, text: "Cực kỳ thích Matcha Latte Coldwhisk của quán. Matcha được đánh bọt lạnh công phu, uống rất thanh mát và hậu ngọt dễ chịu." }
];

const HOA_TEA_ROOM_GALLERY = [
  { url: "/assets/hoatearoom/decor/decor_1.jpg", h: 280, label: "Góc phòng trà mộc mạc" },
  { url: "/assets/hoatearoom/decor/decor_2.jpg", h: 220, label: "Ban công tầng 2 thoáng đãng" },
  { url: "/assets/hoatearoom/decor/decor_3.jpg", h: 260, label: "Kệ sách gỗ và hoa sen" },
  { url: "/assets/hoatearoom/decor/decor_4.jpg", h: 220, label: "Góc thưởng trà tĩnh lặng" },
  { url: "/assets/hoatearoom/menu/asa_corn_matcha.jpg", h: 280, label: "Matcha bắp ASA đặc trưng" },
  { url: "/assets/hoatearoom/menu/workshop_ve_ly.jpg", h: 240, label: "Workshop tô vẽ ly" },
  { url: "/assets/hoatearoom/menu/flower_box.jpg", h: 260, label: "Hộp quà Flower Box trà sữa" }
];

const HOA_TEA_ROOM_PHILOSOPHIES = [
  {
    kanji: "Hương",
    romaji: "HƯƠNG",
    title: "Hương Thơm",
    desc: "Hương thơm nồng nàn quyến rũ từ bột trà xanh Nhật Bản thượng hạng quyện cùng lớp sữa tươi béo ngậy."
  },
  {
    kanji: "Chất",
    romaji: "CHẤT",
    title: "Chất Lượng",
    desc: "Nguyên liệu tự nhiên thanh sạch, matcha Uji nhập khẩu trực tiếp kết hợp sữa tươi thanh trùng béo mịn tốt cho sức khỏe."
  },
  {
    kanji: "Mộc",
    romaji: "MỘC",
    title: "Mộc Mạc",
    desc: "Thiết kế không gian tối giản, mang đậm sắc màu thiền định tĩnh lặng, mang lại sự bình yên thư thái trong tâm hồn."
  },
  {
    kanji: "Tâm",
    romaji: "TÂM",
    title: "Tận Tâm",
    desc: "Mỗi tách trà đều được pha chế tỉ mỉ thủ công, gửi gắm trọn vẹn sự tận tâm chân thành tới quý khách."
  }
];

const EM_COFFEE_TESTIMONIALS = [
  { name: "Nguyễn Minh Anh", role: "Học sinh & Freelancer", rating: 5, text: "Không gian Em Coffee cực kỳ ấm áp và yên tĩnh. Bàn có đầy đủ ổ cắm điện, wifi nhanh, cà phê phindi hạnh nhân thì béo ngậy siêu ngon!" },
  { name: "Trần Hữu Đức", role: "Lập trình viên", rating: 5, text: "Trà vải atiso tươi đỏ au thanh mát, vị ngọt dịu sảng khoái. Góc bàn làm việc nhóm 6 người rất rộng rãi và tiện lợi." },
  { name: "Lê Thị Thu Hà", role: "Nhà thiết kế nội thất", rating: 5, text: "Tông gỗ trầm ấm cùng ánh sáng vàng nhẹ nhàng tạo cảm hứng sáng tạo rất tốt. Trà dâu xanh nhài thơm ngát và dễ chịu." },
  { name: "Phạm Quốc Toàn", role: "Khách quen cuối tuần", rating: 5, text: "Cacao Caramel thơm nồng bùi béo kết hợp không gian acoustic êm dịu, là nơi hẹn hò và thư giãn lý tưởng cuối tuần." }
];

const EM_COFFEE_GALLERY = [
  { url: "/assets/emcoffee/decor/hero.jpg", h: 280, label: "Mặt tiền và không gian đón khách" },
  { url: "/assets/emcoffee/decor/space_1.jpg", h: 220, label: "Góc bàn học tập & làm việc" },
  { url: "/assets/emcoffee/decor/space_2.jpg", h: 260, label: "Không gian tông gỗ ấm cúng" },
  { url: "/assets/emcoffee/decor/space_3.jpg", h: 220, label: "Góc ngồi thư giãn bên cửa sổ" },
  { url: "/assets/emcoffee/decor/space_4.jpg", h: 280, label: "Không gian acoustic nhẹ nhàng" },
  { url: "/assets/emcoffee/decor/space_5.jpg", h: 240, label: "Góc check-in nghệ thuật" },
  { url: "/assets/emcoffee/decor/space_6.jpg", h: 260, label: "Khu vực làm việc nhóm rộng rãi" },
  { url: "/assets/emcoffee/decor/space_7.jpg", h: 220, label: "Ánh sáng dịu nhẹ ấm áp" },
  { url: "/assets/emcoffee/decor/space_8.jpg", h: 280, label: "Bàn riêng tư yên tĩnh" },
  { url: "/assets/emcoffee/decor/space_9.jpg", h: 240, label: "Không gian chill cuối tuần" }
];

const EM_COFFEE_PHILOSOPHIES = [
  {
    kanji: "Mộc",
    romaji: "MỘC",
    title: "Mộc Mạc",
    desc: "Không gian tông gỗ ấm áp, gần gũi với ánh đèn vàng nhẹ nhàng, mang lại cảm giác bình yên thư thái."
  },
  {
    kanji: "Hương",
    romaji: "HƯƠNG",
    title: "Hương Vị",
    desc: "Từng hạt cà phê chọn lọc thơm nồng kết hợp trà hoa quả tươi mát thanh khiết đánh thức mọi giác quan."
  },
  {
    kanji: "Tĩnh",
    romaji: "TĨNH",
    title: "Tĩnh Lặng",
    desc: "Nốt trầm acoustic êm dịu, không gian yên bình để học tập, làm việc và thư giãn giữa phố thị nhộn nhịp."
  },
  {
    kanji: "Tâm",
    romaji: "TÂM",
    title: "Tận Tâm",
    desc: "Tận tâm trong từng ly nước, chu đáo chăm chút từng góc ngồi và ổ cắm điện cho sự thoải mái của bạn."
  }
];

const TAO_TAO_TESTIMONIALS = [
  { name: "Nguyễn Minh Anh", role: "Khách quen Cần Thơ", rating: 5, text: "Cà phê kem muối ở Táo Tào siêu ngon, lớp kem muối béo mặn sánh mịn hòa cùng cà phê đậm đà. Không gian ngồi ngoài trời tán cây rất thoáng mát!" },
  { name: "Trần Hữu Đức", role: "Freelancer & IT", rating: 5, text: "Bàn 8 người trong nhà có đầy đủ ổ cắm điện, máy lạnh mát rượi, nhóm mình chạy deadline cực kỳ năng suất. Hồng trà phô mai cũng rất đậm vị." },
  { name: "Lê Thị Thu Hà", role: "Nhiếp ảnh gia", rating: 5, text: "Góc bàn 2 người ngoài trời chill chill ngắm cảnh chụp hình siêu xinh. Trà sữa Ôlong phô mai thơm nồng và béo ngậy vừa miệng." },
  { name: "Phạm Quốc Toàn", role: "Khách quen cuối tuần", rating: 5, text: "Chanh leo dừa non giải nhiệt cực đỉnh ngày nắng nóng. Quán nằm ở đường Lê Lai yên tĩnh, nhân viên phục vụ nhanh nhẹn dễ thương." }
];

const TAO_TAO_GALLERY = [
  { url: "/assets/taotao/decor/hero.jpg", h: 280, label: "Mặt tiền và lối đón khách" },
  { url: "/assets/taotao/decor/k_gian_1.jpg", h: 220, label: "Không gian ngoài trời thoáng đãng" },
  { url: "/assets/taotao/decor/k_gian_2.jpg", h: 260, label: "Góc ngồi chill ngắm cảnh" },
  { url: "/assets/taotao/decor/k_gian_3.jpg", h: 220, label: "Không gian máy lạnh trong nhà" },
  { url: "/assets/taotao/decor/k_gian_4.jpg", h: 280, label: "Bàn lớn họp nhóm & làm việc" },
  { url: "/assets/taotao/decor/k_gian_5.jpg", h: 240, label: "Góc bàn thư giãn riêng tư" },
  { url: "/assets/taotao/decor/k_gian_6.jpg", h: 260, label: "Ánh sáng tự nhiên ngập tràn" },
  { url: "/assets/taotao/decor/k_gian_7.jpg", h: 220, label: "Tán cây xanh mát ngoài sân" },
];

const TAO_TAO_PHILOSOPHIES = [
  {
    kanji: "Hương",
    romaji: "HƯƠNG",
    title: "Hương Thơm",
    desc: "Cà phê phin rang mộc nguyên chất cùng trà Ôlong tuyển chọn, lưu giữ trọn vẹn hương thơm nồng nàn quyến rũ."
  },
  {
    kanji: "Vị",
    romaji: "VỊ",
    title: "Đậm Vị",
    desc: "Lớp kem muối béo ngậy mặn ngọt hòa quyện lớp phô mai sánh mịn, mang lại trải nghiệm vị giác độc đáo khó quên."
  },
  {
    kanji: "Tĩnh",
    romaji: "TĨNH",
    title: "Thư Thái",
    desc: "Không gian sân vườn dưới bóng cây xanh mát cùng phòng máy lạnh tiện nghi, nơi bạn tìm thấy sự bình yên giữa phố thị."
  },
  {
    kanji: "Tâm",
    romaji: "TÂM",
    title: "Tận Tâm",
    desc: "Phục vụ ân cần chu đáo, chăm chút từng chiếc bàn và ổ cắm điện để mang lại sự tiện nghi nhất cho mỗi khách hàng."
  }
];

const HAN_HUYEN_TESTIMONIALS = [
  { name: "Minh Anh", role: "Khách quen", rating: 5, text: "Không gian quá ưng ý, vừa có bàn nệm ngồi bệt thoải mái vừa có sofa êm ái. Nước uống rất ngon, đặc biệt là Trà đào xanh nhài thanh mát." },
  { name: "Đức Trí", role: "Freelancer", rating: 5, text: "Mình rất thích góc bàn 2 người bên cửa sổ, làm việc siêu tập trung. Phê xĩu ở đây đậm đà, rất tỉnh táo để chạy deadline." },
  { name: "Thu Hà", role: "Sinh viên", rating: 5, text: "Matcha latte thơm lừng, không bị quá ngọt. Góc ngoài trời check-in cực kỳ đẹp với nhiều cây xanh mát mẻ." },
  { name: "Quốc Toàn", role: "Lập trình viên", rating: 5, text: "Quán yên tĩnh, phù hợp để đọc sách hoặc code. Bàn có sẵn ổ điện tiện lợi. Trà vải thanh ngọt mọng nước uống rất đã khát." }
];

const HAN_HUYEN_GALLERY = [
  { url: "/assets/hanhuyen/decor/Ko gian.jpg", h: 280, label: "Không gian Hàn Huyên" },
  { url: "/assets/hanhuyen/decor/Ko gian(1).jpg", h: 220, label: "Góc ngồi yên bình" },
  { url: "/assets/hanhuyen/decor/Ko gian(2).jpg", h: 260, label: "Quán Nước Hàn Huyên" },
  { url: "/assets/hanhuyen/decor/Ko gian(4).jpg", h: 220, label: "Không gian thoáng mát" },
  { url: "/assets/hanhuyen/decor/Ko gian(6).jpg", h: 280, label: "Góc học tập & làm việc" },
  { url: "/assets/hanhuyen/tables/Bàn 2 người (Ngoài trời).jpg", h: 240, label: "Bàn ngoài trời" },
  { url: "/assets/hanhuyen/tables/Bàn 2 người (Trong nhà, ngồi nệm, có ổ điện).jpg", h: 260, label: "Bàn ngồi nệm có ổ điện" },
  { url: "/assets/hanhuyen/tables/Bàn 4 người (Trong nhà)(3).jpg", h: 220, label: "Bàn nhóm trong nhà" },
];

const HAN_HUYEN_PHILOSOPHIES = [
  {
    kanji: "Hàn",
    romaji: "HÀN",
    title: "Hàn Huyên",
    desc: "Không gian lý tưởng để bạn bè gặp gỡ, hàn huyên tâm sự và chia sẻ những khoảnh khắc bình yên sau những giờ làm việc mệt mỏi."
  },
  {
    kanji: "Vị",
    romaji: "VỊ",
    title: "Hương Vị",
    desc: "Mỗi ly nước là một tác phẩm được chăm chút tỉ mỉ, từ cà phê đậm đà đến những ly trà trái cây thanh mát giải nhiệt."
  },
  {
    kanji: "Yên",
    romaji: "YÊN",
    title: "Yên Bình",
    desc: "Không gian được thiết kế với nhiều cây xanh và ánh sáng tự nhiên, mang lại cảm giác thư thái và an tĩnh tuyệt đối."
  }
];

const COCHIN_TESTIMONIALS = [
  { name: "Hoàng Nam", role: "Kiến trúc sư", rating: 5, text: "Không gian nhà kính glasshouse tại Vinhomes Grand Park quá tuyệt vời! Ánh sáng tự nhiên chan hòa, trần cao thoáng đãng và ngập tràn cây xanh. Vị Latte thơm lừng béo mịn." },
  { name: "Bích Trâm", role: "Content Creator", rating: 5, text: "Góc bàn ngoài trời tầng 1 và view tầng 2 chụp góc nào cũng như studio Châu Âu. Trà vải hoa hồng thơm quý phái và Trà thanh long đỏ cực kỳ bắt mắt." },
  { name: "Tuấn Kiệt", role: "Lập trình viên", rating: 5, text: "Bàn tầng 2 có ổ cắm điện đầy đủ, quầy bar tầng 1 bàn 6 người rất rộng cho nhóm họp hành. Trà sữa ô long rang vị khói rất đặc trưng và ngon miệng." },
  { name: "Mai Phương", role: "Cư dân Vinhomes", rating: 5, text: "Quán cafe ruột của cả nhà mình mỗi cuối tuần. Sô cô la nóng sánh mịn, các bé rất mê. Không gian xanh mát và thư giãn bậc nhất khu vực." }
];

const COCHIN_GALLERY = [
  { url: "/assets/cochin/decor/Ko gian.jpg", h: 280, label: "Không gian nhà kính Cochin" },
  { url: "/assets/cochin/decor/Ko gian(1).jpg", h: 220, label: "Góc xanh thư giãn" },
  { url: "/assets/cochin/decor/Ko gian(3).jpg", h: 260, label: "Cochin Bistro Cafe" },
  { url: "/assets/cochin/decor/Ko gian(4).jpg", h: 220, label: "Khu vực sảnh đón sáng" },
  { url: "/assets/cochin/decor/Ko gian(5).jpg", h: 280, label: "Khu vườn giếng trời" },
  { url: "/assets/cochin/decor/Ko gian(6).jpg", h: 240, label: "Nội thất gỗ trầm ấm" },
  { url: "/assets/cochin/decor/Ko gian(8).jpg", h: 260, label: "Góc làm việc & Đọc sách" },
  { url: "/assets/cochin/tables/outdoor_t1_2.jpg", h: 240, label: "Bàn ngoài trời Tầng 1" },
  { url: "/assets/cochin/tables/indoor_t1_bar_6.jpg", h: 260, label: "Bàn lớn họp nhóm Tầng 1" },
  { url: "/assets/cochin/tables/indoor_t2_window_2.jpg", h: 220, label: "Bàn view cửa sổ Tầng 2" },
];

const COCHIN_PHILOSOPHIES = [
  {
    kanji: "Kính",
    romaji: "GLASSHOUSE",
    title: "Nhà Kính Châu Âu",
    desc: "Không gian nhà kính glasshouse hiện đại ngập tràn ánh sáng tự nhiên tại Vinhomes Grand Park, mang lại nguồn cảm hứng làm việc và thư giãn bất tận."
  },
  {
    kanji: "Vị",
    romaji: "LATTE ART",
    title: "Cà Phê & Sô Cô La",
    desc: "Từng tách Latte nghệ thuật thơm lừng cùng Sô cô la béo mịn, đậm đà được các barista tài hoa pha chế tỉ mỉ mỗi ngày."
  },
  {
    kanji: "Trà",
    romaji: "TEA & FRESH",
    title: "Trà Ô Long & Trái Cây",
    desc: "Trà sữa ô long rang thơm nồng hương khói đặc trưng cùng các dòng trà thanh long đỏ, trà vải hoa hồng và trà đào tươi mát giải nhiệt."
  },
  {
    kanji: "Kết",
    romaji: "CONNECT",
    title: "Không Gian Gắn Kết",
    desc: "Hệ thống bàn ghế gỗ sang trọng 2 tầng, trang bị đầy đủ ổ cắm điện, bàn nhóm họp 6 người và bàn view công viên thoáng đãng."
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const isComTam = tenant?.name?.toLowerCase().includes("cơm tấm") || tenant?.tenantName?.toLowerCase().includes("cơm tấm") || localStorage.getItem("tenant_is_comtam") === "true";
  const isSamHouse = tenant?.name?.toLowerCase().includes("sam house") || tenant?.tenantName?.toLowerCase().includes("samhouse") || localStorage.getItem("tenant_is_samhouse") === "true";
  const isMonQuanChat = tenant?.name?.toLowerCase().includes("quảng") || tenant?.tenantName?.toLowerCase().includes("monquanchat") || tenant?.tenantName?.toLowerCase().includes("monquangchat") || localStorage.getItem("tenant_is_monquanchat") === "true";
  const isHoaTeaRoom = tenant?.name?.toLowerCase().includes("hoa") || tenant?.name?.toLowerCase().includes("hoà") || tenant?.name?.toLowerCase().includes("hòa") || tenant?.tenantName?.toLowerCase().includes("hoa") || localStorage.getItem("tenant_is_hoatearoom") === "true";
  const isEmCoffee = tenant?.name?.toLowerCase().includes("em coffee") || tenant?.name?.toLowerCase() === "em" || tenant?.tenantName?.toLowerCase().includes("emcoffee") || localStorage.getItem("tenant_is_emcoffee") === "true";
  const isTaoTao = tenant?.name?.toLowerCase().includes("táo") || tenant?.name?.toLowerCase().includes("taotao") || tenant?.tenantName?.toLowerCase().includes("taotao") || localStorage.getItem("tenant_is_taotao") === "true";
  const isHanHuyen = tenant?.name?.toLowerCase().includes("hàn") || tenant?.name?.toLowerCase().includes("hanhuyen") || tenant?.tenantName?.toLowerCase().includes("hanhuyen") || localStorage.getItem("tenant_is_hanhuyen") === "true";
  const isCochin = tenant?.name?.toLowerCase().includes("cochin") || tenant?.tenantName?.toLowerCase().includes("cochin") || localStorage.getItem("tenant_is_cochin") === "true";

  const currentPhilosophies = isComTam ? COM_TAM_PHILOSOPHIES : (isSamHouse ? SAM_HOUSE_PHILOSOPHIES : (isMonQuanChat ? MON_QUAN_CHAT_PHILOSOPHIES : (isHoaTeaRoom ? HOA_TEA_ROOM_PHILOSOPHIES : (isEmCoffee ? EM_COFFEE_PHILOSOPHIES : (isTaoTao ? TAO_TAO_PHILOSOPHIES : (isHanHuyen ? HAN_HUYEN_PHILOSOPHIES : (isCochin ? COCHIN_PHILOSOPHIES : PHILOSOPHIES)))))));
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [reviewsList, setReviewsList] = useState(isComTam ? COM_TAM_TESTIMONIALS : (isSamHouse ? SAM_HOUSE_TESTIMONIALS : (isMonQuanChat ? MON_QUAN_CHAT_TESTIMONIALS : (isHoaTeaRoom ? HOA_TEA_ROOM_TESTIMONIALS : (isEmCoffee ? EM_COFFEE_TESTIMONIALS : (isTaoTao ? TAO_TAO_TESTIMONIALS : (isHanHuyen ? HAN_HUYEN_TESTIMONIALS : (isCochin ? COCHIN_TESTIMONIALS : TESTIMONIALS))))))));
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const heroRef = useRef(null);
  const currentGallery = isComTam ? COM_TAM_GALLERY : (isSamHouse ? SAM_HOUSE_GALLERY : (isMonQuanChat ? MON_QUAN_CHAT_GALLERY : (isHoaTeaRoom ? HOA_TEA_ROOM_GALLERY : (isEmCoffee ? EM_COFFEE_GALLERY : (isTaoTao ? TAO_TAO_GALLERY : (isHanHuyen ? HAN_HUYEN_GALLERY : (isCochin ? COCHIN_GALLERY : GALLERY)))))));
  const duplicatedGallery = [...currentGallery, ...currentGallery];

  // No Shoji door curtain animation

  // States for Quick Booking Form
  const [quickGuests, setQuickGuests] = useState(2);
  const [quickDate, setQuickDate]     = useState("Hôm nay");

  // Parallax scroll (background only – content stays visible)
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 160]);

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

        // If fetch fails but we haven't reached max retries, retry in a bit
        if ((!res.ok || !testRes.ok) && retryCount < maxRetries) {
          retryCount++;
          setTimeout(loadData, retryDelay);
          return;
        }

        const loadedProducts = res.ok ? res.data : [];
        setProducts(loadedProducts);
        
        const enrichFallback = () => {
          if (loadedProducts.length > 0) {
            const fallbackList = isComTam ? COM_TAM_TESTIMONIALS : (isSamHouse ? SAM_HOUSE_TESTIMONIALS : (isMonQuanChat ? MON_QUAN_CHAT_TESTIMONIALS : (isHoaTeaRoom ? HOA_TEA_ROOM_TESTIMONIALS : (isEmCoffee ? EM_COFFEE_TESTIMONIALS : (isTaoTao ? TAO_TAO_TESTIMONIALS : (isHanHuyen ? HAN_HUYEN_TESTIMONIALS : (isCochin ? COCHIN_TESTIMONIALS : TESTIMONIALS)))))));
            const enriched = fallbackList.map(t => {
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
          // Only keep reviews associated with a valid menu item in our database
          const menuReviews = testRes.data.filter(r => {
            if (!r.menu_id) return false;
            return loadedProducts.some(p => String(p.id) === String(r.menu_id));
          });

          if (menuReviews.length > 0) {
            // Filter and sort by rating desc, slice top 5
            const topReviews = [...menuReviews]
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 5);

            const mapped = topReviews.map(r => {
              const product = loadedProducts.find(p => String(p.id) === String(r.menu_id));
              return {
                id: r.id,
                name: r.user?.full_name || "Khách Hàng Trải Nghiệm",
                role: `Khách hàng đánh giá · ${product.name}`,
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
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    if (reviewsList.length === 0) return;
    const t = setInterval(() => {
      setActiveTestimonial((i) => (i + 1) % reviewsList.length);
    }, 4500);
    return () => clearInterval(t);
  }, [reviewsList.length]);

  const bestSellers = products.filter((p) => ["best_seller", "signature"].includes(p.tag)).slice(0, 3);

  const handleQuickBook = () => {
    const targetDate = quickDate === "Hôm nay"
      ? new Date().toISOString().split("T")[0]
      : new Date(Date.now() + 86400000).toISOString().split("T")[0];
    navigate("/booking", { state: { guests: quickGuests, date: targetDate } });
  };

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
            backgroundImage: isComTam ? "url('/assets/comtamno/hero.jpg')" : (isSamHouse ? "url('/assets/samhouse/decor/hero_bg.jpg')" : (isMonQuanChat ? "url('/assets/monquanchat/decor/hero_bg.jpg')" : (isHoaTeaRoom ? "url('/assets/hoatearoom/decor/hero_bg.jpg')" : (isEmCoffee ? "url('/assets/emcoffee/decor/hero.jpg')" : (isTaoTao ? "url('/assets/taotao/decor/hero.jpg')" : (isHanHuyen ? "url('/assets/hanhuyen/Ảnh bìa.jpg')" : (isCochin ? "url('/assets/cochin/Ảnh bìa.jpg')" : "url('/assets/images/hero_img.jpg')"))))))),
            backgroundSize: "cover", backgroundPosition: "center",
          }}
        />

        {/* Overlays */}
        <div style={{
          position: "absolute", inset: 0,
          background: isComTam
            ? "linear-gradient(135deg, rgba(30,15,5,0.85) 0%, rgba(100,45,10,0.75) 50%, rgba(30,15,5,0.8) 100%)"
            : (isSamHouse 
                ? "linear-gradient(135deg, rgba(20,10,5,0.85) 0%, rgba(80,40,15,0.75) 50%, rgba(20,10,5,0.8) 100%)"
                : (isMonQuanChat
                    ? "linear-gradient(135deg, rgba(30,10,10,0.85) 0%, rgba(90,20,20,0.75) 50%, rgba(30,10,10,0.8) 100%)"
                    : (isHoaTeaRoom
                        ? "linear-gradient(135deg, rgba(6,18,12,0.85) 0%, rgba(30,70,40,0.75) 50%, rgba(6,18,12,0.8) 100%)"
                        : (isEmCoffee
                            ? "linear-gradient(135deg, rgba(25,14,7,0.85) 0%, rgba(85,45,18,0.75) 50%, rgba(25,14,7,0.8) 100%)"
                            : (isTaoTao
                              ? "rgba(155, 46, 34, 0.45)"
                              : (isHanHuyen
                                ? "rgba(97, 130, 105, 0.45)"
                                : (isCochin
                                  ? "linear-gradient(135deg, rgba(15,35,25,0.85) 0%, rgba(42,89,68,0.75) 50%, rgba(15,35,25,0.8) 100%)"
                                  : "rgba(141, 175, 90, 0.45)")))))))
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: isComTam
            ? "radial-gradient(ellipse at center bottom, rgba(224,123,57,0.15) 0%, transparent 70%)"
            : (isSamHouse
                ? "radial-gradient(ellipse at center bottom, rgba(139,69,19,0.15) 0%, transparent 70%)"
                : (isMonQuanChat
                    ? "radial-gradient(ellipse at center bottom, rgba(139,26,26,0.15) 0%, transparent 70%)"
                    : (isHoaTeaRoom
                        ? "radial-gradient(ellipse at center bottom, rgba(116,195,142,0.15) 0%, transparent 70%)"
                        : (isEmCoffee
                            ? "radial-gradient(ellipse at center bottom, rgba(160,95,45,0.18) 0%, transparent 70%)"
                            : (isTaoTao
                              ? "rgba(155, 46, 34, 0.15)"
                              : (isHanHuyen
                                ? "rgba(97, 130, 105, 0.15)"
                                : (isCochin
                                  ? "radial-gradient(ellipse at center bottom, rgba(42,89,68,0.2) 0%, transparent 70%)"
                                  : "rgba(141, 175, 90, 0.15)")))))))
        }} />

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
                border: isComTam ? "1px solid rgba(224,123,57,0.4)" : (isSamHouse ? "1px solid rgba(139,69,19,0.4)" : (isMonQuanChat ? "1px solid rgba(139,26,26,0.4)" : (isHoaTeaRoom ? "1px solid rgba(46,111,64,0.4)" : (isEmCoffee ? "1px solid rgba(160,95,45,0.4)" : (isTaoTao ? "1px solid rgba(155,46,34,0.4)" : (isHanHuyen ? "1px solid rgba(97,130,105,0.4)" : (isCochin ? "1px solid rgba(42,89,68,0.5)" : "1px solid rgba(141,175,90,0.4)"))))))),
                background: isComTam ? "rgba(224,123,57,0.12)" : (isSamHouse ? "rgba(139,69,19,0.12)" : (isMonQuanChat ? "rgba(139,26,26,0.12)" : (isHoaTeaRoom ? "rgba(46,111,64,0.12)" : (isEmCoffee ? "rgba(160,95,45,0.12)" : (isTaoTao ? "rgba(155,46,34,0.12)" : (isHanHuyen ? "rgba(97,130,105,0.12)" : (isCochin ? "rgba(42,89,68,0.2)" : "rgba(141,175,90,0.12)"))))))),
                color: isComTam ? "#E07B39" : (isSamHouse ? "#BAAFA8" : (isMonQuanChat ? "#E57373" : (isHoaTeaRoom ? "#9AB3A2" : (isEmCoffee ? "#D4A373" : (isTaoTao ? "#CF4B3C" : (isHanHuyen ? "#7A9D83" : (isCochin ? "#A3DFB5" : "rgba(200,230,160,0.9)"))))))), fontSize: 13, fontWeight: 500, letterSpacing: "0.1em",
              }}>
                {isSamHouse || isEmCoffee || isTaoTao || isHanHuyen || isCochin ? <Coffee size={13} /> : (isMonQuanChat || isComTam ? <Utensils size={13} /> : <Leaf size={13} />)}
                {tenant?.name || tenant?.tenantName ? `${tenant.name || tenant.tenantName} · Không Gian Thưởng Thức` : (isComTam ? "Cơm Tấm · Truyền Thống · Đậm Đà" : (isSamHouse ? "Cà Phê · Trà Sữa · Không Gian" : (isMonQuanChat ? "Món Quảng · Hương Vị · Miền Trung" : (isHoaTeaRoom ? "Hòa Tea Room · Trà Sữa · Vẽ Ly" : (isEmCoffee ? "Em Coffee · Cà Phê · Acoustic" : (isTaoTao ? "Táo Tào · Cà Phê Kem Muối · Chill" : (isHanHuyen ? "Quán Nước Hàn Huyên · Bình Yên · Thư Thái" : (isCochin ? "Cochin Café · Nhà Kính Bistro · Vinhomes Grand Park" : "Matcha · Zen · Cao cấp"))))))))}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              className="sumie-fade"
              variants={fadeUp} 
              style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(52px, 8vw, 96px)", fontWeight: 700,
              color: "#fff", margin: "0 0 16px",
              lineHeight: 1.0, letterSpacing: "-0.03em",
            }}>
              {tenant?.name
                ? tenant.name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
                : (isComTam ? "Cơm Tấm Ngọ" : isSamHouse ? "Sam Houses" : isMonQuanChat ? "Món Quảng Chất" : isHoaTeaRoom ? "Hòa Tea Room" : isEmCoffee ? "Em Coffee" : isTaoTao ? "Táo Tào Cà Phê" : isHanHuyen ? "Quán Nước Hàn Huyên" : isCochin ? "Cochin Café" : "Yakishime")}<br />
              <span style={{ 
                color: isComTam ? "#E07B39" : (isSamHouse ? "var(--matcha)" : (isMonQuanChat ? "#E57373" : (isHoaTeaRoom ? "rgba(163,223,181,0.95)" : (isEmCoffee ? "rgba(230,175,120,0.95)" : (isTaoTao ? "rgba(217,83,79,0.95)" : (isHanHuyen ? "rgba(163,223,181,0.95)" : (isCochin ? "rgba(163,223,181,0.95)" : "rgba(175,215,120,0.95)"))))))), 
                display: "inline-block",
                paddingTop: 8 
              }}>
                {isComTam ? "Đậm Đà Vị Quê Hương" : (isSamHouse ? "Hương Vị Khó Quên" : (isMonQuanChat ? "Đậm Đà Vị Miền Trung" : (isHoaTeaRoom ? "Nhịp Sống Chậm Lại" : (isEmCoffee ? "Góc Nhỏ Bình Yên" : (isTaoTao ? "Kem Muối Phô Mai · Hương Vị Riêng" : (isHanHuyen ? "Chút Yên Bình, Chút Hàn Huyên" : (isCochin ? "Không Gian Nhà Kính · Thưởng Thức Trọn Vị" : "Mỗi Ngụm Trà Một Câu Chuyện")))))))}
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p variants={fadeUp} style={{
              fontSize: "clamp(16px, 2.5vw, 20px)", color: "rgba(255,255,255,0.75)",
              maxWidth: 580, margin: "0 auto 40px", lineHeight: 1.7,
            }}>
              {isComTam 
                ? "Cơm sườn bì chả gia truyền · Sườn nướng mật ong than hồng thơm ngọt · Canh thanh mát tại " + (tenant?.address || "Đông Hòa")
                : (isSamHouse 
                    ? "Cà phê muối béo ngậy · Trà sữa Olong đậm đà · Không gian học tập, làm việc yên tĩnh lý tưởng tại " + (tenant?.address || "Đông Hòa") 
                    : (isMonQuanChat
                        ? "Mỳ Quảng thơm ngon · Bánh tráng cuốn thịt heo ba chỉ đậm vị · Cao lầu Hội An chuẩn vị tại " + (tenant?.address || "Đông Hòa")
                        : (isHoaTeaRoom
                            ? "Matcha dừa xiêm mát lạnh · Trà sữa lài Mia thơm ngát · Trải nghiệm tô vẽ ly gốm thư giãn tại " + (tenant?.address || "Cần Thơ")
                            : (isEmCoffee
                                ? "Cà phê phindi hạnh nhân · Trà hoa atiso tươi thanh mát · Không gian acoustic ấm cúng lý tưởng làm việc tại " + (tenant?.address || "Thủ Đức")
                                : (isTaoTao
                                  ? "Cà phê kem muối béo mặn · Hồng trà & Trà sữa phô mai đậm đà · Không gian sân vườn xanh mát tại " + (tenant?.address || "102/16 Đ. Lê Lai, Cần Thơ")
                                  : (isHanHuyen
                                    ? "Không gian Quán Nước Hàn Huyên · Trà đào xanh nhài thanh mát · Góc làm việc lý tưởng tại " + (tenant?.address || "Cần Thơ")
                                    : (isCochin
                                      ? "Cà phê Latte thượng hạng · Trà sữa & Trà trái cây tươi mát · Không gian nhà kính ngập tràn ánh sáng tại " + (tenant?.address || "Vinhomes Grand Park")
                                      : "Matcha ceremonial grade từ Uji · Trà đạo Chado chính thống · Không gian thiền định tại " + (tenant?.address || "Cần Thơ"))))))))}
            </motion.p>

            {/* Info pills */}
            <motion.div variants={fadeUp} style={{
              display: "flex", gap: 24, justifyContent: "center", marginTop: 48,
              flexWrap: "wrap",
            }}>
              {[
                { icon: MapPin, text: tenant?.address || tenant?.Address || (isCochin ? "58 Đ. D2A, Vinhomes Grand Park, Thủ Đức" : (isHanHuyen ? "160 Đ. 30 Tháng 4, Ninh Kiều, Cần Thơ" : (isTaoTao ? "102/16 Đ. Lê Lai, Ninh Kiều, Cần Thơ" : (isMonQuanChat ? "201 QL1K, Đông Hòa, Dĩ An, Bình Dương" : (isSamHouse ? "Đường GS1, Đông Hòa, Dĩ An, Bình Dương" : (isHoaTeaRoom ? "18/2 Đường số 4, Đông Hòa, Dĩ An, Bình Dương" : (isEmCoffee ? "Thủ Đức, TP. Hồ Chí Minh" : "57 Nguyễn Cư Trinh, Cần Thơ"))))))) },
                { icon: Clock, text: `${tenant?.openHours || tenant?.openingHours || tenant?.OpeningHours || (isCochin ? "07:00 – 22:00" : (isHanHuyen ? "07:00 – 22:00" : (isTaoTao ? "07:30 – 22:30" : (isMonQuanChat ? "10:00 – 22:00" : (isSamHouse ? "07:30 – 22:00" : (isHoaTeaRoom ? "08:30 – 22:00" : (isEmCoffee ? "07:00 – 22:30" : "08:00 – 22:00")))))))} mỗi ngày` },
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
            style={{ width: 4, height: 8, borderRadius: 2, background: "var(--matcha-light)" }}
          />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════
          PHILOSOPHY / ABOUT SECTION
      ══════════════════════════════════════════════════ */}
      <section style={{ padding: "100px 24px", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div
            variants={stagger} initial="hidden"
            whileInView="show" viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 64 }}>
              <span style={{ color: "var(--matcha)", fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                {isComTam ? "Triết lý ẩm thực" : (isSamHouse ? "Triết lý thức uống" : (isMonQuanChat ? "Triết lý ẩm thực" : (isHoaTeaRoom ? "Triết lý không gian" : (isEmCoffee ? "Triết lý thức uống & không gian" : (isTaoTao ? "Triết lý & Giá trị cốt lõi · Táo Tào" : (isHanHuyen ? "Triết lý Quán Nước Hàn Huyên" : (isCochin ? "Triết lý không gian & thức uống" : "Triết lý Trà đạo Chado")))))))}
              </span>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(36px, 5vw, 56px)",
                fontWeight: 700, color: "var(--text)", margin: "12px 0 0",
                lineHeight: 1.1
              }}>
                {isComTam ? "Tinh hoa trong từng đĩa cơm" : (isSamHouse ? "Đậm đà trong từng tách cà phê" : (isMonQuanChat ? "Tinh hoa ẩm thực Quảng Nam" : (isHoaTeaRoom ? "Nghệ thuật thưởng trà chiều" : (isEmCoffee ? "Ấm áp trong từng góc nhỏ" : (isTaoTao ? "Đặc Sắc Trong Từng Ly Kem Muối" : (isHanHuyen ? "Nơi lưu giữ những kỷ niệm bình yên" : (isCochin ? "Kiến trúc nhà kính & Thức uống nghệ thuật" : "Nghệ thuật trong từng tách trà")))))))}
              </h2>
              <div style={{ width: 60, height: 2, background: "var(--matcha)", margin: "20px auto 0" }} />
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 28 }}>
              {currentPhilosophies.map((p, i) => (
                <motion.div
                  key={i} variants={fadeUp}
                  whileHover={{ y: -10, scale: 1.02 }}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 28,
                    padding: "48px 32px 40px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 320
                  }}
                >
                  {/* Calligraphy Kanji Watermark */}
                  <span style={{
                    position: "absolute", 
                    top: (isComTam || isSamHouse || isMonQuanChat || isEmCoffee || isCochin || isHanHuyen) ? 10 : -20, 
                    right: (isComTam || isSamHouse || isMonQuanChat || isEmCoffee || isCochin || isHanHuyen) ? 10 : -10,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: (isComTam || isSamHouse || isMonQuanChat || isEmCoffee || isCochin || isHanHuyen) ? 90 : 160, 
                    fontWeight: 800,
                    color: isComTam ? "rgba(224, 123, 57, 0.04)" : (isSamHouse ? "rgba(139, 69, 19, 0.04)" : (isMonQuanChat ? "rgba(139, 26, 26, 0.04)" : (isEmCoffee ? "rgba(139, 90, 43, 0.04)" : (isCochin ? "rgba(42, 89, 68, 0.06)" : "rgba(107, 143, 62, 0.04)")))),
                    lineHeight: 1, pointerEvents: "none", userSelect: "none"
                  }}>
                    {p.kanji}
                  </span>

                  <div>
                    {/* Romaji pill */}
                    <span style={{
                      display: "inline-block", padding: "3px 10px", borderRadius: 50,
                      background: isComTam ? "rgba(224,123,57,0.08)" : (isSamHouse ? "rgba(139,69,19,0.08)" : (isMonQuanChat ? "rgba(139,26,26,0.08)" : (isEmCoffee ? "rgba(139,90,43,0.08)" : (isCochin ? "rgba(42,89,68,0.12)" : "rgba(107,143,62,0.08)")))),
                      color: "var(--matcha)",
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 18
                    }}>
                      {p.romaji}
                    </span>

                    <h3 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "0 0 14px",
                      position: "relative", zIndex: 1
                    }}>
                      {p.title}
                    </h3>

                    <p style={{
                      color: "var(--text-muted)", margin: 0,
                      lineHeight: 1.7, fontSize: 14.5,
                      position: "relative", zIndex: 1
                    }}>
                      {p.desc}
                    </p>
                  </div>

                  <div style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: 18, marginTop: 24,
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: 13, fontWeight: 700, color: "var(--matcha)"
                  }}>
                    {isComTam ? "Hương vị Cơm Tấm Ngọ" : (isSamHouse ? "Hương vị Sam Houses" : (isMonQuanChat ? "Hương vị Món Quảng Chất" : (isHoaTeaRoom ? "Tinh thần Hòa Tea Room" : (isEmCoffee ? "Không gian Em Coffee" : (isTaoTao ? "Không gian Táo Tào" : (isHanHuyen ? "Không gian Quán Nước Hàn Huyên" : (isCochin ? "Không gian Cochin Café" : "Tinh thần Zen-Matcha")))))))}
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
                  {(isComTam || isMonQuanChat) ? "Món Ăn Đặc Trưng" : "Món Nước Đặc Trưng"}
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
                    <p style={{ fontSize: 44, margin: "0 0 12px" }}>🍵</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>Không thể tải danh sách món ăn</p>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 20px" }}>Kết nối tới máy chủ bị gián đoạn. Vui lòng kiểm tra lại.</p>
                    <button onClick={() => window.location.reload()} style={{ padding: "10px 24px", borderRadius: 50, background: "var(--matcha)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, boxShadow: "0 4px 12px rgba(107,143,62,0.2)" }}>Tải lại trang</button>
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
              {isComTam ? "Không gian ẩm cúng" : (isSamHouse ? "Góc nhỏ lung linh" : (isMonQuanChat ? "Không gian mộc mạc" : (isHoaTeaRoom ? "Không gian trà nhà Hòa" : (isEmCoffee ? "Góc nhỏ acoustic Em" : (isTaoTao ? "Sân vườn & Tán cây Xanh Mát" : (isHanHuyen ? "Chút bình yên giữa phố thị" : (isCochin ? "Không gian nhà kính Châu Âu" : "Zen trong từng góc nhỏ")))))))}
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
                  background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.05em" }}>{g.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.8, fontWeight: 500 }}>
                    {isComTam ? `Không gian ${tenant?.name || "Cơm Tấm Ngọ"}` : (isSamHouse ? "Không gian Sam Houses" : (isMonQuanChat ? "Không gian Món Quảng Chất" : (isHoaTeaRoom ? "Không gian Hòa Tea Room" : (isEmCoffee ? "Không gian Em Coffee" : (isTaoTao ? "Không gian Táo Tào Cà Phê" : (isHanHuyen ? "Không gian Quán Nước Hàn Huyên" : (isCochin ? "Không gian Cochin Café" : "Không gian Yakishime")))))))}
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
        {/* Decorative elements */}
        <div style={{ position: "absolute", top: -150, right: -150, width: 450, height: 450, borderRadius: "50%", background: "rgba(107,143,62,0.15)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: -150, left: -150, width: 450, height: 450, borderRadius: "50%", background: "rgba(107,143,62,0.06)", filter: "blur(80px)" }} />

        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ marginBottom: 48 }}
          >
            <span style={{ color: "rgba(175,215,120,0.9)", fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Cảm nhận thực khách
            </span>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 700, color: "#fff", margin: "12px 0 0",
              lineHeight: 1.15
            }}>
              Đánh giá từ những khách hàng thân thiết
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
                  background: isComTam ? "rgba(31, 22, 18, 0.65)" : (isSamHouse ? "rgba(28, 22, 19, 0.65)" : (isMonQuanChat ? "rgba(28, 14, 13, 0.65)" : (isHoaTeaRoom ? "rgba(6, 26, 15, 0.65)" : (isCochin ? "rgba(15, 35, 25, 0.65)" : "rgba(22, 32, 25, 0.65)")))),
                  backdropFilter: "blur(20px)",
                  border: isComTam ? "1px solid rgba(224, 123, 57, 0.18)" : (isSamHouse ? "1px solid rgba(139, 69, 19, 0.18)" : (isMonQuanChat ? "1px solid rgba(139, 26, 26, 0.18)" : (isHoaTeaRoom ? "1px solid rgba(46, 111, 64, 0.18)" : (isCochin ? "1px solid rgba(42, 89, 68, 0.25)" : "1px solid rgba(141, 175, 90, 0.18)")))),
                  borderRadius: 32,
                  padding: "54px 48px",
                  boxShadow: "var(--shadow-lg)",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Large double quote watermark */}
                <span style={{
                  position: "absolute", top: 12, right: 36,
                  fontSize: 140, fontWeight: 900,
                  fontFamily: "'Cormorant Garamond', serif",
                  color: isComTam ? "rgba(224, 123, 57, 0.06)" : (isSamHouse ? "rgba(139, 69, 19, 0.06)" : (isMonQuanChat ? "rgba(139, 26, 26, 0.06)" : (isHoaTeaRoom ? "rgba(46, 111, 64, 0.06)" : (isCochin ? "rgba(42, 89, 68, 0.08)" : "rgba(141, 175, 90, 0.06)")))),
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
                      background: isComTam ? "rgba(224, 123, 57, 0.12)" : (isSamHouse ? "rgba(139, 69, 19, 0.12)" : "rgba(107, 143, 62, 0.12)"),
                      backdropFilter: "blur(12px)",
                      padding: "8px 18px 8px 10px",
                      borderRadius: "20px",
                      border: isComTam ? "1px solid rgba(224, 123, 57, 0.3)" : (isSamHouse ? "1px solid rgba(139, 69, 19, 0.3)" : "1px solid rgba(141, 175, 90, 0.3)"),
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
                      <span style={{ display: "block", fontSize: 11, color: "var(--matcha-light)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Đánh giá món ăn
                      </span>
                      <span style={{ fontSize: 14, color: "#FFFFFF", fontWeight: 700 }}>
                        {reviewsList[activeTestimonial].foodName}
                      </span>
                    </div>
                    <div style={{ marginLeft: 10, fontSize: 12, color: "rgba(255, 255, 255, 0.6)", fontWeight: 600, borderLeft: "1px solid rgba(255, 255, 255, 0.18)", paddingLeft: 12 }}>
                       Chi tiết món ➡
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
                    background: isComTam ? "rgba(224, 123, 57, 0.12)" : (isSamHouse ? "rgba(139, 69, 19, 0.12)" : (isMonQuanChat ? "rgba(139, 26, 26, 0.12)" : (isHoaTeaRoom ? "rgba(46, 111, 64, 0.12)" : (isEmCoffee ? "rgba(139, 90, 43, 0.12)" : (isTaoTao ? "rgba(155, 46, 34, 0.12)" : (isHanHuyen ? "rgba(97, 130, 105, 0.12)" : (isCochin ? "rgba(42, 89, 68, 0.15)" : "rgba(107, 143, 62, 0.12)"))))))),
                    borderLeft: "3px solid var(--matcha-light)",
                    borderRadius: "10px",
                    padding: "14px 20px",
                    textAlign: "left",
                    maxWidth: "560px",
                    margin: "0 auto 36px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    border: isComTam ? "1px solid rgba(224, 123, 57, 0.15)" : (isSamHouse ? "1px solid rgba(139, 69, 19, 0.15)" : (isMonQuanChat ? "1px solid rgba(139, 26, 26, 0.15)" : (isHoaTeaRoom ? "1px solid rgba(46, 111, 64, 0.15)" : (isEmCoffee ? "1px solid rgba(139, 90, 43, 0.15)" : (isTaoTao ? "1px solid rgba(155, 46, 34, 0.15)" : (isHanHuyen ? "1px solid rgba(97, 130, 105, 0.15)" : (isCochin ? "1px solid rgba(42, 89, 68, 0.25)" : "1px solid rgba(141, 175, 90, 0.15)"))))))),
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
                      {tenant?.name ? `💬 Phản hồi từ ${tenant.name}` : (isComTam ? "🍚 Phản hồi từ Cơm Tấm Ngọ" : (isSamHouse ? "☕ Phản hồi từ Sam Houses" : (isMonQuanChat ? "🍲 Phản hồi từ Món Quảng Chất" : (isHoaTeaRoom ? "🍃 Phản hồi từ Hòa Tea Room" : (isEmCoffee ? "☕ Phản hồi từ Em Coffee" : (isTaoTao ? "☕ Phản hồi từ Táo Tào" : (isHanHuyen ? "☕ Phản hồi từ Quán Nước Hàn Huyên" : (isCochin ? "🌿 Phản hồi từ Cochin Café" : "🍵 Phản hồi từ Yakishime"))))))))}
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
                  {/* User Avatar Initials */}
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
                  boxShadow: i === activeTestimonial ? "0 2px 10px rgba(141,175,90,0.4)" : "none",
                  transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* BREAK-THE-MOLD CTA BANNER */}
      <section style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75 }}
            style={{
              background: isComTam ? "linear-gradient(135deg, #1E0F05 0%, rgba(31,22,18,0.95) 100%)" : (isSamHouse ? "linear-gradient(135deg, #1C110C 0%, rgba(28,22,19,0.95) 100%)" : (isMonQuanChat ? "linear-gradient(135deg, #2B0A0A 0%, rgba(28,14,13,0.95) 100%)" : (isHoaTeaRoom ? "linear-gradient(135deg, #061A0F 0%, rgba(13,26,18,0.95) 100%)" : (isEmCoffee ? "linear-gradient(135deg, #1F140D 0%, rgba(45,28,18,0.95) 100%)" : (isTaoTao ? "linear-gradient(135deg, rgba(90,24,20,0.85) 0%, rgba(25,7,7,0.85) 100%)" : (isHanHuyen ? "linear-gradient(135deg, rgba(69,99,77,0.85) 0%, rgba(30,45,34,0.85) 100%)" : "linear-gradient(135deg, var(--forest-dark) 0%, rgba(22,32,25,0.95) 100%)")))))),
              border: isComTam ? "1px solid rgba(224, 123, 57, 0.22)" : (isSamHouse ? "1px solid rgba(139, 69, 19, 0.22)" : (isMonQuanChat ? "1px solid rgba(139, 26, 26, 0.22)" : (isHoaTeaRoom ? "1px solid rgba(46, 111, 64, 0.22)" : (isEmCoffee ? "1px solid rgba(160, 95, 45, 0.22)" : (isTaoTao ? "1px solid rgba(180, 50, 50, 0.22)" : (isHanHuyen ? "1px solid rgba(97, 130, 105, 0.22)" : "1px solid rgba(141, 175, 90, 0.22)")))))),
              borderRadius: 36,
              padding: "60px 48px",
              boxShadow: "var(--shadow-lg)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Blurry glow background blobs */}
            <div style={{ position: "absolute", top: -50, left: -50, width: 250, height: 250, borderRadius: "50%", background: isComTam ? "rgba(224,123,57,0.18)" : (isSamHouse ? "rgba(139,69,19,0.18)" : (isMonQuanChat ? "rgba(139,26,26,0.18)" : (isHoaTeaRoom ? "rgba(46,111,64,0.18)" : "rgba(107,143,62,0.18)"))), filter: "blur(50px)" }} />
            <div style={{ position: "absolute", bottom: -50, right: -50, width: 250, height: 250, borderRadius: "50%", background: isComTam ? "rgba(224,123,57,0.12)" : (isSamHouse ? "rgba(139,69,19,0.12)" : (isMonQuanChat ? "rgba(139,26,26,0.12)" : (isHoaTeaRoom ? "rgba(46,111,64,0.12)" : "rgba(141,175,90,0.12)"))), filter: "blur(50px)" }} />

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
              {/* Left Column – Philosophy & Hype */}
              <div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 12px", borderRadius: 50,
                  background: isComTam ? "rgba(224,123,57,0.15)" : (isSamHouse ? "rgba(139,69,19,0.15)" : (isMonQuanChat ? "rgba(139,26,26,0.15)" : (isHoaTeaRoom ? "rgba(46,111,64,0.15)" : (isEmCoffee ? "rgba(160,95,45,0.15)" : "rgba(141,175,90,0.15)")))),
                  color: "var(--matcha-light)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", marginBottom: 18
                }}>
                  🟢 Trực tuyến: 8 khách đang xem bàn
                </span>

                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(36px, 4.5vw, 48px)",
                  fontWeight: 700, color: "#fff", margin: "0 0 16px",
                  lineHeight: 1.15
                }}>
                  {isComTam ? "Bữa ăn ấm cúng" : (isSamHouse ? "Không gian ấm áp" : (isMonQuanChat ? "Bữa ăn đậm vị" : (isHoaTeaRoom ? "Góc nhỏ yên bình" : (isEmCoffee ? "Góc nhỏ acoustic" : (isTaoTao ? "Hương vị khó quên" : (isHanHuyen ? "Nơi lưu giữ" : (isCochin ? "Không gian nhà kính thoáng đãng" : "Trải nghiệm tĩnh lặng")))))))}<br />
                  <span style={{ color: "var(--matcha)", fontStyle: "italic" }}>
                    {isComTam ? "bên mâm cơm gia đình" : (isSamHouse ? "cho ngày làm việc hiệu quả" : (isMonQuanChat ? "đậm đà hương vị miền Trung" : (isHoaTeaRoom ? "tận hưởng tinh hoa trà chiều" : (isEmCoffee ? "ấm áp cho ngày làm việc & thư giãn" : (isTaoTao ? "từng ly kem muối phô mai thơm béo" : (isHanHuyen ? "những câu chuyện nhỏ" : (isCochin ? "ngập tràn ánh sáng tại Vinhomes Grand Park" : "trong từng góc thiền")))))))}
                  </span>
                </h2>

                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15.5, lineHeight: 1.7, margin: "0 0 28px", maxWidth: 440 }}>
                  {isComTam 
                    ? "Quán cơm tấm Ngọ giới hạn số lượng bàn vào giờ cao điểm trưa và tối. Vui lòng đặt bàn trước để gia đình có vị trí ngồi thoải mái nhất." 
                    : (isSamHouse 
                        ? "Không gian làm việc và học tập tại Sam Houses giới hạn số lượng bàn để duy trì sự tập trung và yên tĩnh tối đa." 
                        : (isMonQuanChat
                            ? "Không gian ăn uống tại Món Quảng Chất giới hạn số lượng bàn vào giờ trưa/tối để đem lại bữa ăn thảnh thơi nhất. Đăng ký giữ chỗ ngay!"
                            : (isHoaTeaRoom
                                ? "Không gian tại Hòa Tea Room giới hạn số lượng bàn ngồi để mang lại trải nghiệm thưởng trà tĩnh lặng và riêng tư nhất. Hãy đăng ký đặt bàn ngay!"
                                : (isEmCoffee
                                    ? "Không gian acoustic và làm việc tại Em Coffee luôn sẵn sàng đón tiếp. Đặt trước để chọn được góc bàn cửa sổ hoặc góc riêng tư yêu thích!"
                                    : (isTaoTao
                                        ? "Không gian sân vườn vintage và tán cây xanh tại Táo Tào luôn sẵn sàng phục vụ. Đặt bàn trước để có chỗ ngồi thư thái nhất!"
                                        : (isHanHuyen
                                            ? "Không gian Quán Nước Hàn Huyên với những góc ngồi ấm cúng, thư thái luôn sẵn sàng chào đón bạn!"
                                            : (isCochin
                                                ? "Không gian nhà kính glasshouse tại Cochin Café luôn sẵn sàng đón tiếp. Đặt trước để chọn được góc bàn tầng 2 ngắm view công viên hoặc bàn lớn họp nhóm rộng rãi!"
                                                : "Không gian trà đạo thiền định Yakishime giới hạn số lượng bàn ngồi để duy trì không khí tĩnh tại. Đăng ký sớm để giữ vị trí ngắm trà đạo tốt nhất.")))))))}
                </p>

                {/* Status indicator */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "12px 20px", borderRadius: 16,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)"
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    backgroundColor: "#EF4444",
                    boxShadow: "0 0 8px #EF4444",
                  }} />
                  <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13.5, fontWeight: 600 }}>
                    Khung giờ tối nay chỉ còn 3 bàn trống!
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

                {/* Interactive State Form */}
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {/* Guest selector */}
                  <div>
                    <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>
                      Số lượng khách
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[2, 3, 4].map((num) => {
                        const isSel = quickGuests === num;
                        return (
                          <button
                            key={num}
                            onClick={() => setQuickGuests(num)}
                            style={{
                              flex: 1, padding: "8px 0", borderRadius: 12,
                              border: isSel ? "1.5px solid var(--matcha-light)" : "1px solid rgba(255,255,255,0.15)",
                              background: isSel ? "rgba(141,175,90,0.22)" : "rgba(255,255,255,0.03)",
                              color: isSel ? "var(--matcha-light)" : "rgba(255,255,255,0.75)",
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

                  {/* Date selector */}
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
                              border: isSel ? "1.5px solid var(--matcha-light)" : "1px solid rgba(255,255,255,0.15)",
                              background: isSel ? "rgba(141,175,90,0.22)" : "rgba(255,255,255,0.03)",
                              color: isSel ? "var(--matcha-light)" : "rgba(255,255,255,0.75)",
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

                  {/* Final Button */}
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
                    Tiến hành giữ chỗ <ArrowRight size={16} />
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

