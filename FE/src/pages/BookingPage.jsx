import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Lock,
  Check,
} from "lucide-react";
import { bookingCheckStatus, tablesList } from "../services/apiClient.js";
import { useBookingContext } from "../context/useBookingContext.js";
import { useTenant } from "@/context/TenantContext";
import TableMap from "../components/booking/TableMap.jsx";

const DEFAULT_TIME_SLOTS = [
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

function parseOpeningHours(str) {
  if (!str) return [];
  // Support various dash characters: hyphen, en-dash, em-dash, etc.
  const pattern = /(\d{1,2}:\d{2})\s*[-\u2013\u2014\u2012\u2010]\s*(\d{1,2}:\d{2})/g;
  const intervals = [];
  for (const match of str.matchAll(pattern)) {
    const [sh, sm] = match[1].split(":").map(Number);
    const [eh, em] = match[2].split(":").map(Number);
    intervals.push({ start: sh * 60 + sm, end: eh * 60 + em });
  }
  console.log("[BookingPage] openHours raw:", JSON.stringify(str), "→ intervals:", intervals);
  return intervals;
}

function generateTimeSlots(intervals) {
  if (intervals.length === 0) return DEFAULT_TIME_SLOTS;
  const slots = [];
  for (const { start, end } of intervals) {
    // Start from the first full hour >= start
    let t = Math.ceil(start / 60) * 60;
    if (t < start) t += 60;
    // Last bookable slot is 1 hour before closing
    while (t + 60 <= end) {
      const h = String(Math.floor(t / 60)).padStart(2, "0");
      const m = String(t % 60).padStart(2, "0");
      slots.push(`${h}:${m}`);
      t += 60;
    }
  }
  return slots.length > 0 ? slots : DEFAULT_TIME_SLOTS;
}

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
                  borderColor: complete
                    ? "var(--matcha)"
                    : active
                      ? "var(--matcha-light)"
                      : "rgba(255, 255, 255, 0.1)",
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
                  background: complete
                    ? "linear-gradient(135deg, var(--matcha), var(--forest))"
                    : active
                      ? "linear-gradient(135deg, var(--matcha-light), var(--matcha))"
                      : "var(--bg-alt)",
                  transition: "background 0.3s ease, border-color 0.3s ease",
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
  const { tenant } = useTenant();
  const isMonari = tenant?.name?.toLowerCase().includes("monari") || tenant?.tenantName?.toLowerCase().includes("monari");
  const isComTam = tenant?.name?.toLowerCase().includes("cơm tấm") || tenant?.tenantName?.toLowerCase().includes("cơm tấm") || localStorage.getItem("tenant_is_comtam") === "true";
  const isSamHouse = tenant?.name?.toLowerCase().includes("sam house") || tenant?.tenantName?.toLowerCase().includes("samhouse") || localStorage.getItem("tenant_is_samhouse") === "true";
  const isMonQuanChat = tenant?.name?.toLowerCase().includes("quảng") || tenant?.tenantName?.toLowerCase().includes("monquanchat") || localStorage.getItem("tenant_is_monquanchat") === "true";
  const isHoaTeaRoom = tenant?.name?.toLowerCase().includes("hoa") || tenant?.name?.toLowerCase().includes("hoà") || tenant?.name?.toLowerCase().includes("hòa") || tenant?.tenantName?.toLowerCase().includes("hoa") || localStorage.getItem("tenant_is_hoatearoom") === "true";
  const isEmCoffee = tenant?.name?.toLowerCase().includes("em coffee") || tenant?.name?.toLowerCase() === "em" || tenant?.tenantName?.toLowerCase().includes("emcoffee") || localStorage.getItem("tenant_is_emcoffee") === "true";
  const isTaoTao = tenant?.name?.toLowerCase().includes("táo") || tenant?.name?.toLowerCase().includes("taotao") || String(tenant?.tenantName).toLowerCase().includes("taotao") || localStorage.getItem("tenant_is_taotao") === "true";
  const isHanHuyen = tenant?.name?.toLowerCase().includes("hàn") || tenant?.name?.toLowerCase().includes("hanhuyen") || String(tenant?.tenantName).toLowerCase().includes("hanhuyen") || localStorage.getItem("tenant_is_hanhuyen") === "true";
  const isCochin = tenant?.name?.toLowerCase().includes("cochin") || tenant?.tenantName?.toLowerCase().includes("cochin") || String(tenant?.tenantName).toLowerCase().includes("cochin") || localStorage.getItem("tenant_is_cochin") === "true";
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
  const [legendOpen, setLegendOpen] = useState(false);
  const [showLegendHelp, setShowLegendHelp] = useState(false);

  // Build time slots from tenant opening hours
  const tenantTimeSlots = useMemo(() => {
    const openHours = tenant?.openHours || tenant?.openingHours;
    const intervals = parseOpeningHours(openHours);
    return generateTimeSlots(intervals);
  }, [tenant]);

  const filteredTimeSlots = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayStrLocal = `${year}-${month}-${day}`;

    const isToday = bookingDate === todayStrLocal;

    if (!isToday) {
      return tenantTimeSlots;
    }

    return tenantTimeSlots.filter((slot) => {
      const [hours, minutes] = slot.split(":").map(Number);
      const slotDate = new Date(today);
      slotDate.setHours(hours, minutes, 0, 0);

      const timeDiffMs = slotDate.getTime() - today.getTime();
      const timeDiffMinutes = timeDiffMs / (1000 * 60);
      const leadTime = tenant?.bookingLeadMinutes ?? 15;

      return timeDiffMinutes >= leadTime; // Must be at least leadTime minutes in the future
    });
  }, [bookingDate, tenantTimeSlots, tenant?.bookingLeadMinutes]);

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

          const suitableTables = res.data.filter((table) => {
            if (isMonari) {
              if (numPeople <= 2) {
                return table.max_seats === 2;
              }
              if (numPeople <= 4) {
                return table.max_seats === 4;
              }
              return table.max_seats === 8;
            }
            return table.max_seats >= numPeople;
          });

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
    if (table.status !== "available") return false;
    return floorTables.some((t) => t.name === table.name || t.id === table.id);
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
      const leadTime = tenant?.bookingLeadMinutes ?? 15;
      if (diffMinutes < leadTime) {
        setError(`Thời gian đặt bàn phải trước khi đến quán ít nhất ${leadTime} phút.`);
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
            background: isComTam ? "rgba(224,123,57,0.12)" : (isSamHouse ? "rgba(139,69,19,0.12)" : (isMonQuanChat ? "rgba(139,26,26,0.12)" : (isHoaTeaRoom ? "rgba(46,111,64,0.12)" : (isEmCoffee ? "rgba(139,90,43,0.12)" : (isTaoTao ? "rgba(155,46,34,0.12)" : (isHanHuyen ? "rgba(97,130,105,0.12)" : "rgba(141,175,90,0.12)")))))),
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
                color: "var(--matcha)",
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
              Chọn bàn của bạn
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
                      background: isComTam
                        ? "linear-gradient(135deg,rgba(224,123,57,0.15),rgba(100,45,10,0.08))"
                        : "linear-gradient(135deg,rgba(107,143,62,0.15),rgba(47,91,62,0.08))",
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(64px, 1fr))", gap: 10 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <motion.button
                      key={n}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setNumPeople(n)}
                      style={{
                        padding: "10px 0",
                        borderRadius: 14,
                        border: "1.5px solid",
                        borderColor:
                          numPeople === n ? "var(--matcha)" : "var(--border)",
                        background:
                          numPeople === n
                            ? "linear-gradient(135deg,var(--matcha),var(--forest))"
                            : "var(--bg-alt)",
                        color: numPeople === n ? "#fff" : "var(--text)",
                        fontSize: 18,
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {n} {n === 8 ? "+" : ""}
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
                  {isMonQuanChat ? "→ Bàn phù hợp cho nhóm từ 4-6 người" : (numPeople <= 2 ? "→ Bàn đôi (2 ghế)" : (numPeople <= 4 ? "→ Bàn nhóm (4 ghế)" : "→ Bàn nhóm (6-10 ghế)"))}
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
                  className="hide-scrollbar"
                  style={{
                    position: "sticky",
                    top: 80,
                    alignSelf: "flex-start",
                    maxHeight: legendOpen ? "calc(100vh - 80px)" : "none",
                    overflowY: legendOpen ? "auto" : "visible",
                  }}
                >
                  <div
                    style={{
                      background: "var(--bg-card)",
                      borderRadius: 20,
                      border: "1px solid var(--border)",
                      padding: "20px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 22,
                        fontWeight: 700,
                        color: "var(--text)",
                        margin: "0 0 12px",
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
                          padding: "9px 0",
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
                        marginTop: 14,
                        width: "100%",
                        padding: "12px",
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

                  {/* LEGEND PANEL CARD UNDER BOOKING DETAILS */}
                  <div
                    style={{
                      background: "var(--bg-card)",
                      borderRadius: 20,
                      border: "1px solid var(--border)",
                      padding: "16px 20px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
                      marginTop: 16,
                    }}
                  >
                    <div
                      onClick={() => setLegendOpen(!legendOpen)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: 19,
                          fontWeight: 700,
                          color: "var(--text)",
                          margin: 0,
                        }}
                      >
                        Hướng dẫn trạng thái bàn
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <ChevronDown
                          size={18}
                          color="var(--text)"
                          style={{
                            transform: legendOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                          }}
                        />
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowLegendHelp(!showLegendHelp);
                          }}
                          onMouseEnter={() => setShowLegendHelp(true)}
                          onMouseLeave={() => setShowLegendHelp(false)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            border: "1.5px solid var(--text-muted)",
                            color: "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            position: "relative",
                          }}
                        >
                          ?
                          <AnimatePresence>
                            {showLegendHelp && (
                              <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  position: "absolute",
                                  right: 0,
                                  top: "calc(100% + 10px)",
                                  width: 260,
                                  background: "var(--bg-card)",
                                  border: "1px solid var(--border)",
                                  borderRadius: 14,
                                  padding: "12px 14px",
                                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                                  zIndex: 100,
                                  textAlign: "left",
                                  cursor: "default",
                                }}
                              >
                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ color: "#3b82f6" }}>💡</span> Ý nghĩa trạng thái
                                </div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, fontWeight: "normal" }}>
                                  Hệ thống tự động phân tích và gợi ý tình trạng bàn dựa trên lịch đặt chỗ thực tế, giúp bạn dễ dàng chọn vị trí và thời gian phù hợp nhất.
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {legendOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 14,
                              marginTop: 16,
                              borderTop: "1px solid var(--border)",
                              paddingTop: 16,
                            }}
                          >
                            {[
                              {
                                color: "#22c55e",
                                bg: "rgba(34, 197, 94, 0.15)",
                                title: "Còn trống",
                                desc: "Bàn còn trống, sẵn sàng phục vụ.",
                                icon: <Check size={11} color="#ffffff" strokeWidth={3} />,
                              },
                              {
                                color: "#3b82f6",
                                bg: "rgba(59, 130, 246, 0.15)",
                                title: "Có lịch đặt tiếp theo",
                                desc: "Bàn này đã có khách đặt vào khung giờ sau. Nếu bạn dự định ngồi lâu, cửa hàng có thể sẽ cần hỗ trợ sắp xếp chỗ ngồi để phục vụ khách tiếp theo.",
                                icon: <Clock size={11} color="#ffffff" strokeWidth={2.5} />,
                              },
                              {
                                color: "#eab308",
                                bg: "rgba(234, 179, 8, 0.15)",
                                title: "Có khả năng phải chờ thấp",
                                desc: "Bàn này đã có khách đặt trước bạn nhưng khoảng cách giữa hai lượt đặt khá an toàn. Thông thường cửa hàng vẫn có thể chuẩn bị bàn đúng giờ.",
                                icon: <span style={{ color: "#ffffff", fontWeight: 900, fontSize: 12, lineHeight: 1, fontFamily: "system-ui, sans-serif" }}>!</span>,
                              },
                              {
                                color: "#f97316",
                                bg: "rgba(249, 115, 22, 0.15)",
                                title: "Có khả năng phải chờ",
                                desc: "Bàn này đã có khách đặt ở khung giờ trước bạn. Có khả năng thấp nếu khách trước dùng bàn lâu hơn dự kiến, bạn có thể cần chờ thêm hoặc được cửa hàng hỗ trợ đổi sang bàn khác.",
                                icon: <span style={{ color: "#ffffff", fontWeight: 900, fontSize: 12, lineHeight: 1, fontFamily: "system-ui, sans-serif" }}>!</span>,
                              },
                              {
                                color: "#ef4444",
                                bg: "rgba(239, 68, 68, 0.15)",
                                title: "Có khả năng phải chờ cao",
                                desc: "Bàn này đã có khách đặt ở khung giờ trước bạn. Nếu khách trước dùng bàn lâu hơn dự kiến, bạn có thể cần chờ thêm hoặc được cửa hàng hỗ trợ đổi sang bàn khác.",
                                icon: <span style={{ color: "#ffffff", fontWeight: 900, fontSize: 12, lineHeight: 1, fontFamily: "system-ui, sans-serif" }}>!</span>,
                              },
                              {
                                color: "#6b7280",
                                bg: "rgba(107, 114, 128, 0.15)",
                                title: "Đã được đặt",
                                desc: "Bàn đã có khách đặt trong khung giờ bạn chọn.",
                                icon: <Calendar size={11} color="#ffffff" strokeWidth={2.5} />,
                              },
                              {
                                color: "#4b5563",
                                bg: "rgba(75, 85, 99, 0.15)",
                                title: "Bàn đã khóa",
                                desc: "Bàn đang tạm ngừng phục vụ hoặc bảo trì.",
                                icon: <Lock size={11} color="#ffffff" strokeWidth={2.5} />,
                              },
                            ].map((item, index) => (
                              <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                <div
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    background: item.bg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    marginTop: 1,
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 18,
                                      height: 18,
                                      borderRadius: "50%",
                                      background: item.color,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {item.icon}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: 13.5, fontWeight: 700, color: item.color }}>
                                    {item.title}
                                  </div>
                                  <div style={{ fontSize: 12, color: "var(--text)", marginTop: 2, lineHeight: "1.45" }}>
                                    {item.desc}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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

                    {/* BLUE INFO BANNER BELOW TABLES */}
                    <div
                      style={{
                        marginTop: 28,
                        padding: "16px 20px",
                        borderRadius: 16,
                        background: "rgba(59, 130, 246, 0.08)",
                        border: "1px solid rgba(59, 130, 246, 0.22)",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: "1.5px solid #3b82f6",
                          color: "#3b82f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: "bold",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        i
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text)", lineHeight: "1.5" }}>
                        <div style={{ fontWeight: 600, color: "#1d4ed8" }}>Các trạng thái đánh giá dựa trên lịch đặt hiện tại và có thể thay đổi theo thời gian.</div>
                        <div style={{ marginTop: 2, color: "var(--text-muted)" }}>Bạn vẫn có thể chọn bàn khác hoặc thay đổi thời gian để có nhiều lựa chọn phù hợp hơn.</div>
                      </div>
                    </div>
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
