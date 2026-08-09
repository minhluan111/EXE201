import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, Lock } from "lucide-react";
import { useTenant } from "@/context/TenantContext";

const tableImages = {
  "2-Seat Corner": "/assets/images/space_corner.png",
  "2-Seat Window": "/assets/images/space_window.jpg",
  "2-Seat Bar": "/assets/images/space_bar.png",
  "4-Seat Indoor": "/assets/images/space_indoor.png",
  "4-Seat Tatami": "/assets/images/space_tatami.png",
  "4-Seat Outdoor": "/assets/images/4-Seat Outdoor.jpg",
};

const comTamTableImages = {
  "2-Seat Corner": "/assets/comtamno/n2_2.jpg",
  "2-Seat Window": "/assets/comtamno/n2_2.jpg",
  "2-Seat Bar": "/assets/comtamno/n2_2.jpg",
  "4-Seat Indoor": "/assets/comtamno/n4_2.jpg",
  "4-Seat Tatami": "/assets/comtamno/n4_2.jpg",
  "4-Seat Outdoor": "/assets/comtamno/n4_1.jpg",
};

const samHouseTableImages = {
  "Bàn 2 người ngoài trời": "/assets/samhouse/tables/n1.jpg",
  "Bàn 3 người trong góc": "/assets/samhouse/tables/t1_2.jpg",
  "Bàn 4 người gần cửa ra vào": "/assets/samhouse/tables/t1_3.jpg",
  "Bàn 4 người cạnh cửa sổ (Có quạt)": "/assets/samhouse/tables/t1_4.jpg",
  "Bàn 4 người cạnh cửa sổ": "/assets/samhouse/tables/t1_5.jpg",
  "Bàn 4 người góc ngoài trời": "/assets/samhouse/tables/t2_1.jpg",
  "Bàn 4 người máy lạnh tầng 2": "/assets/samhouse/tables/t2_2.jpg",
  "Bàn 4 người trong góc (Tầng 3)": "/assets/samhouse/tables/t3_1.jpg",
  "Bàn 2 người trong góc (Tầng 3)": "/assets/samhouse/tables/t3_2.jpg",
  "Bàn 3 người gần cửa sổ (Tầng 3)": "/assets/samhouse/tables/t3_3.jpg",
  "Bàn lớn 10 người họp nhóm": "/assets/samhouse/tables/t3_4.jpg",
  "Bàn 6 người cạnh cửa sổ (Tầng 3)": "/assets/samhouse/tables/t3_5.jpg",
  "Bàn 2 người ngoài trời (Tầng 3)": "/assets/samhouse/tables/t3_6.jpg",
  "Bàn 1 người ngoài trời (Tầng 3)": "/assets/samhouse/tables/t3_7.jpg",
  "2-Seat Corner": "/assets/samhouse/tables/t3_2.jpg",
  "2-Seat Window": "/assets/samhouse/tables/t3_2.jpg",
  "2-Seat Bar": "/assets/samhouse/tables/t3_2.jpg",
  "4-Seat Indoor": "/assets/samhouse/tables/t2_2.jpg",
  "4-Seat Tatami": "/assets/samhouse/tables/t2_2.jpg",
  "4-Seat Outdoor": "/assets/samhouse/tables/t3_6.jpg",
};

const monQuanChatTableImages = {
  "Bàn 1 - 6 người (Máy lạnh, cạnh cửa sổ)": "/assets/monquanchat/tables/ban_1.jpg",
  "Bàn 2 - 6 người (Máy lạnh, trong góc)": "/assets/monquanchat/tables/ban_2.jpg",
  "Bàn 3 - 4 người (Máy lạnh, cạnh cửa sổ)": "/assets/monquanchat/tables/ban_3.jpg",
  "Bàn 5 - 6 người (Máy lạnh, cạnh cửa sổ)": "/assets/monquanchat/tables/ban_5.jpg",
  "Bàn 6 - 4 người (Ngoài trời, gần hồ cá)": "/assets/monquanchat/tables/ban_6.jpg",
  "Bàn 7 - 4 người (Ngoài trời, gần hồ cá)": "/assets/monquanchat/tables/ban_7.jpg",
  "Bàn 8 - 4 người (Ngoài trời, thoáng mát)": "/assets/monquanchat/tables/ban_8.jpg",
  "Bàn 9 - 4 người (Ngoài trời, cạnh hồ cá)": "/assets/monquanchat/tables/ban_9.jpg",
  "Bàn 11 - 4 người (Ngoài trời, cạnh hồ cá)": "/assets/monquanchat/tables/ban_11.jpg",
  "Bàn 12 - 4 người (Ngoài trời, cạnh hồ cá)": "/assets/monquanchat/tables/ban_12.jpg",
  "Bàn 13 - 4 người (Ngoài trời, gần bếp)": "/assets/monquanchat/tables/ban_13.jpg",
  "2-Seat Corner": "/assets/monquanchat/tables/ban_3.jpg",
  "2-Seat Window": "/assets/monquanchat/tables/ban_3.jpg",
  "2-Seat Bar": "/assets/monquanchat/tables/ban_3.jpg",
  "4-Seat Indoor": "/assets/monquanchat/tables/ban_3.jpg",
  "4-Seat Tatami": "/assets/monquanchat/tables/ban_3.jpg",
  "4-Seat Outdoor": "/assets/monquanchat/tables/ban_8.jpg",
};

const hoaTeaRoomTableImages = {
  "Bàn N2 - 6 người (Tầng 1, cửa sổ)": "/assets/hoatearoom/tables/n2.jpg",
  "Bàn N2.1 - 4 người (Tầng 1, quầy bar)": "/assets/hoatearoom/tables/n2_1.jpg",
  "Bàn N2.2 - 4 người (Tầng 2, cửa sổ)": "/assets/hoatearoom/tables/n2_2.jpg",
  "Bàn N2.3 - 2 người (Tầng 2, ổ điện)": "/assets/hoatearoom/tables/n2_3.jpg",
  "Bàn N2.4 - 2 người (Tầng 2, cửa sổ)": "/assets/hoatearoom/tables/n2_4.jpg",
  "Bàn N2.5 - 2 người (Tầng 2, ban công)": "/assets/hoatearoom/tables/n2_5.jpg",
  "Bàn N2.6 - 2 người (Tầng 2, trong góc)": "/assets/hoatearoom/tables/n2_6.jpg",
  "Bàn N2.7 - 2 người (Tầng 2, ban công ngoài)": "/assets/hoatearoom/tables/n2_7.jpg",
  "Bàn N2.8 - 2 người (Tầng 1, kệ sách)": "/assets/hoatearoom/tables/n2_8.jpg",
  "2-Seat Corner": "/assets/hoatearoom/tables/n2_8.jpg",
  "2-Seat Window": "/assets/hoatearoom/tables/n2_4.jpg",
  "2-Seat Bar": "/assets/hoatearoom/tables/n2_1.jpg",
  "4-Seat Indoor": "/assets/hoatearoom/tables/n2_2.jpg",
  "4-Seat Tatami": "/assets/hoatearoom/tables/n2_2.jpg",
  "4-Seat Outdoor": "/assets/hoatearoom/tables/n2_7.jpg",
};

const monariTableImages = {
  // 2-person tables – 4 distinct photos
  "Bàn 2 người (1)": "/assets/monari/tables/ban_2_nguoi_1.jpg",
  "Bàn 2 người (2)": "/assets/monari/tables/ban_2_nguoi_2.jpg",
  "Bàn 2 người (3)": "/assets/monari/tables/ban_2_nguoi_3.jpg",
  "Bàn 2 người (4)": "/assets/monari/tables/ban_2_nguoi_4.jpg",
  "Bàn 2 người": "/assets/monari/tables/ban_2_nguoi_1.jpg",
  // 4-person tables – 3 distinct photos
  "Bàn 4 người (1)": "/assets/monari/tables/ban_4_nguoi_1.jpg",
  "Bàn 4 người (2)": "/assets/monari/tables/ban_4_nguoi_2.jpg",
  "Bàn 4 người (3)": "/assets/monari/tables/ban_4_nguoi_3.jpg",
  "Bàn 4 người": "/assets/monari/tables/ban_4_nguoi_1.jpg",
  // 8-person table – 1 distinct photo
  "Bàn 8 người": "/assets/monari/tables/ban_8_nguoi.jpg",
  "Bàn 8-10 người": "/assets/monari/tables/ban_8_nguoi.jpg",
  // generic fallbacks by type
  "2-Seat Corner": "/assets/monari/tables/ban_2_nguoi_1.jpg",
  "2-Seat Window": "/assets/monari/tables/ban_2_nguoi_2.jpg",
  "2-Seat Bar": "/assets/monari/tables/ban_2_nguoi_3.jpg",
  "4-Seat Indoor": "/assets/monari/tables/ban_4_nguoi_1.jpg",
  "4-Seat Tatami": "/assets/monari/tables/ban_4_nguoi_2.jpg",
  "4-Seat Outdoor": "/assets/monari/tables/ban_4_nguoi_3.jpg",
  "8-Seat": "/assets/monari/tables/ban_8_nguoi.jpg",
};

const comGaTableImages = {
  "Bàn 1 (3 người)": "/assets/comgaongbach/tables/ban_1.jpg",
  "Bàn 2 (5 người)": "/assets/comgaongbach/tables/ban_2.jpg",
  "Bàn 3 (4 người)": "/assets/comgaongbach/tables/ban_3.jpg",
  "Bàn 4 (4 người)": "/assets/comgaongbach/tables/ban_4.jpg",
  "Bàn 5 (4 người)": "/assets/comgaongbach/tables/ban_5.jpg",
  "Bàn 1": "/assets/comgaongbach/tables/ban_1.jpg",
  "Bàn 2": "/assets/comgaongbach/tables/ban_2.jpg",
  "Bàn 3": "/assets/comgaongbach/tables/ban_3.jpg",
  "Bàn 4": "/assets/comgaongbach/tables/ban_4.jpg",
  "Bàn 5": "/assets/comgaongbach/tables/ban_5.jpg",
  "2-Seat Corner": "/assets/comgaongbach/tables/ban_1.jpg",
  "2-Seat Window": "/assets/comgaongbach/tables/ban_1.jpg",
  "2-Seat Bar": "/assets/comgaongbach/tables/ban_1.jpg",
  "4-Seat Indoor": "/assets/comgaongbach/tables/ban_3.jpg",
  "4-Seat Tatami": "/assets/comgaongbach/tables/ban_4.jpg",
  "4-Seat Outdoor": "/assets/comgaongbach/tables/ban_5.jpg",
};

const taotaoTableImages = {
  "2-Seat Corner": "/assets/taotao/tables/ban_2_nguoi_trong_nha_goc.jpg",
  "2-Seat Window": "/assets/taotao/tables/ban_2_nguoi_trong_nha_cua_so.jpg",
  "2-Seat Bar": "/assets/taotao/tables/ban_2_nguoi_ngoai_troi_chill.jpg",
  "4-Seat Indoor": "/assets/taotao/tables/ban_4_nguoi_trong_nha.jpg",
  "4-Seat Tatami": "/assets/taotao/tables/ban_4_nguoi_ngoai_troi_tan_cay.jpg",
  "4-Seat Outdoor": "/assets/taotao/tables/ban_2_nguoi_ngoai_troi.jpg",
  "8-Seat": "/assets/taotao/tables/ban_8_nguoi_trong_nha_lon.jpg",
};

const emCoffeeTableImages = {
  "2-Seat Corner": "/assets/emcoffee/tables/ban_2_nguoi_goc_phai.png",
  "2-Seat Window": "/assets/emcoffee/tables/ban_2_nguoi_cua_so.webp",
  "2-Seat Bar": "/assets/emcoffee/tables/ban_2_nguoi_o_dien.jpg",
  "4-Seat Indoor": "/assets/emcoffee/tables/ban_4_nguoi_rieng_tu.jpg",
  "4-Seat Tatami": "/assets/emcoffee/tables/ban_4_nguoi_goc_o_dien.webp",
  "4-Seat Outdoor": "/assets/emcoffee/tables/ban_2_nguoi_trong_nha.webp",
  "6-Seat": "/assets/emcoffee/tables/ban_6_nguoi_lon_lam_viec.jpg",
};

const hanHuyenTableImages = {
  "2-Seat Corner": "/assets/hanhuyen/tables/indoor_nem_socket_2.jpg",
  "2-Seat Window": "/assets/hanhuyen/tables/indoor_window_2.jpg",
  "2-Seat Bar": "/assets/hanhuyen/tables/indoor_sofa_2.jpg",
  "4-Seat Indoor": "/assets/hanhuyen/tables/indoor_table_4.jpg",
  "4-Seat Tatami": "/assets/hanhuyen/tables/indoor_table_4_1.jpg",
  "4-Seat Outdoor": "/assets/hanhuyen/tables/outdoor_table_2.jpg",
};

const cochinTableImages = {
  "2-Seat Corner": "/assets/cochin/tables/indoor_t2_socket_2.jpg",
  "2-Seat Window": "/assets/cochin/tables/indoor_t2_window_2.jpg",
  "2-Seat Bar": "/assets/cochin/tables/indoor_t1_window_bar_2.jpg",
  "4-Seat Indoor": "/assets/cochin/tables/indoor_t1_window_4.jpg",
  "4-Seat Tatami": "/assets/cochin/tables/indoor_t2_center_2.jpg",
  "4-Seat Outdoor": "/assets/cochin/tables/outdoor_t1_2.jpg",
  "6-Seat": "/assets/cochin/tables/indoor_t1_bar_6.jpg",
};

const thoTableImages = {
  "Ghế Quầy Bar (1 người)": "/assets/thocoffee/decor/bar_counter.jpg",
  "Bàn Đôi Giá Sách (2 người)": "/assets/thocoffee/decor/space_main.jpg",
  "Bàn Đôi Tường Thô (2 người)": "/assets/thocoffee/decor/space_lounge.jpg",
  "Bàn Đôi Cửa Sổ Nắng (2 người)": "/assets/thocoffee/decor/space_window.jpg",
  "Bàn Nhóm Mộc (4 người)": "/assets/thocoffee/decor/space_interior_2.jpg",
  "Bàn Vườn Cây Xanh (2 người)": "/assets/thocoffee/decor/space_garden.jpg",
  "Bàn Vườn Nhóm (4 người)": "/assets/thocoffee/decor/space_upstairs.jpg",
  "Bàn Ban Công View Phố (2 người)": "/assets/thocoffee/decor/space_balcony.jpg",
  "Bàn Làm Việc Tầng Lửng (4 người)": "/assets/thocoffee/decor/space_interior_3.jpg",
  "2-Seat Corner": "/assets/thocoffee/decor/space_lounge.jpg",
  "2-Seat Window": "/assets/thocoffee/decor/space_window.jpg",
  "2-Seat Bar": "/assets/thocoffee/decor/bar_counter.jpg",
  "4-Seat Indoor": "/assets/thocoffee/decor/space_interior_2.jpg",
  "4-Seat Tatami": "/assets/thocoffee/decor/space_interior_3.jpg",
  "4-Seat Outdoor": "/assets/thocoffee/decor/space_upstairs.jpg",
};

const yakiTableImages = {
  "Bàn N2 - 2 người (Trong nhà, ổ điện, quạt)": "/assets/yakishime/tables/n2.jpg",
  "Bàn N2.1 - 2 người (Cửa sổ, ổ điện)": "/assets/yakishime/tables/n2_1.jpg",
  "Bàn N2.2 - 2 người (Cửa sổ, ổ điện)": "/assets/yakishime/tables/n2_2.jpg",
  "Bàn N2.3 - 2 người (Cửa sổ, ổ điện)": "/assets/yakishime/tables/n2_3.jpg",
  "Bàn N2.4 - 4 người (Ngồi bệt, điều hòa)": "/assets/yakishime/tables/n2_4.jpg",
  "Bàn N2.5 - 2 người (Ngồi bệt, ổ điện)": "/assets/yakishime/tables/n2_5.jpg",
  "Bàn N2.6 - 2 người (Ngồi bệt, decor)": "/assets/yakishime/tables/n2_6.jpg",
  "Bàn N2.7 - 4 người (Decor, ổ điện)": "/assets/yakishime/tables/n2_7.jpg",
  "Bàn S2 - 2 người (Sofa cửa sổ, ổ điện)": "/assets/yakishime/tables/s2.jpg",
  "2-Seat Corner": "/assets/yakishime/tables/n2.jpg",
  "2-Seat Window": "/assets/yakishime/tables/s2.jpg",
  "2-Seat Bar": "/assets/yakishime/tables/n2_1.jpg",
  "4-Seat Indoor": "/assets/yakishime/tables/n2_4.jpg",
  "4-Seat Tatami": "/assets/yakishime/tables/n2_5.jpg",
  "4-Seat Outdoor": "/assets/yakishime/tables/n2_7.jpg",
};

const areaDescriptions = {
  "Window": "Bàn cạnh cửa sổ view đường phố, lãng mạn và yên tĩnh. Phù hợp cho 1–2 người.",
  "Corner": "Góc khuất riêng tư, ánh sáng ấm cúng. Phù hợp cho các buổi trò chuyện hai người.",
  "Indoor": "Khu vực trong nhà có điều hòa, bàn rộng. Phù hợp cho nhóm 3–4 người.",
  "Outdoor": "Khu vực ngoài trời thoáng mát, gần sân vườn. Phù hợp cho nhóm 3–4 người.",
};

export default function TableMap({ tables, selected, onSelect, canSelect }) {
  const [zoomedImage, setZoomedImage] = useState(null);
  const { tenant } = useTenant();
  const rawName = String(tenant?.name || "").toLowerCase();
  const tName = String(tenant?.tenantName || "").toLowerCase();

  const isTaoTao = rawName.includes("taotao") || rawName.includes("táo tào") || tName.includes("taotao");
  const isMonari = rawName.includes("monari") || tName.includes("monari");
  const isComGa = rawName.includes("cơm gà") || rawName.includes("comga") || rawName.includes("ông bách") || rawName.includes("ong bach") || tName.includes("comga");
  const isTho = rawName.includes("thô") || rawName.includes("artisan") || tName.includes("thocoffee");
  const isEmCoffee = !isTho && (rawName.includes("em coffee") || rawName.includes("em") || tName.includes("em"));
  const isHanHuyen = rawName.includes("hàn huyên") || tName.includes("hanhuyen");
  const isCochin = rawName.includes("cochin") || tName.includes("cochin");
  const isComTam = rawName.includes("cơm tấm") || tName.includes("comtam");
  const isSamHouse = rawName.includes("sam house") || tName.includes("samhouse");
  const isMonQuanChat = rawName.includes("quảng") || tName.includes("monquanchat");
  const isHoaTeaRoom = rawName.includes("hoa") || rawName.includes("hoà") || rawName.includes("hòa") || tName.includes("hoatearoom");

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          gap: "24px",
        }}
      >
        {tables.map((table) => {
          const selectable = canSelect(table);

          const imageList = isTaoTao ? taotaoTableImages :
            isMonari ? monariTableImages :
            isComGa ? comGaTableImages :
            isTho ? thoTableImages :
            isEmCoffee ? emCoffeeTableImages :
            isHanHuyen ? hanHuyenTableImages :
            isCochin ? cochinTableImages :
            isComTam ? comTamTableImages :
            isSamHouse ? samHouseTableImages :
            isMonQuanChat ? monQuanChatTableImages :
            isHoaTeaRoom ? hoaTeaRoomTableImages :
            yakiTableImages;

          const defaultImage = isTaoTao ? "/assets/taotao/tables/ban_4_nguoi_trong_nha.jpg" :
            isMonari ? "/assets/monari/tables/ban_2_nguoi_1.jpg" :
            isComGa ? "/assets/comgaongbach/tables/ban_1.jpg" :
            isTho ? "/assets/thocoffee/decor/space_main.jpg" :
            isEmCoffee ? "/assets/emcoffee/tables/ban_4_nguoi_rieng_tu.jpg" :
            isHanHuyen ? "/assets/hanhuyen/tables/indoor_table_4.jpg" :
            isCochin ? "/assets/cochin/tables/indoor_t1_window_4.jpg" :
            isComTam ? "/assets/comtamno/n2_2.jpg" :
            isSamHouse ? "/assets/samhouse/tables/t2_2.jpg" :
            isMonQuanChat ? "/assets/monquanchat/tables/ban_3.jpg" :
            isHoaTeaRoom ? "/assets/hoatearoom/tables/n2_3.jpg" :
            "/assets/yakishime/tables/n2.jpg";

          const image =
            table.previewImage ||
            table.seatingArea?.previewImage ||
            table.seatingArea?.preview_image ||
            imageList[table.imageType] ||
            imageList[table.name] ||
            defaultImage;

          const description = table.seatingArea?.description || areaDescriptions[table.area] || "";

          const displayType = table.displayType || "Available";
          const riskLevel = table.riskLevel || "Available";
          const isConflict = displayType === "Conflict" || displayType === "Occupied" || table.status === "occupied" || table.status === "reserved" || table.status === "booked" || table.status === "conflict";
          const isLocked = !isConflict && (displayType === "Locked" || table.status === "locked" || table.status === "maintenance" || table.status === "disabled" || table.is_active === false || table.isActive === false || table.status === "unavailable");

          return (
            <motion.div
              key={table.id}
              whileHover={{ y: -6 }}
              onClick={() => onSelect(table)}
              style={{
                cursor: selectable ? "pointer" : "not-allowed",
                overflow: "hidden",
                borderRadius: "20px",
                background: "var(--bg-card)",
                border:
                  selected?.id === table.id
                    ? "2px solid var(--matcha)"
                    : "1px solid var(--border)",
                boxShadow:
                  selected?.id === table.id
                    ? "0 10px 30px rgba(107,143,62,.25)"
                    : "0 4px 16px rgba(0,0,0,.05)",
                transition: ".25s",
                opacity: table.status === "available" ? 1 : 0.65,
              }}
            >
              {/* IMAGE CONTAINER */}
              <div style={{ position: "relative", overflow: "hidden", height: "220px" }}>
                <img
                  src={image}
                  alt={table.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.src = "/assets/images/4-Seat Indoor.jpg";
                  }}
                />

                {/* Zoom Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent selecting the table
                    setZoomedImage({ src: image, name: table.name, description });
                  }}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--matcha)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                    transition: "all 0.25s ease",
                    zIndex: 2,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.transform = "scale(1.1) rotate(90deg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.85)";
                    e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                  }}
                  title="Phóng to ảnh"
                >
                  <ZoomIn size={16} />
                </button>
              </div>

              {/* CONTENT */}
              <div style={{ padding: "18px" }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    color: "var(--text)",
                    fontWeight: 700,
                  }}
                >
                  {table.name}
                </h3>

                <div style={{ display: "flex", gap: "8px", margin: "10px 0", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "12px", background: "var(--bg-alt)", padding: "4px 8px", borderRadius: "6px", color: "var(--text-muted)" }}>
                    Loại: {table.tableType || "Tiêu chuẩn"}
                  </span>
                  <span style={{ fontSize: "12px", background: "var(--bg-alt)", padding: "4px 8px", borderRadius: "6px", color: "var(--text-muted)" }}>
                    Sức chứa: {table.max_seats} ghế
                  </span>
                  {table.area && (
                    <span style={{ fontSize: "12px", background: "var(--bg-alt)", padding: "4px 8px", borderRadius: "6px", color: "var(--text-muted)" }}>
                      Khu vực: {table.area === "Window" ? "Cửa sổ" : table.area === "Corner" ? "Góc" : table.area === "Indoor" ? "Trong nhà" : table.area === "Outdoor" ? "Ngoài trời" : table.area}
                    </span>
                  )}
                </div>

                {description && (
                  <p
                    style={{
                      margin: "12px 0 0 0",
                      fontSize: "12.5px",
                      lineHeight: "1.5",
                      color: "var(--text-muted)",
                      background: "rgba(107,143,62,0.04)",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      borderLeft: "3px solid var(--matcha)",
                    }}
                  >
                    {description}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "16px",
                  }}
                >
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background:
                        isConflict ? "rgba(107, 114, 128, 0.15)"
                          : isLocked ? "rgba(75, 85, 99, 0.15)"
                            : displayType === "TimelineNotice" ? "rgba(59, 130, 246, 0.15)"
                              : displayType === "BookingRisk" ?
                                (riskLevel === "High" ? "rgba(239, 68, 68, 0.15)" : riskLevel === "Medium" ? "rgba(249, 115, 22, 0.15)" : "rgba(234, 179, 8, 0.15)")
                                : "rgba(34, 197, 94, 0.15)",
                      color:
                        isConflict ? "#4b5563"
                          : isLocked ? "#374151"
                            : displayType === "TimelineNotice" ? "#1d4ed8"
                              : displayType === "BookingRisk" ?
                                (riskLevel === "High" ? "#b91c1c" : riskLevel === "Medium" ? "#c2410c" : "#a16207")
                                : "#16a34a",
                    }}
                  >
                    {isLocked && !isConflict && <Lock size={12} />}
                    {isConflict ? "Đã được đặt"
                      : isLocked ? "Đã khóa"
                        : displayType === "TimelineNotice" ? "Có lịch đặt tiếp theo"
                          : displayType === "BookingRisk" ? (riskLevel === "High" ? "Có khả năng phải chờ cao" : riskLevel === "Medium" ? "Có khả năng phải chờ" : "Có khả năng phải chờ thấp")
                            : "Còn trống"}
                  </span>

                  {selected?.id === table.id && (
                    <span
                      style={{
                        color: "var(--matcha)",
                        fontWeight: 700,
                      }}
                    >
                      ✓ Đã chọn
                    </span>
                  )}
                </div>

                {!selectable && table.status === "available" && (
                  <p
                    style={{
                      marginTop: "10px",
                      color: "#f59e0b",
                      fontSize: "12px",
                    }}
                  >
                    Không phù hợp với số người đã chọn
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ZOOM LIGHTBOX MODAL */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(10, 20, 12, 0.85)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 99999,
              padding: "24px",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                maxWidth: "600px",
                width: "100%",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setZoomedImage(null)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)",
                  border: "none",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  zIndex: 10,
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.8)"}
              >
                <X size={20} />
              </button>

              <img
                src={zoomedImage.src}
                alt={zoomedImage.name}
                style={{
                  width: "100%",
                  maxHeight: "75vh",
                  objectFit: "contain",
                  display: "block",
                }}
              />

              <div style={{ padding: "20px 24px", background: "var(--bg-card)", borderTop: "1px solid var(--border)" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "var(--text)", fontWeight: 700 }}>
                  {zoomedImage.name}
                </h4>
                {zoomedImage.description && (
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                    {zoomedImage.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
