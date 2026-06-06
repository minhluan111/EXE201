import { motion } from "framer-motion";

const tableImages = {
  "2-Seat Corner": "/assets/images/2-Seat Corner.jpg",
  "2-Seat Window": "/assets/images/2-Seat Window.jpg",
  "4-Seat Indoor": "/assets/images/4-Seat Indoor.jpg",
  "4-Seat Outdoor": "/assets/images/4-Seat Outdoor.jpg",
};

export default function TableMap({ tables, selected, onSelect, canSelect }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
        gap: "24px",
      }}
    >
      {tables.map((table) => {
        const selectable = canSelect(table);

        const image =
          tableImages[table.imageType] ||
          tableImages[table.name] ||
          "/assets/images/4-Seat Indoor.jpg";

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
            {/* IMAGE */}
            <img
              src={image}
              alt={table.name}
              style={{
                width: "100%",
                height: "220px",
                objectFit: "cover",
              }}
              onError={(e) => {
                e.target.src = "/assets/images/4-Seat Indoor.jpg";
              }}
            />

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

              <p
                style={{
                  margin: "10px 0",
                  color: "var(--text-muted)",
                }}
              >
                {table.max_seats} ghế
              </p>

              {table.area && (
                <p
                  style={{
                    margin: "10px 0",
                    color: "var(--text-muted)",
                  }}
                >
                  {table.area}
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
                    background:
                      table.status === "available"
                        ? "rgba(34,197,94,.15)"
                        : "rgba(239,68,68,.15)",
                    color: table.status === "available" ? "#16a34a" : "#dc2626",
                  }}
                >
                  {table.status === "available" ? "Còn trống" : "Đã đặt"}
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
  );
}
