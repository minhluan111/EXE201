import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  CheckCircle,
  MessageSquare,
  User,
  Mail,
  Phone,
  Sparkles,
  Info,
  AlertCircle,
  Coffee,
} from "lucide-react";
import { bookingCreate } from "../services/mockApi.js";
import { useAuth } from "../context/useAuthContext.js";
import { useBookingContext } from "../context/useBookingContext.js";

function translateArea(area) {
  const map = {
    Window: "Cửa sổ",
    Corner: "Góc",
    Indoor: "Trong nhà",
    Outdoor: "Ngoài trời"
  };
  return map[area] || area;
}

export default function BookingConfirmPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const { selected: contextSelected, clear } = useBookingContext();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const state = location.state || {};
  const booking_date = state.booking_date || "";
  const booking_time = state.booking_time || "";
  const num_of_people = state.num_of_people || 2;
  const table = state.selected || contextSelected || {};
  const tableId = table?.id || "";

  const [note, setNote] = useState("");
  const [receiverName, setReceiverName] = useState(user?.full_name || "");
  const [receiverPhone, setReceiverPhone] = useState(user?.phone || "");
  const [receiverEmail, setReceiverEmail] = useState(user?.email || "");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!tableId || !booking_date || !booking_time) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            textAlign: "center",
            maxWidth: 440,
            width: "100%",
            padding: "48px 32px",
            borderRadius: 32,
            background: "var(--bg-card)",
            border: "1.5px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.2)",
              color: "#F59E0B",
            }}
          >
            <AlertCircle size={28} />
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 12,
              color: "var(--text)",
            }}
          >
            Trống Thông Tin
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: 15,
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Hệ thống không tìm thấy thông tin bàn chỗ mà quý khách đã lựa chọn.
            Vui lòng quay lại trang đặt bàn.
          </p>
          <button
            onClick={() => nav("/booking")}
            style={{
              width: "100%",
              py: 16,
              padding: "16px",
              borderRadius: 50,
              fontWeight: 700,
              fontSize: 16,
              background:
                "linear-gradient(135deg, var(--matcha), var(--forest))",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(107, 143, 62, 0.25)",
              transition: "transform 0.2s, opacity 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            ← Quay Lại Chọn Bàn
          </button>
        </motion.div>
      </div>
    );
  }

  const confirm = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    const res = await bookingCreate({
      token,
      table_id: tableId,
      booking_date,
      booking_time,
      num_of_people,
      note,
    });

    setLoading(false);

    if (!res.ok) {
      setError(res.message || "Đặt bàn thất bại. Vui lòng thử lại.");
      return;
    }

    setMessage(
      `Đặt bàn thành công! Mã đặt bàn của quý khách là: ${res.data.reservation_code || res.data.id}`,
    );
    clear();

    setTimeout(() => nav("/booking/history"), 2000);
  };

  return (
    <div
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        paddingBottom: 96,
        color: "var(--text)",
      }}
    >
      {/* Header section with organic Zen gradients */}
      <div
        style={{
          padding: "60px 0",
          background:
            "linear-gradient(135deg, rgba(47, 91, 62, 0.08) 0%, rgba(107, 143, 62, 0.04) 100%)",
          borderBottom: "1px solid var(--border)",
          textAlign: "center",
        }}
      >
        <div className="container-xl" style={{ padding: "0 24px" }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span
              style={{
                color: "var(--matcha)",
                uppercase: "true",
                letterSpacing: "0.2em",
                fontWeight: 600,
                fontSize: 13,
                display: "block",
                marginBottom: 8,
              }}
            >
              Xác Nhận Đặt Bàn / 予約の確認
            </span>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(36px, 5vw, 56px)",
                fontWeight: 700,
                color: "var(--forest)",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Xác Nhận Đặt Bàn
            </h1>
            <p
              style={{
                color: "var(--text-muted)",
                marginTop: 12,
                maxWidth: 640,
                margin: "12px auto 0",
                fontSize: 15,
                lineHeight: 1.6,
              }}
            >
              Vui lòng xem lại thông tin chi tiết phòng trà và điền các ghi chú
              đặc biệt để chúng tôi chuẩn bị đón tiếp quý khách một cách hoàn
              hảo nhất.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Grid content */}
      <div
        className="container-xl"
        style={{ padding: "0 24px", marginTop: 48 }}
      >
        <div className="confirm-layout">
          {/* Left panel: Reservation details & Special note */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              background: "var(--bg-card)",
              border: "1.5px solid var(--border)",
              borderRadius: 24,
              padding: "32px 24px",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                pb: 16,
                borderBottom: "1.5px solid var(--border)",
                marginBottom: 28,
                paddingBottom: 16,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContext: "center",
                  borderRadius: 12,
                  background: "rgba(107, 143, 62, 0.1)",
                  color: "var(--matcha)",
                  justifyContent: "center",
                }}
              >
                <Coffee size={20} />
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "var(--forest)",
                    margin: 0,
                  }}
                >
                  Thông Tin Phòng Trà
                </h2>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    margin: "2px 0 0",
                  }}
                >
                  Chi tiết không gian trà đạo quý khách đã chọn
                </p>
              </div>
            </div>

            {/* Grid details */}
            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-icon">
                  <Sparkles size={16} />
                </div>
                <div>
                  <span className="detail-label">CỬA HÀNG</span>
                  <span className="detail-value">Yakishime Matcha</span>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <MapPin size={16} />
                </div>
                <div>
                  <span className="detail-label">KHU VỰC</span>
<<<<<<< HEAD
                  <span className="detail-value">
                    {table?.area || "Chưa xác định"}
                  </span>
=======
                  <span className="detail-value">{translateArea(table?.area) || "Chưa xác định"}</span>
>>>>>>> origin/main
                </div>
              </div>

              <div className="detail-item">
                <div
                  className="detail-icon"
                  style={{
                    background: "rgba(47, 91, 62, 0.1)",
                    color: "var(--forest)",
                  }}
                >
                  <Coffee size={16} />
                </div>
                <div>
                  <span className="detail-label">BÀN TRÀ</span>
                  <span
                    className="detail-value"
                    style={{ color: "var(--forest)", fontWeight: 700 }}
                  >
                    {table?.name || "Chưa xác định"}
                  </span>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <Users size={16} />
                </div>
                <div>
                  <span className="detail-label">SỐ KHÁCH</span>
                  <span className="detail-value">{num_of_people} Người</span>
                </div>
              </div>

              <div className="detail-item full-width">
                <div className="detail-icon">
                  <Calendar size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <span className="detail-label">THỜI GIAN HẸN TRÀ</span>
                  <span
                    className="detail-value"
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>{booking_date}</span>
                    <span
                      style={{
                        color: "var(--text-light)",
                        fontWeight: "normal",
                      }}
                    >
                      |
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        color: "var(--matcha)",
                      }}
                    >
                      <Clock size={14} />
                      {booking_time}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Special Note */}
            <div
              style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: "1.5px solid var(--border)",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: 12,
                }}
              >
                <MessageSquare size={16} style={{ color: "var(--matcha)" }} />
                Ghi chú đặc biệt cho Phòng Trà
              </label>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Cần không gian yên tĩnh, bàn gần cửa sổ, chuẩn bị sẵn bánh ngọt Mochi..."
                className="confirm-textarea"
              />
            </div>
          </motion.div>

          {/* Right panel: Guest Info & Checkout Call-to-action */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{
              background: "var(--bg-card)",
              border: "1.5px solid var(--border)",
              borderRadius: 24,
              padding: "32px 24px",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                pb: 16,
                borderBottom: "1.5px solid var(--border)",
                marginBottom: 28,
                paddingBottom: 16,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContext: "center",
                  borderRadius: 12,
                  background: "rgba(107, 143, 62, 0.1)",
                  color: "var(--matcha)",
                  justifyContent: "center",
                }}
              >
                <User size={20} />
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "var(--forest)",
                    margin: 0,
                  }}
                >
                  Thông Tin Người Nhận
                </h2>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    margin: "2px 0 0",
                  }}
                >
                  Xác thực danh tính chủ cuộc hẹn
                </p>
              </div>
            </div>

            {/* Input list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 8,
                  }}
                >
                  Họ và Tên
                </label>
                <div style={{ position: "relative" }}>
                  <User
                    size={16}
                    style={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-light)",
                    }}
                  />
                  <input
                    type="text"
                    disabled
                    value={receiverName}
                    className="confirm-input"
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 8,
                  }}
                >
                  Số Điện Thoại
                </label>
                <div style={{ position: "relative" }}>
                  <Phone
                    size={16}
                    style={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-light)",
                    }}
                  />
                  <input
                    type="text"
                    disabled
                    value={receiverPhone}
                    className="confirm-input"
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 8,
                  }}
                >
                  Địa Chỉ Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={16}
                    style={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-light)",
                    }}
                  />
                  <input
                    type="email"
                    disabled
                    value={receiverEmail}
                    className="confirm-input"
                  />
                </div>
              </div>
            </div>

            {/* Verification callout */}
            <div
              style={{
                marginTop: 24,
                padding: "16px 20px",
                borderRadius: 16,
                background: "rgba(14,165,233,0.05)",
                border: "1.5px solid rgba(14,165,233,0.1)",
                display: "flex",
                gap: 12,
                alignItems: "start",
              }}
            >
              <Info
                size={16}
                style={{ color: "#0EA5E9", flexShrink: 0, marginTop: 2 }}
              />
              <div style={{ fontSize: 12, lineHeight: 1.5, color: "#0284C7" }}>
                <p style={{ fontWeight: 700, margin: "0 0 2px" }}>
                  Xác Thực Hệ Thống
                </p>
                <p style={{ margin: 0, opacity: 0.85 }}>
                  Thông tin này được trích xuất an toàn từ tài khoản đã đăng
                  nhập của quý khách để ghi nhận lịch đặt bàn.
                </p>
              </div>
            </div>

            {/* Error and Success alerts */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden", marginTop: 20 }}
                >
                  <div
                    style={{
                      padding: "14px 18px",
                      borderRadius: 16,
                      background: "rgba(239,68,68,0.06)",
                      border: "1.5px solid rgba(239,68,68,0.15)",
                      color: "#EF4444",
                      fontSize: 13,
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      fontWeight: 500,
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}

              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden", marginTop: 20 }}
                >
                  <div
                    style={{
                      padding: "14px 18px",
                      borderRadius: 16,
                      background: "rgba(16,185,129,0.06)",
                      border: "1.5px solid rgba(16,185,129,0.15)",
                      color: "#10B981",
                      fontSize: 13,
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{message}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              disabled={loading || !!message}
              whileHover={
                !(loading || !!message)
                  ? { y: -2, boxShadow: "0 10px 24px rgba(107, 143, 62, 0.3)" }
                  : {}
              }
              whileTap={!(loading || !!message) ? { scale: 0.98 } : {}}
              onClick={confirm}
              className="booking-action-btn"
              style={{
                background:
                  loading || !!message
                    ? "var(--text-light)"
                    : "linear-gradient(135deg, var(--matcha), var(--forest))",
                cursor: loading || !!message ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg
                    className="animate-spin"
                    style={{ width: 18, height: 18, color: "#fff" }}
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang Xử Lý Đặt Bàn...
                </span>
              ) : message ? (
                "Đang Chuyển Hướng Lịch Sử..."
              ) : (
                "Xác Nhận Đặt Bàn"
              )}
            </motion.button>

            <Link
              to="/booking"
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: 13,
                color: "var(--text-muted)",
                textDecoration: "none",
                fontWeight: 600,
                transition: "color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.color = "var(--matcha)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              <ArrowLeft size={14} />
              Quay lại chọn bàn trà khác
            </Link>
          </motion.div>
        </div>
      </div>

      <style>{`
        .confirm-layout {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 32px;
          align-items: start;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .detail-item {
          padding: 16px;
          border-radius: 16px;
          background: var(--bg-alt);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .detail-item.full-width {
          grid-column: 1 / -1;
        }
        .detail-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(107, 143, 62, 0.1);
          color: var(--matcha);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .detail-label {
          display: block;
          font-size: 10px;
          color: var(--text-light);
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }
        .detail-value {
          display: block;
          font-size: 14px;
          color: var(--text);
          font-weight: 600;
        }
        .confirm-textarea {
          width: 100%;
          padding: 16px;
          border-radius: 16px;
          background: var(--bg-alt);
          border: 1.5px solid var(--border);
          color: var(--text);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          line-height: 1.6;
          outline: none;
          resize: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .confirm-textarea:focus {
          border-color: var(--matcha);
        }
        .confirm-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          border-radius: 14px;
          background: var(--bg-alt);
          border: 1.5px solid var(--border);
          color: var(--text);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          cursor: not-allowed;
          opacity: 0.8;
        }
        .booking-action-btn {
          width: 100%;
          margin-top: 24px;
          padding: 16px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          color: #fff;
          border: none;
          box-shadow: 0 8px 24px rgba(107,143,62,0.2);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 992px) {
          .confirm-layout {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
        @media (max-width: 576px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
