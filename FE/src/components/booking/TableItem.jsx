import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";

// Individual table item rendered on SVG canvas
export default function TableItem({ table, selected, canSelect, onSelect }) {
  const isSelected  = selected?.id === table.id;
  const isAvailable = table.status === "available";
  const isSuitable  = canSelect(table);
  const isOccupied  = table.status === "occupied";

  // Determine color
  let fillColor, strokeColor, textColor;
  if (isSelected) {
    fillColor   = "#4A6B28";
    strokeColor = "#8DAF5A";
    textColor   = "#fff";
  } else if (isOccupied) {
    fillColor   = "rgba(100,100,100,0.15)";
    strokeColor = "rgba(150,150,150,0.4)";
    textColor   = "rgba(150,150,150,0.7)";
  } else if (isSuitable) {
    fillColor   = "rgba(107,143,62,0.15)";
    strokeColor = "#6B8F3E";
    textColor   = "#4A6B28";
  } else {
    fillColor   = "rgba(200,200,200,0.1)";
    strokeColor = "rgba(180,180,180,0.4)";
    textColor   = "rgba(150,150,150,0.8)";
  }

  // Table dimensions (in % of SVG viewBox 0 0 100 100)
  const w = table.max_seats === 4 ? 16 : 12;
  const h = table.max_seats === 4 ? 9  : 7;
  const cx = table.coordinate_x + w / 2;
  const cy = table.coordinate_y + h / 2;

  const handleClick = () => {
    if (!isOccupied) onSelect(table);
  };

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      onClick={handleClick}
      style={{ cursor: isOccupied ? "not-allowed" : "pointer" }}
    >
      {/* Selection ring */}
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

      {/* Table body */}
      <motion.rect
        x={table.coordinate_x}
        y={table.coordinate_y}
        width={w}
        height={h}
        rx={2.5}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={isSelected ? 1.2 : 0.8}
        whileHover={!isOccupied ? { scale: 1.08 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        style={{ transformOrigin: `${cx}% ${cy}%` }}
      />

      {/* Chair dots – top */}
      {[...Array(table.max_seats === 4 ? 2 : 1)].map((_, i) => {
        const spacing = table.max_seats === 4 ? (w / 3) : (w / 2);
        const startX  = table.max_seats === 4 ? table.coordinate_x + spacing * (i + 0.5) - 1 : cx - 0.8;
        return (
          <circle
            key={`t${i}`}
            cx={startX + 0.8}
            cy={table.coordinate_y - 1.5}
            r={1}
            fill={isOccupied ? "rgba(150,150,150,0.4)" : strokeColor}
          />
        );
      })}

      {/* Chair dots – bottom */}
      {[...Array(table.max_seats === 4 ? 2 : 1)].map((_, i) => {
        const spacing = table.max_seats === 4 ? (w / 3) : (w / 2);
        const startX  = table.max_seats === 4 ? table.coordinate_x + spacing * (i + 0.5) - 1 : cx - 0.8;
        return (
          <circle
            key={`b${i}`}
            cx={startX + 0.8}
            cy={table.coordinate_y + h + 1.5}
            r={1}
            fill={isOccupied ? "rgba(150,150,150,0.4)" : strokeColor}
          />
        );
      })}

      {/* Table label */}
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

      {/* Seat count */}
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
    </motion.g>
  );
}
