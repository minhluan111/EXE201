import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { bookingCheckStatus, tablesList } from "../services/apiClient.js";
import { useBookingContext } from "../context/useBookingContext.js";
import TableMap from "../components/booking/TableMap.jsx";

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ["Chọn ngày & giờ", "Chọn bàn", "Xác nhận"];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        marginBottom: 40,
      }}
    >
      {steps.map((label, i) => {
        const active = i === step;
        const complete = i < step;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < steps.length - 1 ? 1 : 0,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <motion.div
                animate={{
                  background: complete
                    ? "linear-gradient(135deg,#6B8F3E,#2F5B3E)"
                    : active
                      ? "linear-gradient(135deg,#8DAF5A,#6B8F3E)"
                      : "var(--bg-alt)",
                  borderColor:
                    complete || active ? "transparent" : "var(--border)",
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "2px solid",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: complete || active ? "#fff" : "var(--text-muted)",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {complete ? <CheckCircle size={18} /> : i + 1}
              </motion.div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  color: active ? "var(--matcha)" : "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  margin: "0 8px",
                  marginBottom: 24,
                  background: complete ? "var(--matcha)" : "var(--border)",
                  transition: "background 0.3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════
export default function BookingPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { selected, setSelected } = useBookingContext();

  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [step, setStep] = useState(0); // 0 = date/time, 1 = seat
  const [bookingDate, setBookingDate] = useState(
    () => location.state?.date || todayStr,
  );
  const [bookingTime, setBookingTime] = useState("");
  const [numPeople, setNumPeople] = useState(() => location.state?.guests || 2);
  const [floorTables, setFloorTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredTimeSlots = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayStrLocal = `${year}-${month}-${day}`;

    const isToday = bookingDate === todayStrLocal;

    if (!isToday) {
      return TIME_SLOTS;
    }

    return TIME_SLOTS.filter((slot) => {
      const [hours, minutes] = slot.split(":").map(Number);
      const slotDate = new Date(today);
      slotDate.setHours(hours, minutes, 0, 0);

      const timeDiffMs = slotDate.getTime() - today.getTime();
      const timeDiffMinutes = timeDiffMs / (1000 * 60);

      return timeDiffMinutes >= 30; // Must be at least 30 minutes in the future
    });
  }, [bookingDate]);

  // Reset bookingTime if it is no longer valid for the selected date
  useEffect(() => {
    if (bookingTime && !filteredTimeSlots.includes(bookingTime)) {
      setBookingTime("");
    }
  }, [bookingDate, filteredTimeSlots, bookingTime]);

  // Fetch table status when date/time changes and step is 1
  useEffect(() => {
    if (step !== 1 || !bookingDate || !bookingTime) return;

    let isMounted = true;

    setLoading(true);
    setSelected(null);

    const fetchStatus = () => {
      bookingCheckStatus({
        booking_date: bookingDate,
        booking_time: bookingTime,
        guestCount: numPeople,
      })
        .then((res) => {
          if (!isMounted) return;
          if (!res.ok) {
            setFloorTables([]);
            return;
          }

          const requiredCapacity = numPeople <= 2 ? 2 : 4;
          const suitableTables = res.data.filter(
            (table) => table.max_seats === requiredCapacity,
          );

          setFloorTables(suitableTables);

          // If the user has a selected table, check if it's still available in the new list
          const currentSelected = selectedRef.current;
          if (currentSelected) {
            const currentTableInNewList = suitableTables.find(
              (t) => t.name === currentSelected.name,
            );
            if (
              currentTableInNewList &&
              currentTableInNewList.status === "occupied"
            ) {
              setSelected(null);
              setError(
                `Bàn ${currentSelected.name} vừa mới được đặt bởi người khác. Vui lòng chọn bàn khác.`,
              );
            }
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    fetchStatus();

    // Poll every 3 seconds for fast status updates
    const interval = setInterval(fetchStatus, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [step, bookingDate, bookingTime, numPeople]);

  const canSelect = (table) => {
    if (!table) return false;
    const requiredCapacity = numPeople <= 2 ? 2 : 4;
    return table.status === "available" && table.max_seats === requiredCapacity;
  };

  const handleNextStep = () => {
    if (!bookingDate) {
      setError("Vui lòng chọn ngày.");
      return;
    }
    if (!bookingTime) {
      setError("Vui lòng chọn khung giờ.");
      return;
    }

    // Verify 30-minute buffer for same-day booking
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStrLocal = `${year}-${month}-${day}`;

    if (bookingDate === todayStrLocal) {
      const [hours, minutes] = bookingTime.split(":").map(Number);
      const slotDate = new Date(now);
      slotDate.setHours(hours, minutes, 0, 0);

      const diffMinutes = (slotDate.getTime() - now.getTime()) / (1000 * 60);
      if (diffMinutes < 30) {
        setError("Thời gian đặt bàn phải trước khi đến quán ít nhất 30 phút.");
        return;
      }
    }

    setError("");
    setStep(1);
  };

  const handleProceed = () => {
    if (!selected) {
      setError("Vui lòng chọn bàn.");
      return;
    }
    nav("/booking/confirm", {
      state: {
        booking_date: bookingDate,
        booking_time: bookingTime,
        num_of_people: numPeople,
        selected,
      },
    });
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* ── HERO ───────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "64px 24px 48px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, var(--forest-dark) 0%, var(--forest) 100%)",
          }}
        />
        {/* Orbs */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(141,175,90,0.12)",
            filter: "blur(70px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -80,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            filter: "blur(60px)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span
              style={{
                color: "rgba(175,215,120,0.8)",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Đặt chỗ
            </span>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(36px, 6vw, 64px)",
                fontWeight: 700,
                color: "#fff",
                margin: "8px 0 8px",
                lineHeight: 1,
              }}
            >
              Chọn bàn của bạn..
            </h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16 }}>
              Chọn ngày, khung giờ và bàn yêu thích trên sơ đồ tương tác.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────── */}
      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}
      >
        <StepBar step={step} />

        {step === 1 && (
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <button
              onClick={() => {
                setStep(0);
                setError("");
              }}
              style={{
                padding: "12px 28px",
                borderRadius: 50,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-muted)",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ← Quay lại
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 ? (
            /* ── STEP 1: Date & Time ──────────────────────── */
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.35 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 32,
              }}
            >
              {/* Date picker */}
              <div
                style={{
                  background: "var(--bg-card)",
                  borderRadius: 24,
                  border: "1px solid var(--border)",
                  padding: "32px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background:
                        "linear-gradient(135deg,rgba(107,143,62,0.15),rgba(47,91,62,0.08))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--matcha)",
                    }}
                  >
                    <Calendar size={22} strokeWidth={1.5} />
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--text)",
                      margin: 0,
                    }}
                  >
                    Chọn ngày
                  </h2>
                </div>
                <input
                  type="date"
                  value={bookingDate}
                  min={todayStr}
                  onChange={(e) => setBookingDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: 14,
                    border: "1.5px solid var(--border)",
                    background: "var(--bg-alt)",
                    color: "var(--text)",
                    fontSize: 16,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--matcha)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                  }}
                />
              </div>

              {/* Time slots */}
              <div
                style={{
                  background: "var(--bg-card)",
                  borderRadius: 24,
                  border: "1px solid var(--border)",
                  padding: "32px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background:
                        "linear-gradient(135deg,rgba(107,143,62,0.15),rgba(47,91,62,0.08))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--matcha)",
                    }}
                  >
                    <Clock size={22} strokeWidth={1.5} />
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--text)",
                      margin: 0,
                    }}
                  >
                    Chọn giờ
                  </h2>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 10,
                  }}
                >
                  {filteredTimeSlots.map((t) => (
                    <motion.button
                      key={t}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setBookingTime(t)}
                      style={{
                        padding: "10px 0",
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: 700,
                        border: "1.5px solid",
                        borderColor:
                          bookingTime === t ? "var(--matcha)" : "var(--border)",
                        background:
                          bookingTime === t
                            ? "linear-gradient(135deg,var(--matcha),var(--forest))"
                            : "var(--bg-alt)",
                        color: bookingTime === t ? "#fff" : "var(--text-muted)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow:
                          bookingTime === t
                            ? "0 4px 16px rgba(107,143,62,0.3)"
                            : "none",
                      }}
                    >
                      {t}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Guests */}
              <div
                style={{
                  background: "var(--bg-card)",
                  borderRadius: 24,
                  border: "1px solid var(--border)",
                  padding: "32px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background:
                        "linear-gradient(135deg,rgba(107,143,62,0.15),rgba(47,91,62,0.08))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--matcha)",
                    }}
                  >
                    <Users size={22} strokeWidth={1.5} />
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--text)",
                      margin: 0,
                    }}
                  >
                    Số người
                  </h2>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[1, 2, 3, 4].map((n) => (
                    <motion.button
                      key={n}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setNumPeople(n)}
                      style={{
                        flex: 1,
                        padding: "14px 0",
                        borderRadius: 14,
                        border: "1.5px solid",
                        borderColor:
                          numPeople === n ? "var(--matcha)" : "var(--border)",
                        background:
                          numPeople === n
                            ? "linear-gradient(135deg,var(--matcha),var(--forest))"
                            : "var(--bg-alt)",
                        color: numPeople === n ? "#fff" : "var(--text-muted)",
                        fontSize: 20,
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {n}
                    </motion.button>
                  ))}
                </div>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: 13,
                    marginTop: 14,
                  }}
                >
                  {numPeople <= 2 ? "→ Bàn đôi (2 ghế)" : "→ Bàn nhóm (4 ghế)"}
                </p>
              </div>
            </motion.div>
          ) : (
            /* ── STEP 2: Seating Map ───────────────────────── */
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "350px 1fr",
                  gap: 28,
                }}
                className="booking-grid"
              >
                {/* Summary card */}
                <div
                  style={{
                    position: "sticky",
                    top: 88,
                    alignSelf: "flex-start",
                  }}
                >
                  <div
                    style={{
                      background: "var(--bg-card)",
                      borderRadius: 24,
                      border: "1px solid var(--border)",
                      padding: "28px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 22,
                        fontWeight: 700,
                        color: "var(--text)",
                        margin: "0 0 20px",
                      }}
                    >
                      Chi tiết đặt bàn
                    </h3>

                    {[
                      {
                        icon: Calendar,
                        label: "Ngày",
                        value: new Date(bookingDate).toLocaleDateString(
                          "vi-VN",
                          {
                            weekday: "long",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          },
                        ),
                      },
                      { icon: Clock, label: "Giờ", value: bookingTime },
                      {
                        icon: Users,
                        label: "Số người",
                        value: `${numPeople} người`,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "14px 0",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: "rgba(107,143,62,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--matcha)",
                            flexShrink: 0,
                          }}
                        >
                          <item.icon size={16} />
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--text-muted)",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            {item.label}
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: "var(--text)",
                              marginTop: 1,
                            }}
                          >
                            {item.value}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Selected table */}
                    <AnimatePresence>
                      {selected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{
                            marginTop: 16,
                            padding: "16px",
                            borderRadius: 14,
                            background:
                              "linear-gradient(135deg,rgba(107,143,62,0.12),rgba(47,91,62,0.06))",
                            border: "1px solid rgba(107,143,62,0.25)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 10,
                              alignItems: "center",
                            }}
                          >
                            <MapPin
                              size={18}
                              style={{ color: "var(--matcha)" }}
                            />
                            <div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: 14,
                                  color: "var(--text)",
                                }}
                              >
                                {selected.name}
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "var(--text-muted)",
                                }}
                              >
                                {selected.max_seats} ghế
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {error && (
                      <div
                        style={{
                          marginTop: 14,
                          padding: "10px 14px",
                          borderRadius: 10,
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          color: "#EF4444",
                          fontSize: 13,
                        }}
                      >
                        {error}
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleProceed}
                      disabled={!selected}
                      style={{
                        marginTop: 20,
                        width: "100%",
                        padding: "15px",
                        borderRadius: 50,
                        border: "none",
                        cursor: selected ? "pointer" : "not-allowed",
                        background: selected
                          ? "linear-gradient(135deg,var(--matcha),var(--forest))"
                          : "var(--bg-alt)",
                        color: selected ? "#fff" : "var(--text-muted)",
                        fontSize: 15,
                        fontWeight: 700,
                        boxShadow: selected
                          ? "0 8px 28px rgba(107,143,62,0.35)"
                          : "none",
                        transition: "all 0.25s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      {selected ? "Xác nhận đặt chỗ" : "Chọn một bàn"}
                      {selected && <ChevronRight size={18} />}
                    </motion.button>
                  </div>
                </div>

                {/* Map */}
                <div>
                  <div
                    style={{
                      background: "var(--bg-card)",
                      borderRadius: 24,
                      border: "1px solid var(--border)",
                      padding: "28px",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 22,
                        fontWeight: 700,
                        color: "var(--text)",
                        margin: "0 0 8px",
                      }}
                    >
                      Chọn bàn phù hợp
                    </h3>

                    <p
                      style={{
                        color: "var(--text-muted)",
                        marginBottom: "24px",
                      }}
                    >
                      Hiển thị các bàn còn trống cho {numPeople} người
                    </p>
                    {loading ? (
                      <div
                        style={{
                          height: 300,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            textAlign: "center",
                            color: "var(--text-muted)",
                          }}
                        >
                          <div style={{ fontSize: 32, marginBottom: 12 }}></div>
                          <p>Đang tải sơ đồ bàn...</p>
                        </div>
                      </div>
                    ) : (
                      <TableMap
                        tables={floorTables}
                        selected={selected}
                        onSelect={(table) => {
                          if (canSelect(table)) {
                            setSelected(table);
                            setError("");
                          } else {
                            setError(
                              table.status === "available"
                                ? "Bàn này không phù hợp với số người của bạn"
                                : "Bàn này đã được đặt trong giờ này",
                            );
                          }
                        }}
                        canSelect={canSelect}
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom actions */}
        <div
          style={{
            marginTop: 36,
            display: "flex",
            justifyContent: step === 0 ? "flex-end" : "flex-start",
            gap: 12,
          }}
        >
          {step === 0 && (
            <div>
              {error && (
                <span
                  style={{ color: "#EF4444", fontSize: 13, marginRight: 16 }}
                >
                  {error}
                </span>
              )}
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNextStep}
                style={{
                  padding: "14px 36px",
                  borderRadius: 50,
                  border: "none",
                  background:
                    "linear-gradient(135deg,var(--matcha),var(--forest))",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 8px 28px rgba(107,143,62,0.35)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Chọn bàn ngồi <ChevronRight size={18} />
              </motion.button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .booking-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
