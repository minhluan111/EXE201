import { motion } from "framer-motion";
import TableItem from "./TableItem.jsx";

// Decorative element – door/entrance
function Door({ x, y, width = 8 }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={1.5} rx={0.5}
        fill="rgba(107,143,62,0.3)" stroke="rgba(107,143,62,0.5)" strokeWidth={0.4} />
      <text x={x + width / 2} y={y + 0.8} textAnchor="middle" dominantBaseline="middle"
        fontSize="1.6" fill="rgba(107,143,62,0.8)" fontFamily="Inter, sans-serif"
        style={{ userSelect: "none" }}>
        Cửa ra vào
      </text>
    </g>
  );
}

// Decorative element – counter bar
function Bar({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width={20} height={4} rx={1.5}
        fill="rgba(107,143,62,0.12)" stroke="rgba(107,143,62,0.3)" strokeWidth={0.5} />
      <text x={x + 10} y={y + 2.2} textAnchor="middle" dominantBaseline="middle"
        fontSize="2" fill="rgba(107,143,62,0.7)" fontFamily="Inter, sans-serif" fontWeight="600"
        style={{ userSelect: "none" }}>
        🍵 Quầy pha chế
      </text>
    </g>
  );
}

// Decorative plants
function Plant({ x, y }) {
  return (
    <text x={x} y={y} fontSize="4" textAnchor="middle" dominantBaseline="middle"
      style={{ userSelect: "none" }}>
      🌿
    </text>
  );
}

export default function TableMap({ tables, selected, onSelect, canSelect }) {
  return (
    <div style={{ position: "relative" }}>
      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { color: "rgba(107,143,62,0.15)", stroke: "#6B8F3E", label: "Phù hợp" },
          { color: "rgba(100,100,100,0.15)", stroke: "rgba(150,150,150,0.4)", label: "Đã đặt" },
          { color: "#4A6B28", stroke: "#8DAF5A", label: "Đang chọn" },
          { color: "rgba(200,200,200,0.1)", stroke: "rgba(180,180,180,0.4)", label: "Không phù hợp" },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--text-muted)" }}>
            <div style={{
              width: 20, height: 12, borderRadius: 3,
              background: l.color, border: `1.5px solid ${l.stroke}`,
            }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* SVG Floor Plan */}
      <div style={{
        background: "var(--bg-alt)",
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid var(--border)",
        boxShadow: "inset 0 2px 16px rgba(0,0,0,0.06)",
      }}>
        <motion.svg
          viewBox="0 0 100 90"
          style={{ width: "100%", display: "block" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background grid dots */}
          {Array.from({ length: 20 }, (_, r) =>
            Array.from({ length: 25 }, (_, c) => (
              <circle
                key={`${r}-${c}`}
                cx={c * 4 + 2}
                cy={r * 4.5 + 2}
                r={0.2}
                fill="rgba(107,143,62,0.15)"
              />
            ))
          )}

          {/* Floor sections */}
          {/* Row A label */}
          <text x={2} y={6} fontSize="2.2" fill="rgba(107,143,62,0.6)" fontFamily="Inter, sans-serif" fontWeight="600"
            style={{ userSelect: "none" }}>
            Khu A
          </text>
          <text x={2} y={35} fontSize="2.2" fill="rgba(107,143,62,0.6)" fontFamily="Inter, sans-serif" fontWeight="600"
            style={{ userSelect: "none" }}>
            Khu B
          </text>
          <text x={2} y={63} fontSize="2.2" fill="rgba(107,143,62,0.6)" fontFamily="Inter, sans-serif" fontWeight="600"
            style={{ userSelect: "none" }}>
            Khu C
          </text>

          {/* Horizontal dividers */}
          <line x1="2" y1="28" x2="98" y2="28" stroke="rgba(107,143,62,0.15)" strokeWidth="0.4" strokeDasharray="2 1.5" />
          <line x1="2" y1="57" x2="98" y2="57" stroke="rgba(107,143,62,0.15)" strokeWidth="0.4" strokeDasharray="2 1.5" />

          {/* Counter/bar */}
          <Bar x={37} y={82} />

          {/* Plants */}
          <Plant x={3}  y={80} />
          <Plant x={97} y={80} />
          <Plant x={3}  y={4}  />
          <Plant x={97} y={4}  />

          {/* Door */}
          <Door x={46} y={0.5} width={9} />

          {/* Tables */}
          {tables.map((table) => (
            <TableItem
              key={table.id}
              table={table}
              selected={selected}
              canSelect={canSelect}
              onSelect={onSelect}
            />
          ))}
        </motion.svg>
      </div>

      {/* Info footer */}
      <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, marginTop: 12 }}>
        Click vào bàn phù hợp để chọn · Bàn 2 ghế cho 1-2 người · Bàn 4 ghế cho 3-4 người
      </p>
    </div>
  );
}
