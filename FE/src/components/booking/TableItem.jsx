import { motion, AnimatePresence } from "framer-motion";
import { Users, Lock } from "lucide-react";

export default function TableItem({ table, selected, canSelect, onSelect }) {
  const isSelected = selected?.id === table.id;
  const isSuitable = canSelect(table);
  const displayType = table.displayType || "Available";
  const risk = table.riskLevel || "Available";
  const isConflict = displayType === "Conflict" || displayType === "Occupied" || table.status === "occupied" || table.status === "reserved" || table.status === "booked" || table.status === "conflict";
  const isLocked = !isConflict && (displayType === "Locked" || table.status === "locked" || table.status === "maintenance" || table.status === "disabled" || table.is_active === false || table.isActive === false || table.status === "unavailable");

  let fillColor, strokeColor, textColor, badgeColor, badgeText, showLock;

  if (isSelected) {
    fillColor = "#4A6B28";
    strokeColor = "#8DAF5A";
    textColor = "#fff";
  } else if (isConflict) {
    fillColor = "rgba(107, 114, 128, 0.15)";
    strokeColor = "#6b7280";
    textColor = "#4b5563";
    badgeColor = "#6b7280";
    badgeText = "Đã được đặt";
  } else if (isLocked) {
    fillColor = "rgba(75, 85, 99, 0.15)";
    strokeColor = "#4b5563";
    textColor = "#374151";
    badgeColor = "#4b5563";
    badgeText = "Đã khóa";
    showLock = true;
  } else if (displayType === "TimelineNotice") {
    fillColor = "rgba(59, 130, 246, 0.15)";
    strokeColor = "#3b82f6";
    textColor = "#1d4ed8";
    badgeColor = "#3b82f6";
    badgeText = "Có lịch đặt tiếp theo";
  } else if (displayType === "BookingRisk") {
    if (risk === "High") {
      fillColor = "rgba(239, 68, 68, 0.15)";
      strokeColor = "#ef4444";
      textColor = "#b91c1c";
      badgeColor = "#ef4444";
      badgeText = "Có khả năng phải chờ cao";
    } else if (risk === "Medium") {
      fillColor = "rgba(249, 115, 22, 0.15)";
      strokeColor = "#f97316";
      textColor = "#c2410c";
      badgeColor = "#f97316";
      badgeText = "Có khả năng phải chờ";
    } else {
      fillColor = "rgba(234, 179, 8, 0.15)";
      strokeColor = "#eab308";
      textColor = "#a16207";
      badgeColor = "#eab308";
      badgeText = "Có khả năng phải chờ thấp";
    }
  } else if (isSuitable) {
    fillColor = "rgba(34, 197, 94, 0.15)";
    strokeColor = "#22c55e";
    textColor = "#16a34a";
    badgeColor = "#22c55e";
    badgeText = "Còn trống";
  } else {
    fillColor = "rgba(200,200,200,0.1)";
    strokeColor = "rgba(180,180,180,0.4)";
    textColor = "rgba(150,150,150,0.8)";
  }

  const w = table.max_seats === 4 ? 16 : 12;
  const h = table.max_seats === 4 ? 9 : 7;
  const cx = table.coordinate_x + w / 2;
  const cy = table.coordinate_y + h / 2;

  const handleClick = () => {
    if (canSelect(table)) onSelect(table);
  };

  const getTitle = () => {
    let msg = `Bàn: ${table.name}\n`;
    if (isConflict) msg += "Trạng thái: Bàn này đã được khách khác đặt trong khung giờ bạn chọn.\n";
    else if (isLocked) msg += "Trạng thái: Bàn hiện đang tạm ngừng phục vụ hoặc đang được bảo trì.\n";
    else if (displayType === "Available") msg += "Trạng thái: Bàn còn trống, sẵn sàng phục vụ.\n";
    else if (displayType === "TimelineNotice") msg += "Trạng thái: Bàn này đã có khách đặt vào khung giờ sau. Nếu dùng bạn dự định ngồi lại lâu, nhà hàng có thể sẽ cần hỗ trợ sắp xếp chỗ ngồi để phục vụ khách tiếp theo.\n";
    else if (displayType === "BookingRisk") {
      if (risk === "High") msg += "Trạng thái: Bàn này đã có khách đặt ở khung giờ trước bạn. Nếu khách trước ngồi lại bàn lâu hơn dự kiến, bạn có thể sẽ cần chờ thêm hoặc được nhà hàng hỗ trợ đổi sang bàn khác.\n";
      else if (risk === "Medium") msg += "Trạng thái: Bàn này đã có khách đặt ở khung giờ trước bạn. Có khả năng thấp nếu khách trước ngồi lại bàn lâu hơn dự kiến, bạn có thể sẽ cần chờ thêm hoặc được nhà hàng hỗ trợ đổi sang bàn khác.\n";
      else msg += "Trạng thái: Bàn này đã có khách đặt trước bạn nhưng khoảng cách giữa hai lượt đặt khá an toàn. Thông thường quán vẫn có thể chuẩn bị bàn đúng giờ.\n";
    }

    msg += `Đề xuất: ${table.suggestedStatus || table.status || "available"}`;
    return msg;
  };

  // Adjust badge width based on text length since badges are now much longer
  const badgeWidth = badgeText ? Math.max(10, badgeText.length * 0.45) : 0;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      onClick={handleClick}
      style={{ cursor: canSelect(table) ? "pointer" : "not-allowed" }}
    >
      <title>{getTitle()}</title>

      <AnimatePresence>
        {isSelected && (
          <motion.rect
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, transition: { repeat: Infinity, duration: 1.5, repeatType: "reverse" } }}
            exit={{ opacity: 0 }}
            x={table.coordinate_x - 2}
            y={table.coordinate_y - 2}
            width={w + 4}
            height={h + 4}
            rx={3.5}
            fill="none"
            stroke="#8DAF5A"
            strokeWidth="0.8"
            strokeDasharray="2 1"
          />
        )}
      </AnimatePresence>

      <motion.rect
        x={table.coordinate_x}
        y={table.coordinate_y}
        width={w}
        height={h}
        rx={2.5}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={isSelected ? 1.2 : 0.8}
        whileHover={canSelect(table) ? { scale: 1.08 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        style={{ transformOrigin: `${cx}% ${cy}%` }}
      />

      {[...Array(table.max_seats === 4 ? 2 : 1)].map((_, i) => {
        const spacing = table.max_seats === 4 ? (w / 3) : (w / 2);
        const startX = table.max_seats === 4 ? table.coordinate_x + spacing * (i + 0.5) - 1 : cx - 0.8;
        return (
          <circle
            key={`t${i}`}
            cx={startX + 0.8}
            cy={table.coordinate_y - 1.5}
            r={1}
            fill={isLocked || isConflict ? "rgba(150,150,150,0.4)" : strokeColor}
          />
        );
      })}

      {[...Array(table.max_seats === 4 ? 2 : 1)].map((_, i) => {
        const spacing = table.max_seats === 4 ? (w / 3) : (w / 2);
        const startX = table.max_seats === 4 ? table.coordinate_x + spacing * (i + 0.5) - 1 : cx - 0.8;
        return (
          <circle
            key={`b${i}`}
            cx={startX + 0.8}
            cy={table.coordinate_y + h + 1.5}
            r={1}
            fill={isLocked || isConflict ? "rgba(150,150,150,0.4)" : strokeColor}
          />
        );
      })}

      <text
        x={cx}
        y={cy - 0.5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="2.8"
        fontWeight="700"
        fill={textColor}
        style={{ userSelect: "none", pointerEvents: "none", fontFamily: "Inter, sans-serif" }}
      >
        {table.name.replace("Bàn ", "")}
      </text>

      <text
        x={cx}
        y={cy + 1.8}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="1.9"
        fill={textColor}
        style={{ userSelect: "none", pointerEvents: "none", fontFamily: "Inter, sans-serif", opacity: 0.85 }}
      >
        {table.max_seats} ghế
      </text>

      {badgeText && (
        <g transform={`translate(${table.coordinate_x + w / 2 - badgeWidth / 2}, ${table.coordinate_y - 1.2})`}>
          <rect width={badgeWidth} height="2.2" rx="0.6" fill={badgeColor} opacity="0.95" />
          <text x={badgeWidth / 2} y="1.2" textAnchor="middle" dominantBaseline="middle" fontSize="1.1" fontWeight="bold" fill="#fff" style={{ userSelect: "none", pointerEvents: "none", fontFamily: "Inter, sans-serif" }}>
            {showLock ? "🔒 " : ""}{badgeText}
          </text>
        </g>
      )}
    </motion.g>
  );
}
