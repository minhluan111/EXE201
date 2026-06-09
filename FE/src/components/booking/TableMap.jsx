import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X } from "lucide-react";

const tableImages = {
  "2-Seat Corner": "/assets/images/space_corner.png",
  "2-Seat Window": "/assets/images/space_window.jpg",
  "2-Seat Bar": "/assets/images/space_bar.png",
  "4-Seat Indoor": "/assets/images/space_indoor.png",
  "4-Seat Tatami": "/assets/images/space_tatami.png",
  "4-Seat Outdoor": "/assets/images/4-Seat Outdoor.jpg",
};

export default function TableMap({ tables, selected, onSelect, canSelect }) {
  const [zoomedImage, setZoomedImage] = useState(null);

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
                    setZoomedImage({ src: image, name: table.name });
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
                <h4 style={{ margin: 0, fontSize: "18px", color: "var(--text)", fontWeight: 700 }}>
                  {zoomedImage.name}
                </h4>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
