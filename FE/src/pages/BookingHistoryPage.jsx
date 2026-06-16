import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";

import {
  Calendar,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Loader2,
  Trash2,
  Coffee,
} from "lucide-react";
import { bookingCancel, bookingMe, bookingReschedule } from "../services/apiClient.js";
import { useAuth } from "../context/useAuthContext.js";

export default function BookingHistoryPage() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("upcoming");
  const [cancelling, setCancelling] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(null);

  const [rescheduling, setRescheduling] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const filteredRescheduleTimeSlots = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayStrLocal = `${year}-${month}-${day}`;
    const isToday = rescheduleDate === todayStrLocal;
    const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

    if (!isToday) return TIME_SLOTS;

    return TIME_SLOTS.filter((slot) => {
      const [hours, minutes] = slot.split(":").map(Number);
      const slotDate = new Date(today);
      slotDate.setHours(hours, minutes, 0, 0);
      const timeDiffMinutes = (slotDate.getTime() - today.getTime()) / (1000 * 60);
      return timeDiffMinutes >= 30;
    });
  }, [rescheduleDate]);

  useEffect(() => {
    if (rescheduleTime && !filteredRescheduleTimeSlots.includes(rescheduleTime)) {
      setRescheduleTime("");
    }
  }, [rescheduleDate, filteredRescheduleTimeSlots, rescheduleTime]);

  const handleConfirmReschedule = async () => {
    if (!showRescheduleModal) return;
    if (!rescheduleDate || !rescheduleTime) {
      setError("Vui lòng chọn ngày và giờ mới để đổi lịch.");
      return;
    }
    const id = showRescheduleModal;
    setShowRescheduleModal(null);
    setRescheduling(id);
    setError("");
    const res = await bookingReschedule({ token, id, booking_date: rescheduleDate, booking_time: rescheduleTime });
    setRescheduling(null);
    if (!res.ok) return setError(res.message || "Đổi lịch thất bại. Vui lòng thử lại.");
    const refresh = await bookingMe({ token });
    setList(refresh.ok ? refresh.data : []);
  };


  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setError("");
      setLoading(true);
      const res = await bookingMe({ token });
      if (!mounted) return;
      setList(res.ok ? res.data : []);
      setLoading(false);
    };
    run();
    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (!loading && list.length > 0) {
      const rescheduleId = searchParams.get("reschedule");
      if (rescheduleId) {
        const target = list.find(item => item.id === rescheduleId);
        if (target && target.status !== "cancelled" && target.status !== "completed") {
          setTab("upcoming");
          setShowRescheduleModal(target.id);
          setRescheduleDate(target.booking_date || todayStr);
          setRescheduleTime(target.booking_time);
          setSearchParams({});
        }
      }
    }
  }, [loading, list, searchParams, setSearchParams, todayStr]);

  const view = list.filter((b) => {
    if (tab === "cancelled") return b.status === "cancelled" || b.status === "noshow";
    if (tab === "complete") return b.status === "completed";
    return b.status === "reserved" || b.status === "confirmed" || b.status === "checkedin";
  });

  const cancel = (id) => {
    setShowCancelModal(id);
  };

  const handleConfirmCancel = async () => {
    if (!showCancelModal) return;
    const id = showCancelModal;
    setShowCancelModal(null);

    setCancelling(id);
    setError("");
    const res = await bookingCancel({ token, id });
    setCancelling(null);

    if (!res.ok)
      return setError(
        res.message || "Hủy lịch đặt thất bại. Vui lòng thử lại.",
      );
    const refresh = await bookingMe({ token });
    setList(refresh.ok ? refresh.data : []);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "reserved":
        return (
          <span className="status-badge status-pending">
            <span className="pulse-dot"></span>
            Chờ xác nhận
          </span>
        );
      case "confirmed":
        return (
          <span className="status-badge status-confirmed">
            <CheckCircle size={12} style={{ marginRight: 4 }} />
            Đã xác nhận
          </span>
        );
      case "checkedin":
        return (
          <span className="status-badge status-checkedin">
            <CheckCircle size={12} style={{ marginRight: 4 }} />
            Đã check-in
          </span>
        );
      case "completed":
        return (
          <span className="status-badge status-completed">
            <CheckCircle size={12} style={{ marginRight: 4 }} />
            Đã hoàn thành
          </span>
        );
      case "cancelled":
        return (
          <span className="status-badge status-cancelled">
            <XCircle size={12} style={{ marginRight: 4 }} />
            Đã hủy
          </span>
        );
      case "noshow":
        return (
          <span className="status-badge status-noshow">
            <AlertCircle size={12} style={{ marginRight: 4 }} />
            Vắng mặt
          </span>
        );
      default:
        return <span className="status-badge status-default">{status}</span>;
    }
  };

  const tabs = [
    {
      key: "upcoming",
      label: "Sắp Diễn Ra",
      count: list.filter(
        (b) => b.status === "reserved" || b.status === "confirmed" || b.status === "checkedin",
      ).length,
    },
    {
      key: "complete",
      label: "Đã Hoàn Thành",
      count: list.filter((b) => b.status === "completed").length,
    },
    {
      key: "cancelled",
      label: "Đã Hủy / Vắng Mặt",
      count: list.filter((b) => b.status === "cancelled" || b.status === "noshow").length,
    },
  ];

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
              Lịch Sử Đặt Bàn / 予約履歴
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
              Lịch Sử Đặt Bàn
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
              Theo dõi trạng thái các cuộc hẹn trà đạo và lịch sử trải nghiệm
              của quý khách tại Yakishime Matcha.
            </p>
          </motion.div>
        </div>
      </div>

      <div
        className="container-xl"
        style={{ padding: "0 24px", marginTop: 40 }}
      >
        {/* Navigation Tabs bar */}
        <div className="tabs-container">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`tab-btn ${active ? "active" : ""}`}
              >
                <span>{t.label}</span>
                <span className={`tab-count ${active ? "active" : ""}`}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Global Error Banner */}
        <AnimatePresence>
          {showRescheduleModal &&
            (() => {
              const b = list.find((item) => item.id === showRescheduleModal);
              if (!b) return null;
              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="modal-overlay"
                  onClick={() => setShowRescheduleModal(null)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="modal-card"
                    style={{ maxWidth: 540 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="modal-header" style={{ marginBottom: 12 }}>
                      <h3 className="modal-title">Đổi Lịch Đặt Bàn</h3>
                    </div>

                    <div className="modal-body">
                      <p className="modal-message" style={{ marginBottom: 20 }}>
                        Vui lòng chọn ngày và khung giờ mới cho đơn đặt bàn #{b.reservation_code || b.id}
                      </p>

                      <div style={{ background: "var(--bg-card)", borderRadius: 20, border: "1px solid var(--border)", padding: "24px", marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,rgba(107,143,62,0.15),rgba(47,91,62,0.08))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--matcha)" }}>
                            <Calendar size={18} strokeWidth={1.5} />
                          </div>
                          <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0 }}>Chọn ngày</h4>
                        </div>
                        <input
                          type="date"
                          value={rescheduleDate}
                          min={todayStr}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg-alt)", color: "var(--text)", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }}
                          onFocus={(e) => e.target.style.borderColor = "var(--matcha)"}
                          onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                        />
                      </div>

                      <div style={{ background: "var(--bg-card)", borderRadius: 20, border: "1px solid var(--border)", padding: "24px", marginBottom: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,rgba(107,143,62,0.15),rgba(47,91,62,0.08))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--matcha)" }}>
                            <Clock size={18} strokeWidth={1.5} />
                          </div>
                          <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0 }}>Chọn giờ</h4>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                          {filteredRescheduleTimeSlots.map((t) => (
                            <motion.button
                              key={t}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setRescheduleTime(t)}
                              style={{
                                padding: "8px 0", borderRadius: 10, fontSize: 12, fontWeight: 700, border: "1.5px solid",
                                borderColor: rescheduleTime === t ? "var(--matcha)" : "var(--border)",
                                background: rescheduleTime === t ? "linear-gradient(135deg,var(--matcha),var(--forest))" : "var(--bg-alt)",
                                color: rescheduleTime === t ? "#fff" : "var(--text-muted)",
                                cursor: "pointer", transition: "all 0.2s",
                                boxShadow: rescheduleTime === t ? "0 4px 12px rgba(107,143,62,0.2)" : "none"
                              }}
                            >
                              {t}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="modal-actions">
                      <button onClick={() => setShowRescheduleModal(null)} className="modal-btn-back" disabled={rescheduling === b.id}>Hủy</button>
                      <button onClick={handleConfirmReschedule} style={{ flex: 1, padding: "12px 24px", borderRadius: 50, border: "none", background: "linear-gradient(135deg, var(--matcha), var(--forest))", color: "white", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(107,143,62,0.2)" }} disabled={rescheduling === b.id || !rescheduleDate || !rescheduleTime}>Xác Nhận Đổi Lịch</button>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })()}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ maxWidth: 720, margin: "0 auto 24px" }}
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
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Spinner */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Loader2
              className="animate-spin"
              style={{
                width: 42,
                height: 42,
                color: "var(--matcha)",
                marginBottom: 16,
              }}
            />
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 14,
                margin: 0,
                tracking: "0.05em",
              }}
            >
              Đang tải dữ liệu từ hệ thống...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && view.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              maxWidth: 440,
              margin: "0 auto",
              textAlign: "center",
              padding: "48px 32px",
              background: "var(--bg-card)",
              border: "1.5px solid var(--border)",
              borderRadius: 32,
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                background: "rgba(107, 143, 62, 0.1)",
                color: "var(--matcha)",
              }}
            >
              <Sparkles size={24} />
            </div>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 24,
                fontWeight: 700,
                color: "var(--forest)",
                marginBottom: 8,
                marginTop: 0,
              }}
            >
              Chưa Có Lịch Đặt Bàn
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 28,
                marginTop: 0,
              }}
            >
              {tab === "upcoming" &&
                "Quý khách chưa có lịch hẹn đặt bàn trà nào sắp tới. Hãy chọn không gian phòng trà lý tưởng cho mình nhé."}
              {tab === "complete" && "Lịch sử đặt bàn hoàn thành trống."}
              {tab === "cancelled" && "Lịch sử đặt bàn đã hủy trống."}
            </p>
            {tab === "upcoming" && (
              <Link
                to="/booking"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "12px 24px",
                  borderRadius: 50,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  color: "#ffffff",
                  background:
                    "linear-gradient(135deg, var(--matcha), var(--forest))",
                  boxShadow: "0 4px 15px rgba(107, 143, 62, 0.2)",
                }}
              >
                <span>Đặt Bàn Ngay</span>
                <ChevronRight size={14} />
              </Link>
            )}
          </motion.div>
        )}

        {/* Booking Cards list layout */}
        {!loading && view.length > 0 && (
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
            initial="hidden"
            animate="show"
            style={{
              maxWidth: 720,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            {view.map((b) => (
              <motion.div
                key={b.id}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -3, boxShadow: "var(--shadow-lg)" }}
                transition={{ duration: 0.3 }}
                style={{
                  background: "var(--bg-card)",
                  border: "1.5px solid var(--border)",
                  borderRadius: 24,
                  padding: "28px 24px",
                  boxShadow: "var(--shadow-sm)",
                  transition: "box-shadow 0.3s, transform 0.3s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 16,
                    borderBottom: "1.5px solid var(--border)",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: "block",
                        fontSize: 9,
                        color: "var(--text-light)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 2,
                      }}
                    >
                      MÃ ĐẶT BÀN
                    </span>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 20,
                        fontWeight: 700,
                        color: "var(--forest)",
                        margin: 0,
                      }}
                    >
                      #{b.reservation_code || b.id}
                    </h3>
                  </div>
                  <div>{getStatusBadge(b.status)}</div>
                </div>

                <div className="card-info-grid">
                  {/* Table details */}
                  <div className="info-item">
                    <div className="info-icon">
                      <Coffee size={15} />
                    </div>
                    <div>
                      <span className="info-label">Không gian & Bàn</span>
                      <span className="info-value">
                        {b.table?.name || "Bàn trà"}{" "}
                        <span
                          style={{
                            color: "var(--text-light)",
                            fontWeight: "normal",
                          }}
                        >
                          •
                        </span>{" "}
                        {b.table?.area || "Khu vực"}
                      </span>
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="info-item">
                    <div className="info-icon">
                      <Users size={15} />
                    </div>
                    <div>
                      <span className="info-label">Số khách</span>
                      <span className="info-value">
                        {b.num_of_people} Người
                      </span>
                    </div>
                  </div>

                  {/* Date and Time details */}
                  <div className="info-item full-width">
                    <div className="info-icon">
                      <Calendar size={15} />
                    </div>
                    <div>
                      <span className="info-label">Thời gian hẹn</span>
                      <div
                        className="info-value"
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>{b.booking_date}</span>
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
                          <Clock size={13} />
                          {b.booking_time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Special Note */}
                  {b.note && (
                    <div
                      className="info-item full-width"
                      style={{
                        paddingTop: 16,
                        borderTop: "1px dashed var(--border)",
                        marginTop: 4,
                      }}
                    >
                      <div
                        className="info-icon"
                        style={{ background: "rgba(107, 143, 62, 0.05)" }}
                      >
                        <MessageSquare size={14} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <span className="info-label">
                          Ghi chú của quý khách
                        </span>
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--text-muted)",
                            margin: "4px 0 0",
                            fontStyle: "italic",
                            lineHeight: 1.5,
                          }}
                        >
                          "{b.note}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card CTA Actions */}
                {tab === "upcoming" && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 12,
                      marginTop: 20,
                      paddingTop: 16,
                      borderTop: "1.5px solid var(--border)",
                    }}
                  >
                    <motion.button
                      disabled={rescheduling === b.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowRescheduleModal(b.id);
                        setRescheduleDate(b.booking_date || todayStr);
                        setRescheduleTime(b.booking_time);
                      }}
                      className="reschedule-appointment-btn"
                    >
                      {rescheduling === b.id ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Đang Đổi...</span>
                        </>
                      ) : (
                        <>
                          <Calendar size={13} />
                          <span>Đổi Lịch Đặt Bàn</span>
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      disabled={cancelling === b.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCancelModal(b.id)}
                      className="cancel-appointment-btn"
                    >
                      {cancelling === b.id ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Đang Hủy...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 size={13} />
                          <span>Hủy Lịch Đặt Bàn</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                )}

              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <style>{`
        .tabs-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-bottom: 36px;
          flex-wrap: wrap;
        }
        .tab-btn {
          padding: 10px 20px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 14px;
          border: 1.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tab-btn.active {
          background: linear-gradient(135deg, var(--matcha), var(--forest));
          color: #ffffff;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(107, 143, 62, 0.15);
        }
        .tab-count {
          padding: 2px 8px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 700;
          background: var(--bg-alt);
          color: var(--text);
          transition: all 0.25s ease;
        }
        .tab-count.active {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .status-pending {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.18);
          color: #D97706;
        }
        .status-confirmed {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.18);
          color: #059669;
        }
        .status-cancelled {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.18);
          color: #DC2626;
        }
        .status-noshow {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.18);
          color: #D97706;
        }
        .status-checkedin {
          background: rgba(139, 92, 246, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.18);
          color: #7C3AED;
        }
        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #D97706;
          margin-right: 6px;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
        .card-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .info-item.full-width {
          grid-column: 1 / -1;
        }
        .info-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(107, 143, 62, 0.08);
          color: var(--matcha);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .info-label {
          display: block;
          font-size: 10px;
          color: var(--text-light);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.03em;
          margin-bottom: 2px;
        }
        .info-value {
          display: block;
          font-size: 13px;
          color: var(--text);
          font-weight: 600;
        }
        .reschedule-appointment-btn {
          padding: 8px 18px;
          border-radius: 50px;
          border: 1.5px solid rgba(107, 143, 62, 0.4);
          background: transparent;
          color: var(--matcha);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .reschedule-appointment-btn:hover {
          background: rgba(107, 143, 62, 0.08);
          border-color: var(--matcha);
        }
        .cancel-appointment-btn {
          padding: 8px 18px;
          border-radius: 50px;
          border: 1.5px solid rgba(239, 68, 68, 0.25);
          background: transparent;
          color: #EF4444;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .cancel-appointment-btn:hover {
          background: rgba(239, 68, 68, 0.06);
          border-color: #EF4444;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 576px) {
          .card-info-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Custom Cancellation Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(18, 30, 22, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-card {
          width: 100%;
          max-width: 480px;
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-radius: 28px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(18, 30, 22, 0.15);
          overflow: hidden;
        }
        .modal-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }
        .modal-warning-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.08);
          color: #EF4444;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .modal-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--forest);
          margin: 0;
        }
        .modal-body {
          margin-bottom: 28px;
        }
        .modal-message {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.6;
          text-align: center;
          margin: 0 0 20px 0;
        }
        .modal-booking-summary {
          background: var(--bg-alt);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 16px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 13px;
          border-bottom: 1px dashed var(--border);
        }
        .summary-row:last-child {
          border-bottom: none;
        }
        .summary-label {
          color: var(--text-light);
          font-weight: 500;
        }
        .summary-value {
          color: var(--text);
          font-weight: 600;
        }
        .summary-value.highlight {
          color: var(--matcha);
        }
        .modal-note {
          font-size: 11px;
          color: #EF4444;
          margin: 0;
          font-style: italic;
          line-height: 1.4;
          text-align: center;
        }
        .modal-actions {
          display: flex;
          gap: 12px;
        }
        .modal-btn-back {
          flex: 1;
          padding: 12px 24px;
          border-radius: 50px;
          border: 1.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-muted);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .modal-btn-back:hover {
          background: var(--bg-alt);
          color: var(--text);
        }
        .modal-btn-confirm {
          flex: 1;
          padding: 12px 24px;
          border-radius: 50px;
          border: 1.5px solid transparent;
          background: linear-gradient(135deg, #EF4444, #DC2626);
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }
        .modal-btn-confirm:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
        }
        .status-completed {
          background: rgba(107, 143, 62, 0.08);
          border: 1px solid rgba(107, 143, 62, 0.18);
          color: var(--matcha);
        }
      `}</style>

      <AnimatePresence>
        {showCancelModal &&
          (() => {
            const b = list.find((item) => item.id === showCancelModal);
            if (!b) return null;
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modal-overlay"
                onClick={() => setShowCancelModal(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="modal-card"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <div className="modal-warning-icon">
                      <AlertCircle size={28} />
                    </div>
                    <h3 className="modal-title">Xác Nhận Hủy Lịch Đặt</h3>
                  </div>

                  <div className="modal-body">
                    <p className="modal-message">
                      Quý khách có chắc chắn muốn hủy lịch đặt bàn trà này
                      không? Trải nghiệm trà đạo tinh tế đang chờ đón quý khách.
                    </p>

                    <div className="modal-booking-summary">
                      <div className="summary-row">
                        <span className="summary-label">Mã Đặt Bàn:</span>
                        <span className="summary-value highlight">
                          #{b.reservation_code || b.id}
                        </span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Không Gian:</span>
                        <span className="summary-value">
                          {b.table?.name || "Bàn trà"} (
                          {b.table?.area || "Khu vực"})
                        </span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Thời Gian:</span>
                        <span className="summary-value">
                          {b.booking_date} lúc {b.booking_time}
                        </span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Số Khách:</span>
                        <span className="summary-value">
                          {b.num_of_people} Người
                        </span>
                      </div>
                    </div>

                    <p className="modal-note">
                      * Lưu ý: Lịch đặt sau khi hủy sẽ không thể khôi phục. Quý
                      khách sẽ phải thực hiện đặt lại lịch mới.
                    </p>
                  </div>

                  <div className="modal-actions">
                    <button
                      onClick={() => setShowCancelModal(null)}
                      className="modal-btn-back"
                      disabled={cancelling === b.id}
                    >
                      Quay Lại
                    </button>
                    <button
                      onClick={handleConfirmCancel}
                      className="modal-btn-confirm"
                      disabled={cancelling === b.id}
                    >
                      Xác Nhận Hủy
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
      </AnimatePresence>
    </div>
  );
}
