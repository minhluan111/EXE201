import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Button,
  CircularProgress,
  Pagination,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FilterListIcon from "@mui/icons-material/FilterList";

import { useAuth } from "../../context/useAuthContext.js";
import { adminGetBookings, adminUpdateBookingStatus, adminConfirmBooking, adminRejectBooking, adminCheckInBooking } from "../../services/apiClient.js";
import AdminHeader from "../../components/admin/AdminHeader.jsx";
import { useAvailabilityHub } from "../../hooks/useAvailabilityHub.js";

// Harmonized Global Design Tokens matching index.css
const COLORS = {
  moss: "var(--matcha, #6B8F3E)",
  matchaLight: "var(--matcha-light, #8DAF5A)",
  forest: "var(--forest, #2F5B3E)",
  bg: "var(--bg, #F7F5EF)",
  card: "var(--bg-card, #FFFFFF)",
  alt: "var(--bg-alt, #EEEBD8)",
  text: "var(--text, #1C1C1A)",
  textMuted: "var(--text-muted, #6B6860)",
  border: "var(--border, rgba(107, 143, 62, 0.18))",
  shadowSm: "var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.06))",
  shadowMd: "var(--shadow-md, 0 8px 32px rgba(0,0,0,0.10))",
};

const getTodayFormatted = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ManageBookingsPage() {
  const { token, user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter states
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(getTodayFormatted());
  const [status, setStatus] = useState(""); // "" means All
  const [riskFilter, setRiskFilter] = useState(""); // "" means All
  const [quickPill, setQuickPill] = useState("all"); // all | pending | preferred | highRisk | confirmed
  const [sortBy, setSortBy] = useState("reviewPriority");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Action Menu state (⋮ dropdown)
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [activeMenuBooking, setActiveMenuBooking] = useState(null);

  // Check-in modal state
  const [checkInModal, setCheckInModal] = useState(null);
  const [checkInImage, setCheckInImage] = useState(null);
  const [checkInImagePreview, setCheckInImagePreview] = useState("");
  const [checkInNote, setCheckInNote] = useState("");
  const [checkInLoading, setCheckInLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Details Side Panel state (Defaults to null)
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    const res = await adminGetBookings({
      token,
      search: search || undefined,
      date: date || undefined,
      status: status || undefined,
      sortBy: sortBy || undefined,
      page,
      pageSize,
    });
    if (res.ok) {
      setList(res.data);
      setTotal(res.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [token, date, status, sortBy, page, pageSize]);

  // SignalR: auto-refresh
  useAvailabilityHub(() => {
    fetchBookings();
  }, !!token);

  const getStatusRank = (statusStr) => {
    const s = String(statusStr || "").toLowerCase();
    switch (s) {
      case "reserved": return 1;    // pending / Chờ xử lý
      case "confirmed": return 2;   // confirm / Đã xác nhận
      case "checkedin": return 3;   // đang sử dụng
      case "completed": return 4;   // complete / Hoàn thành
      case "cancelled": return 5;   // cancel / Đã hủy
      case "noshow": return 6;      // vắng mặt
      default: return 99;
    }
  };

  // Filter and sort list by status hierarchy: pending -> confirm -> complete -> cancel
  const filteredList = useMemo(() => {
    const res = list.filter((b) => {
      if (riskFilter && b.riskLevel !== riskFilter) return false;

      if (quickPill === "pending") {
        const isPending = String(b.status || "").toLowerCase() === "reserved";
        if (!isPending) return false;
      } else if (quickPill === "preferred") {
        if (b.bookingPriority !== "Preferred") return false;
      } else if (quickPill === "highRisk") {
        if (b.riskLevel !== "High") return false;
      } else if (quickPill === "confirmed") {
        if (String(b.status || "").toLowerCase() !== "confirmed") return false;
      }
      return true;
    });

    return [...res].sort((a, b) => {
      const rankA = getStatusRank(a.status);
      const rankB = getStatusRank(b.status);
      if (rankA !== rankB) return rankA - rankB;

      const dateCompare = String(a.booking_date || "").localeCompare(String(b.booking_date || ""));
      if (dateCompare !== 0) return dateCompare;
      return String(a.booking_time || "").localeCompare(String(b.booking_time || ""));
    });
  }, [list, riskFilter, quickPill]);

  // Calculate Summary Metrics
  const summaryMetrics = useMemo(() => {
    let pending = 0;
    let preferred = 0;
    let highRisk = 0;
    let confirmed = 0;

    list.forEach((b) => {
      const s = String(b.status || "").toLowerCase();
      // Thẻ số liệu không tính các đơn đã Hoàn thành (completed) hoặc Đã hủy (cancelled)
      if (s === "completed" || s === "cancelled") return;

      if (s === "reserved") pending++;
      if (b.bookingPriority === "Preferred") preferred++;
      if (b.riskLevel === "High") highRisk++;
      if (s === "confirmed") confirmed++;
    });

    return { pending, preferred, highRisk, confirmed };
  }, [list]);

  const handleAction = async (actionFn, id, options = {}) => {
    closeActionMenu();
    const res = await actionFn({ token, id, ...options });
    if (res.ok) {
      setList((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...res.data } : b))
      );
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking((prev) => ({ ...prev, ...res.data }));
      }
    } else {
      alert("Thao tác thất bại: " + (res.message || "Lỗi hệ thống"));
    }
  };

  const openActionMenu = (event, booking) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setActiveMenuBooking(booking);
  };

  const closeActionMenu = () => {
    setActionMenuAnchor(null);
    setActiveMenuBooking(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCheckInImage(file);
    setCheckInImagePreview(URL.createObjectURL(file));
  };

  const handleConfirmCheckIn = async () => {
    if (!checkInModal) return;
    setCheckInLoading(true);
    let imageUrl = null;

    if (checkInImage) {
      try {
        const formData = new FormData();
        formData.append("image", checkInImage);
        const uploadRes = await fetch(
          "https://api.imgbb.com/1/upload?key=0407d749b1703d2a6b06b9d2988625e3",
          { method: "POST", body: formData }
        );
        const uploadJson = await uploadRes.json();
        if (uploadJson.success) {
          imageUrl = uploadJson.data.url;
        } else {
          console.error("ImgBB upload error response:", uploadJson);
          alert(`Không thể tải ảnh lên: ${uploadJson.error?.message || "Lỗi không xác định từ ImgBB"}`);
        }
      } catch (err) {
        console.warn("Image upload failed, continuing without image", err);
        alert(`Lỗi kết nối khi tải ảnh lên: ${err.message || err}`);
      }
    }

    const res = await adminCheckInBooking({
      token,
      id: checkInModal.id,
      checkInImageUrl: imageUrl,
      checkInNote: checkInNote || undefined,
    });

    setCheckInLoading(false);
    if (res.ok) {
      setList((prev) =>
        prev.map((b) => (b.id === checkInModal.id ? { ...b, ...res.data } : b))
      );
      closeCheckInModal();
    } else {
      alert("Check-in thất bại: " + (res.message || "Lỗi hệ thống"));
    }
  };

  const closeCheckInModal = () => {
    setCheckInModal(null);
    setCheckInImage(null);
    setCheckInImagePreview("");
    setCheckInNote("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getStatusBadge = (statusStr, reviewStatusStr, confirmedBy) => {
    const s = String(statusStr || "").toLowerCase();
    let mainChip;
    if (s === "completed") {
      mainChip = <Chip label="✓ Hoàn thành" color="info" size="small" sx={{ fontWeight: 600, height: 22, fontSize: 11 }} />;
    } else if (s === "cancelled") {
      mainChip = <Chip label="Đã hủy" color="error" size="small" sx={{ fontWeight: 600, height: 22, fontSize: 11 }} />;
    } else if (s === "noshow") {
      mainChip = <Chip label="Vắng mặt" color="warning" size="small" sx={{ fontWeight: 600, height: 22, fontSize: 11 }} />;
    } else if (s === "checkedin") {
      mainChip = <Chip label="● Đang sử dụng" color="secondary" size="small" sx={{ fontWeight: 700, height: 22, fontSize: 11 }} />;
    } else if (s === "reserved") {
      mainChip = (
        <Chip
          label="Đã đặt"
          size="small"
          sx={{ fontWeight: 700, height: 22, fontSize: 11, bgcolor: "rgba(245, 158, 11, 0.15)", color: "#b45309" }}
        />
      );
    } else {
      mainChip = <Chip label="✓ Đã xác nhận" color="success" size="small" sx={{ fontWeight: 600, height: 22, fontSize: 11 }} />;
    }

    const isReviewed = reviewStatusStr === "Reviewed" || s === "confirmed" || s === "checkedin" || s === "completed";

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3, alignItems: "flex-start" }}>
        {mainChip}
        {s === "reserved" ? (
          <Typography variant="caption" sx={{ fontSize: "10px", color: "#b45309", fontWeight: 600 }}>
            Chờ xác nhận
          </Typography>
        ) : (
          isReviewed && s !== "cancelled" && s !== "noshow" && (
            <Typography variant="caption" sx={{ fontSize: "10px", color: COLORS.forest, fontWeight: 600 }}>
              {String(confirmedBy || "").includes("System")
                ? "Tự động xác nhận (Auto Confirm)"
                : "Đã được nhân viên xem xét"}
            </Typography>
          )
        )}
      </Box>
    );
  };

  const getPriorityBadge = (booking) => {
    const key = booking.bookingPriority || "Normal";
    if (key === "Preferred") {
      return (
        <Typography variant="caption" sx={{ fontSize: "11px", fontWeight: 700, color: "#d97706" }}>
          ⭐ Được ưu tiên
        </Typography>
      );
    }
    return (
      <Typography variant="caption" sx={{ fontSize: "11px", color: COLORS.textMuted, fontWeight: 500 }}>
        Bình thường
      </Typography>
    );
  };

  const getRiskBadge = (booking) => {
    const badge = booking.reviewBadge || "Bình thường";
    const displayType = booking.displayType || "Available";
    const risk = booking.riskLevel || "Available";

    if (badge === "Có lịch đặt tiếp theo" || displayType === "TimelineNotice") {
      return (
        <Chip
          label="🔵 Có lịch tiếp theo"
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "11px",
            height: "20px",
            borderColor: "#3b82f6",
            color: "#1d4ed8",
            bgcolor: "rgba(59, 130, 246, 0.12)",
            border: "1px solid #3b82f6",
          }}
        />
      );
    }
    if (badge.includes("Cao") || (displayType === "BookingRisk" && risk === "High")) {
      return (
        <Chip
          label="🔴 Khả năng chờ - Cao"
          size="small"
          sx={{ fontWeight: 700, fontSize: "11px", height: "20px", bgcolor: "#ef4444", color: "#ffffff" }}
        />
      );
    }
    if (badge.includes("Trung bình") || (displayType === "BookingRisk" && risk === "Medium")) {
      return (
        <Chip
          label="🟠 Khả năng chờ - Vừa"
          size="small"
          sx={{ fontWeight: 700, fontSize: "11px", height: "20px", bgcolor: "#f97316", color: "#ffffff" }}
        />
      );
    }
    if (badge.includes("Thấp") || (displayType === "BookingRisk" && risk === "Low")) {
      return (
        <Chip
          label="🟡 Khả năng chờ - Thấp"
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "11px",
            height: "20px",
            borderColor: "#eab308",
            color: "#a16207",
            bgcolor: "rgba(234, 179, 8, 0.15)",
            border: "1px solid #eab308",
          }}
        />
      );
    }
    if (displayType === "Conflict" || badge === "Đã được đặt") {
      return (
        <Chip
          label="🔴 Đã được đặt"
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: "11px", height: "20px", color: "#dc2626", borderColor: "#fca5a5" }}
        />
      );
    }
    return (
      <Chip
        label="🟢 An toàn"
        size="small"
        sx={{
          fontWeight: 700,
          fontSize: "11px",
          height: "20px",
          bgcolor: "rgba(107, 143, 62, 0.15)",
          color: COLORS.forest,
        }}
      />
    );
  };

  return (
    <Box sx={{ bgcolor: COLORS.bg, minHeight: "100vh", overflowX: "hidden" }}>
      {/* Global Header */}
      <AdminHeader
        title="Quản lý đặt bàn"
        subtitle="Theo dõi, đánh giá và xử lý các đơn đặt bàn theo thời gian thực."
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          BOUNDED CENTERED DASHBOARD WORKSPACE (MASTER CONTAINER)
          Single shared container (width: 100%, max-width: 1500px, mx: auto)
          Guarantees 100% Pixel-Perfect Vertical Left/Right Line Alignment!
         ═══════════════════════════════════════════════════════════════════════ */}
      <Box sx={{ py: 4, px: { xs: 2, md: 3.5 }, bgcolor: COLORS.bg, width: "100%", boxSizing: "border-box" }}>
        <Box
          sx={{
            width: "100%",
            maxWidth: "1500px",
            mx: "auto",
            transition: "all 0.35s var(--ease-smooth, cubic-bezier(0.4, 0, 0.2, 1))",
          }}
        >
          {/* ── 1. KPI SECTION (5 Cards CSS Grid Aligned 100% Flush to Master Container Bounds) ─ */}
          <Box
            sx={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(5, 1fr)" },
              gap: 2,
              mb: 2.5,
              boxSizing: "border-box",
            }}
          >
            <Card
              onClick={() => setQuickPill(quickPill === "pending" ? "all" : "pending")}
              sx={{
                borderRadius: 2.5,
                p: 2.2,
                cursor: "pointer",
                border: `1.5px solid ${quickPill === "pending" ? "var(--matcha)" : COLORS.border}`,
                bgcolor: COLORS.card,
                boxShadow: COLORS.shadowSm,
                transition: "all 0.2s var(--ease-smooth)",
                "&:hover": { transform: "translateY(-2px)", boxShadow: COLORS.shadowMd },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: "11.5px" }}>
                    CHỜ XỬ LÝ
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.text, my: 0.2 }}>
                    {summaryMetrics.pending}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: "12px" }}>
                    Đơn
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: "12px", bgcolor: "rgba(245, 158, 11, 0.12)", color: "#d97706" }}>
                  <AccessTimeIcon sx={{ fontSize: 26 }} />
                </Box>
              </Box>
            </Card>

            <Card
              onClick={() => setQuickPill(quickPill === "preferred" ? "all" : "preferred")}
              sx={{
                borderRadius: 2.5,
                p: 2.2,
                cursor: "pointer",
                border: `1.5px solid ${quickPill === "preferred" ? "var(--matcha)" : COLORS.border}`,
                bgcolor: COLORS.card,
                boxShadow: COLORS.shadowSm,
                transition: "all 0.2s var(--ease-smooth)",
                "&:hover": { transform: "translateY(-2px)", boxShadow: COLORS.shadowMd },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: "11.5px" }}>
                    ĐƯỢC ƯU TIÊN
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.text, my: 0.2 }}>
                    {summaryMetrics.preferred}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: "12px" }}>
                    Đơn
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: "12px", bgcolor: "rgba(234, 179, 8, 0.12)", color: "#ca8a04" }}>
                  <StarIcon sx={{ fontSize: 26 }} />
                </Box>
              </Box>
            </Card>

            <Card
              onClick={() => setQuickPill(quickPill === "highRisk" ? "all" : "highRisk")}
              sx={{
                borderRadius: 2.5,
                p: 2.2,
                cursor: "pointer",
                border: `1.5px solid ${quickPill === "highRisk" ? "#ef4444" : COLORS.border}`,
                bgcolor: COLORS.card,
                boxShadow: COLORS.shadowSm,
                transition: "all 0.2s var(--ease-smooth)",
                "&:hover": { transform: "translateY(-2px)", boxShadow: COLORS.shadowMd },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: "11.5px" }}>
                    RISK CAO
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.text, my: 0.2 }}>
                    {summaryMetrics.highRisk}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: "12px" }}>
                    Đơn
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: "12px", bgcolor: "rgba(239, 68, 68, 0.12)", color: "#dc2626" }}>
                  <WarningIcon sx={{ fontSize: 26 }} />
                </Box>
              </Box>
            </Card>

            <Card
              onClick={() => setQuickPill(quickPill === "confirmed" ? "all" : "confirmed")}
              sx={{
                borderRadius: 2.5,
                p: 2.2,
                cursor: "pointer",
                border: `1.5px solid ${quickPill === "confirmed" ? "var(--matcha)" : COLORS.border}`,
                bgcolor: COLORS.card,
                boxShadow: COLORS.shadowSm,
                transition: "all 0.2s var(--ease-smooth)",
                "&:hover": { transform: "translateY(-2px)", boxShadow: COLORS.shadowMd },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: "11.5px" }}>
                    ĐÃ XÁC NHẬN
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.text, my: 0.2 }}>
                    {summaryMetrics.confirmed}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: "12px" }}>
                    Đơn
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: "12px", bgcolor: "rgba(107, 143, 62, 0.12)", color: COLORS.forest }}>
                  <CheckCircleIcon sx={{ fontSize: 26 }} />
                </Box>
              </Box>
            </Card>

            <Card
              sx={{
                borderRadius: 2.5,
                p: 2.2,
                border: `1px solid ${COLORS.border}`,
                bgcolor: COLORS.card,
                boxShadow: COLORS.shadowSm,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: "11.5px" }}>
                    HÔM NAY
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.text, my: 0.2 }}>
                    {total}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: "12px" }}>
                    Tổng đơn
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: "12px", bgcolor: "rgba(59, 130, 246, 0.12)", color: "#2563eb" }}>
                  <CalendarTodayIcon sx={{ fontSize: 26 }} />
                </Box>
              </Box>
            </Card>
          </Box>

          {/* ── 2. FILTER SECTION (Modernized & Synchronized Aesthetics) ─────── */}
          <Card
            sx={{
              width: "100%",
              borderRadius: "16px",
              border: `1px solid ${COLORS.border}`,
              bgcolor: COLORS.card,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
              mb: 2.5,
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "1.8fr 1fr 1fr 1.2fr auto" },
                  gap: 1.5,
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Tìm mã đặt bàn / tên khách / SĐT..."
                  variant="outlined"
                  size="small"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  slotProps={{
                    input: {
                      startAdornment: <SearchIcon sx={{ color: COLORS.textMuted, mr: 1, fontSize: 19 }} />,
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      background: "#FAFAFA",
                      height: "40px",
                      transition: "all 0.2s ease",
                      "& fieldset": { border: `1px solid rgba(0,0,0,0.12)` },
                      "&:hover fieldset": { borderColor: "var(--forest, #2F5B3E)" },
                      "&.Mui-focused fieldset": { borderColor: "var(--forest, #2F5B3E)", borderWidth: "1.5px" },
                    },
                    "& input": { fontSize: "13px", color: COLORS.text, fontWeight: 500 },
                  }}
                />
                <TextField
                  fullWidth
                  type="date"
                  variant="outlined"
                  size="small"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setPage(1);
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      background: "#FAFAFA",
                      height: "40px",
                      transition: "all 0.2s ease",
                      "& fieldset": { border: `1px solid rgba(0,0,0,0.12)` },
                      "&:hover fieldset": { borderColor: "var(--forest, #2F5B3E)" },
                      "&.Mui-focused fieldset": { borderColor: "var(--forest, #2F5B3E)", borderWidth: "1.5px" },
                    },
                    "& input": { fontSize: "13px", color: COLORS.text, fontWeight: 500 },
                  }}
                />
                <FormControl fullWidth size="small">
                  <Select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    displayEmpty
                    sx={{
                      borderRadius: "10px",
                      background: "#FAFAFA",
                      height: "40px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: COLORS.text,
                      "& .MuiOutlinedInput-notchedOutline": { border: `1px solid rgba(0,0,0,0.12)` },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--forest, #2F5B3E)" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--forest, #2F5B3E)", borderWidth: "1.5px" },
                    }}
                  >
                    <MenuItem value="">Tất cả Risk</MenuItem>
                    <MenuItem value="High">🔴 Risk Cao</MenuItem>
                    <MenuItem value="Medium">🟠 Risk Vừa</MenuItem>
                    <MenuItem value="Low">🟡 Risk Thấp</MenuItem>
                    <MenuItem value="Available">🟢 An toàn</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <Select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setPage(1);
                    }}
                    displayEmpty
                    sx={{
                      borderRadius: "10px",
                      background: "#FAFAFA",
                      height: "40px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: COLORS.text,
                      "& .MuiOutlinedInput-notchedOutline": { border: `1px solid rgba(0,0,0,0.12)` },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--forest, #2F5B3E)" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--forest, #2F5B3E)", borderWidth: "1.5px" },
                    }}
                  >
                    <MenuItem value="">Tất cả trạng thái</MenuItem>
                    <MenuItem value="Reserved">⏳ Đã đặt (Chờ XN)</MenuItem>
                    <MenuItem value="Confirmed">✓ Đã xác nhận</MenuItem>
                    <MenuItem value="CheckedIn">👤 Đang sử dụng</MenuItem>
                    <MenuItem value="Completed">✅ Hoàn thành</MenuItem>
                    <MenuItem value="Cancelled">❌ Đã hủy</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearch("");
                    setDate(getTodayFormatted());
                    setStatus("");
                    setRiskFilter("");
                    setQuickPill("all");
                    setSortBy("reviewPriority");
                    setPage(1);
                  }}
                  startIcon={<RestartAltIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    borderRadius: "10px",
                    height: "40px",
                    px: 2,
                    borderColor: "rgba(0,0,0,0.14)",
                    color: COLORS.textMuted,
                    textTransform: "none",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#F4F5F1",
                      color: "var(--forest, #2F5B3E)",
                      borderColor: "var(--forest, #2F5B3E)",
                    },
                  }}
                >
                  Đặt lại
                </Button>
              </Box>

              {/* Quick Pills Row */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1.2,
                  flexWrap: "wrap",
                  alignItems: "center",
                  pt: 1.5,
                  borderTop: "1px solid rgba(0, 0, 0, 0.06)",
                }}
              >
                <Chip
                  label={`Tất cả (${total})`}
                  onClick={() => setQuickPill("all")}
                  sx={{
                    fontWeight: 700,
                    height: 30,
                    px: 0.5,
                    fontSize: "12px",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    bgcolor: quickPill === "all" ? "var(--forest, #2F5B3E)" : "#F4F5F1",
                    color: quickPill === "all" ? "#fff" : COLORS.text,
                    border: `1px solid ${quickPill === "all" ? "var(--forest, #2F5B3E)" : "rgba(0,0,0,0.08)"}`,
                    boxShadow: quickPill === "all" ? "0 2px 8px rgba(47, 91, 62, 0.25)" : "none",
                    "&:hover": { opacity: 0.9, transform: "translateY(-1px)" },
                  }}
                />
                <Chip
                  label={`⏳ Chờ xử lý (${summaryMetrics.pending})`}
                  onClick={() => setQuickPill("pending")}
                  sx={{
                    fontWeight: 650,
                    height: 30,
                    px: 0.5,
                    fontSize: "12px",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    bgcolor: quickPill === "pending" ? "#D97706" : "#FFFBEB",
                    color: quickPill === "pending" ? "#fff" : "#B45309",
                    border: `1px solid ${quickPill === "pending" ? "#D97706" : "#FDE68A"}`,
                    boxShadow: quickPill === "pending" ? "0 2px 8px rgba(217, 119, 6, 0.25)" : "none",
                    "&:hover": { opacity: 0.9, transform: "translateY(-1px)" },
                  }}
                />
                <Chip
                  label={`⭐ Được ưu tiên (${summaryMetrics.preferred})`}
                  onClick={() => setQuickPill("preferred")}
                  sx={{
                    fontWeight: 650,
                    height: 30,
                    px: 0.5,
                    fontSize: "12px",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    bgcolor: quickPill === "preferred" ? "#CA8A04" : "#FEFCE8",
                    color: quickPill === "preferred" ? "#fff" : "#A16207",
                    border: `1px solid ${quickPill === "preferred" ? "#CA8A04" : "#FEF08A"}`,
                    boxShadow: quickPill === "preferred" ? "0 2px 8px rgba(202, 138, 4, 0.25)" : "none",
                    "&:hover": { opacity: 0.9, transform: "translateY(-1px)" },
                  }}
                />
                <Chip
                  label={`🔴 Risk cao (${summaryMetrics.highRisk})`}
                  onClick={() => setQuickPill("highRisk")}
                  sx={{
                    fontWeight: 650,
                    height: 30,
                    px: 0.5,
                    fontSize: "12px",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    bgcolor: quickPill === "highRisk" ? "#DC2626" : "#FEF2F2",
                    color: quickPill === "highRisk" ? "#fff" : "#DC2626",
                    border: `1px solid ${quickPill === "highRisk" ? "#DC2626" : "#FCA5A5"}`,
                    boxShadow: quickPill === "highRisk" ? "0 2px 8px rgba(220, 38, 38, 0.25)" : "none",
                    "&:hover": { opacity: 0.9, transform: "translateY(-1px)" },
                  }}
                />
                <Chip
                  label={`✓ Đã xác nhận (${summaryMetrics.confirmed})`}
                  onClick={() => setQuickPill("confirmed")}
                  sx={{
                    fontWeight: 650,
                    height: 30,
                    px: 0.5,
                    fontSize: "12px",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    bgcolor: quickPill === "confirmed" ? "#15803D" : "#F0FDF4",
                    color: quickPill === "confirmed" ? "#fff" : "#15803D",
                    border: `1px solid ${quickPill === "confirmed" ? "#15803D" : "#86EFAC"}`,
                    boxShadow: quickPill === "confirmed" ? "0 2px 8px rgba(21, 128, 61, 0.25)" : "none",
                    "&:hover": { opacity: 0.9, transform: "translateY(-1px)" },
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* ── 3. BOOKING WORKSPACE (Bounded 2-Panel Flexible Layout) ──────────
              Flexbox container with alignItems: "stretch" guarantees Equal Height!
              When Detail opens: Table compresses left inside bounded 1500px workspace.
              Page width NEVER increases. Left edge of Table matches Left edge of Filter Card 100%!
             ═══════════════════════════════════════════════════════════════════ */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              gap: selectedBooking ? { xs: 2, md: 3 } : 0,
              alignItems: "stretch", // Equal Height Alignment for both Left and Right Panels
              flexDirection: { xs: "column", lg: "row" },
              transition: "all 0.35s var(--ease-smooth)",
            }}
          >
            {/* Left Panel: Booking List Panel (Compresses left when detail open, 100% full width when closed) */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0, // Prevents flex item overflow!
                transition: "all 0.35s var(--ease-smooth)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Card
                sx={{
                  width: "100%",
                  height: "100%", // Stretches top to bottom matching right panel
                  borderRadius: 2.5,
                  border: `1px solid ${COLORS.border}`,
                  bgcolor: COLORS.card,
                  boxShadow: COLORS.shadowSm,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                }}
              >
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 10, flexGrow: 1 }}>
                    <CircularProgress sx={{ color: "var(--matcha)" }} />
                  </Box>
                ) : filteredList.length === 0 ? (
                  <Box sx={{ py: 8, textAlign: "center", flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ color: COLORS.textMuted, fontWeight: 500 }}>
                      Không tìm thấy lịch đặt bàn nào phù hợp.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer sx={{ width: "100%", flexGrow: 1 }}>
                      <Table sx={{ width: "100%", tableLayout: "auto" }}>
                        <TableHead sx={{ bgcolor: "var(--bg-alt)" }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: COLORS.forest, py: 1.5, fontSize: "12px" }}>
                              BOOKING & GIỜ
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: COLORS.forest, py: 1.5, fontSize: "12px" }}>
                              KHÁCH HÀNG
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: COLORS.forest, py: 1.5, fontSize: "12px" }}>
                              LỊCH & BÀN
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: COLORS.forest, py: 1.5, fontSize: "12px" }}>
                              ĐÁNH GIÁ (PRIORITY & RISK)
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: COLORS.forest, py: 1.5, fontSize: "12px" }}>
                              TRẠNG THÁI
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: COLORS.forest, py: 1.5, fontSize: "12px", textAlign: "right" }}>
                              THAO TÁC
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredList.map((booking) => {
                            const isHistorical = ["completed", "cancelled", "noshow"].includes(
                              String(booking.status || "").toLowerCase()
                            );
                            const isHighRisk = booking.riskLevel === "High";
                            const isPending = String(booking.status || "").toLowerCase() === "reserved";
                            const isSelected = selectedBooking?.id === booking.id;

                            return (
                              <TableRow
                                key={booking.id}
                                hover
                                onClick={() => setSelectedBooking(booking)}
                                sx={{
                                  cursor: "pointer",
                                  height: 68,
                                  transition: "background 0.15s var(--ease-smooth)",
                                  opacity: isHistorical ? 0.65 : 1,
                                  bgcolor: isSelected ? "rgba(107, 143, 62, 0.08)" : "transparent",
                                  borderLeft: isHighRisk ? "4px solid #ef4444" : isPending ? "4px solid #f97316" : booking.bookingPriority === "Preferred" ? "4px solid #eab308" : "4px solid transparent",
                                }}
                              >
                                {/* 1. BOOKING & GIỜ */}
                                <TableCell sx={{ py: 1.2 }}>
                                  <Typography sx={{ fontWeight: 700, color: booking.bookingPriority === "Preferred" ? "#d97706" : COLORS.text, fontSize: "13px", lineHeight: 1.2 }}>
                                    {booking.bookingPriority === "Preferred" && "⭐ "}
                                    {booking.reservation_code}
                                  </Typography>
                                  <Typography sx={{ fontSize: "11px", color: COLORS.textMuted }}>
                                    {booking.booking_date} • {booking.booking_time}
                                  </Typography>
                                </TableCell>

                                {/* 2. KHÁCH HÀNG */}
                                <TableCell sx={{ py: 1.2 }}>
                                  <Typography sx={{ fontWeight: 600, fontSize: "13px", color: COLORS.text }}>
                                    {booking.guest_name}
                                  </Typography>
                                  <Typography sx={{ fontSize: "11px", color: COLORS.textMuted }}>
                                    {booking.guest_phone}
                                  </Typography>
                                  <Typography sx={{ fontSize: "10.5px", color: COLORS.textMuted }}>
                                    👥 {booking.num_of_people} khách
                                  </Typography>
                                </TableCell>

                                {/* 3. LỊCH & BÀN */}
                                <TableCell sx={{ py: 1.2 }}>
                                  <Typography sx={{ fontWeight: 700, fontSize: "13px", color: "#c2410c" }}>
                                    {booking.booking_time}
                                  </Typography>
                                  <Typography sx={{ fontSize: "11.5px", color: COLORS.text, fontWeight: 500 }}>
                                    {(() => {
                                      const rawName = booking.table?.name || booking.seatingAreaArea || booking.tableName || "Khu vực";
                                      return rawName.toLowerCase().startsWith("bàn") ? rawName : `Bàn ${rawName}`;
                                    })()}
                                  </Typography>
                                  <Typography sx={{ fontSize: "10.5px", color: COLORS.textMuted }}>
                                    {booking.num_of_people} người
                                  </Typography>
                                </TableCell>

                                {/* 4. ĐÁNH GIÁ (PRIORITY & RISK DUAL LINE) */}
                                <TableCell sx={{ py: 1.2 }}>
                                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3, alignItems: "flex-start" }}>
                                    {getPriorityBadge(booking)}
                                    {getRiskBadge(booking)}
                                  </Box>
                                </TableCell>

                                {/* 5. TRẠNG THÁI */}
                                <TableCell sx={{ py: 1.2 }}>
                                  {getStatusBadge(booking.status, booking.reviewStatus, booking.confirmedBy || booking.confirmed_by)}
                                </TableCell>

                                {/* 6. THAO TÁC (ACTION HIERARCHY) */}
                                <TableCell sx={{ py: 1.2, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                                  <Box sx={{ display: "flex", gap: 0.6, justifyContent: "flex-end", alignItems: "center" }}>
                                    {String(booking.status || "").toLowerCase() === "reserved" && (
                                      <>
                                        <Button
                                          size="small"
                                          variant="contained"
                                          onClick={() => handleAction(adminConfirmBooking, booking.id)}
                                          sx={{
                                            bgcolor: "var(--matcha)",
                                            "&:hover": { bgcolor: "var(--matcha-dark)" },
                                            fontSize: "11.5px",
                                            px: 1.2,
                                            py: 0.3,
                                            minWidth: "auto",
                                            fontWeight: 700,
                                            borderRadius: "6px",
                                            textTransform: "none",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          ✓ Xác nhận
                                        </Button>
                                        <Button
                                          size="small"
                                          variant="text"
                                          onClick={() => handleAction(adminRejectBooking, booking.id)}
                                          sx={{
                                            color: "#d32f2f",
                                            fontSize: "11.5px",
                                            px: 1,
                                            py: 0.3,
                                            minWidth: "auto",
                                            textTransform: "none",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          Từ chối
                                        </Button>
                                      </>
                                    )}

                                    {String(booking.status || "").toLowerCase() === "confirmed" && (
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => setCheckInModal(booking)}
                                        sx={{
                                          color: "var(--matcha)",
                                          borderColor: "var(--matcha)",
                                          "&:hover": { borderColor: "var(--matcha-dark)", bgcolor: "rgba(107, 143, 62, 0.08)" },
                                          fontSize: "11.5px",
                                          px: 1.2,
                                          py: 0.3,
                                          minWidth: "auto",
                                          fontWeight: 700,
                                          borderRadius: "6px",
                                          textTransform: "none",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        Check In
                                      </Button>
                                    )}

                                    {String(booking.status || "").toLowerCase() === "checkedin" && (
                                      <Button
                                        size="small"
                                        variant="contained"
                                        color="info"
                                        onClick={() => handleAction(adminUpdateBookingStatus, booking.id, { status: "Completed" })}
                                        sx={{
                                          fontSize: "11.5px",
                                          px: 1.2,
                                          py: 0.3,
                                          minWidth: "auto",
                                          fontWeight: 700,
                                          borderRadius: "6px",
                                          textTransform: "none",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        Hoàn thành
                                      </Button>
                                    )}

                                    {isHistorical && (
                                      <Button
                                        size="small"
                                        variant="text"
                                        color="primary"
                                        onClick={() => setSelectedBooking(booking)}
                                        sx={{
                                          fontSize: "11.5px",
                                          px: 1,
                                          py: 0.3,
                                          minWidth: "auto",
                                          textTransform: "none",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        Chi tiết
                                      </Button>
                                    )}

                                    <IconButton
                                      size="small"
                                      onClick={(e) => openActionMenu(e, booking)}
                                      sx={{ p: 0.4 }}
                                    >
                                      <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Pagination Footer */}
                    <Box
                      sx={{
                        p: 1.5,
                        px: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: `1px solid ${COLORS.border}`,
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: COLORS.textMuted, fontSize: "11.5px" }}>
                        Hiển thị 1 - {filteredList.length} trên {total} đơn
                      </Typography>
                      <Pagination
                        count={Math.ceil(total / pageSize)}
                        page={page}
                        onChange={(e, v) => setPage(v)}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </>
                )}
              </Card>
            </Box>

            {/* Right Panel: Detail Panel (Appears on right, exact same height as left panel!) */}
            <AnimatePresence>
              {selectedBooking && (
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, width: 0, transform: "scaleX(0.95)" }}
                  animate={{ opacity: 1, width: 400, transform: "scaleX(1)" }}
                  exit={{ opacity: 0, width: 0, transform: "scaleX(0.95)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  sx={{
                    width: { xs: "100%", lg: 400 },
                    flexShrink: 0,
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Card
                    sx={{
                      width: "100%",
                      height: "100%", // Equal height with left table panel!
                      borderRadius: 2.5,
                      border: `1px solid ${COLORS.border}`,
                      boxShadow: COLORS.shadowSm,
                      bgcolor: COLORS.card,
                      p: 2.5,
                      display: "flex",
                      flexDirection: "column",
                      boxSizing: "border-box",
                    }}
                  >
                    {/* Drawer Header (Fixed Top) */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, pb: 1, borderBottom: `1px solid ${COLORS.border}` }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.text, fontSize: "15px" }}>
                        Chi tiết đặt bàn
                      </Typography>
                      <IconButton onClick={() => setSelectedBooking(null)} size="small">
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Scrollable Body Content (Flex Grow) */}
                    <Box sx={{ overflowY: "auto", flexGrow: 1, pr: 0.5, mb: 1.5 }}>
                      {/* Reservation Code & Date */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.text, fontSize: "17px" }}>
                            {selectedBooking.reservation_code} <ContentCopyIcon sx={{ fontSize: 14, color: COLORS.textMuted, cursor: "pointer" }} />
                          </Typography>

                          {getStatusBadge(selectedBooking.status, selectedBooking.reviewStatus, selectedBooking.confirmedBy || selectedBooking.confirmed_by)}
                        </Box>
                        <Typography variant="caption" sx={{ color: COLORS.textMuted, display: "block", mt: 0.5, fontSize: "12px" }}>
                          📅 {selectedBooking.booking_date} • {selectedBooking.booking_time}
                        </Typography>
                      </Box>

                      {/* Section 1 — ĐÁNH GIÁ BOOKING */}
                      <Box sx={{ mb: 2.5, p: 1.5, borderRadius: "10px", bgcolor: COLORS.alt }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", display: "block", mb: 0.8, fontSize: "11px" }}>
                          ĐÁNH GIÁ BOOKING
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
                          {getPriorityBadge(selectedBooking)}
                          {getRiskBadge(selectedBooking)}
                        </Box>
                        <Typography variant="body2" sx={{ fontSize: "12px", color: COLORS.text, lineHeight: 1.5, mb: 0.5 }}>
                          {selectedBooking.bookingPriorityExplanation}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: "12px", color: COLORS.textMuted, lineHeight: 1.5 }}>
                          {selectedBooking.reviewExplanation || "Lịch đặt bàn an toàn."}
                        </Typography>
                      </Box>

                      {/* Section 2 — TRẠNG THÁI */}
                      <Box sx={{ mb: 2.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", display: "block", mb: 0.8, fontSize: "11px" }}>
                          TRẠNG THÁI
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS.text, fontSize: "13px" }}>
                          {selectedBooking.status === "Reserved" ? "Đã đặt" : selectedBooking.status}
                        </Typography>
                        <Typography variant="caption" sx={{ color: COLORS.textMuted, display: "block", fontSize: "11.5px" }}>
                          {selectedBooking.status === "Reserved" ? "Chờ xác nhận" : "Đã được nhân viên xem xét"}
                        </Typography>
                      </Box>

                      {/* Section 3 — THÔNG TIN KHÁCH */}
                      <Box sx={{ mb: 2.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", display: "block", mb: 0.8, fontSize: "11px" }}>
                          THÔNG TIN KHÁCH
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
                          <Typography variant="body2" sx={{ fontSize: "12.5px", fontWeight: 600, color: COLORS.text }}>
                            👤 {selectedBooking.guest_name}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: "12.5px", color: COLORS.text }}>
                            📞 {selectedBooking.guest_phone}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: "12.5px", color: COLORS.textMuted }}>
                            ✉ {selectedBooking.guest_email || "Chưa có email"}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: "12.5px", color: COLORS.textMuted }}>
                            👥 {selectedBooking.num_of_people} khách
                          </Typography>
                        </Box>
                      </Box>

                      {/* Section 4 — LỊCH & BÀN */}
                      <Box sx={{ mb: 2.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", display: "block", mb: 0.8, fontSize: "11px" }}>
                          LỊCH & BÀN
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
                          <Typography variant="body2" sx={{ fontSize: "12.5px", color: COLORS.text }}>
                            🕒 Thời gian: <strong>{selectedBooking.booking_time}</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: "12.5px", color: COLORS.text }}>
                            📅 Ngày: {selectedBooking.booking_date}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: "12.5px", color: COLORS.text }}>
                            🪑 Bàn: {selectedBooking.table?.name || "Corner 1"}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: "12.5px", color: COLORS.text }}>
                            👥 Số khách: {selectedBooking.num_of_people} người
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Sticky Action Footer (Fixed Bottom) */}
                    <Box sx={{ pt: 1.5, borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 1, alignItems: "center" }}>
                      {String(selectedBooking.status || "").toLowerCase() === "reserved" && (
                        <>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => handleAction(adminConfirmBooking, selectedBooking.id)}
                            sx={{
                              bgcolor: "var(--matcha)",
                              "&:hover": { bgcolor: "var(--matcha-dark)" },
                              borderRadius: "8px",
                              fontWeight: 700,
                              fontSize: "12.5px",
                              textTransform: "none",
                              py: 0.8,
                            }}
                          >
                            ✓ Xác nhận
                          </Button>
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => handleAction(adminRejectBooking, selectedBooking.id)}
                            sx={{
                              color: "#d32f2f",
                              borderColor: "#d32f2f",
                              "&:hover": { borderColor: "#b71c1c", bgcolor: "rgba(211, 47, 47, 0.04)" },
                              borderRadius: "8px",
                              fontSize: "12.5px",
                              textTransform: "none",
                              py: 0.8,
                            }}
                          >
                            Từ chối
                          </Button>
                        </>
                      )}

                      {String(selectedBooking.status || "").toLowerCase() === "confirmed" && (
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => setCheckInModal(selectedBooking)}
                          sx={{
                            color: "var(--matcha)",
                            borderColor: "var(--matcha)",
                            "&:hover": { borderColor: "var(--matcha-dark)", bgcolor: "rgba(107, 143, 62, 0.08)" },
                            borderRadius: "8px",
                            fontWeight: 700,
                            fontSize: "12.5px",
                            textTransform: "none",
                            py: 0.8,
                          }}
                        >
                          Check In
                        </Button>
                      )}

                      <IconButton onClick={(e) => openActionMenu(e, selectedBooking)}>
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Card>
                </Box>
              )}
            </AnimatePresence>
          </Box>
        </Box>
      </Box>

      {/* ── Action Menu Dropdown (⋮ Options) ─────────────────────────────────── */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={closeActionMenu}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "10px",
              minWidth: 160,
              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (activeMenuBooking) setSelectedBooking(activeMenuBooking);
            closeActionMenu();
          }}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary={<span style={{ fontSize: "12.5px" }}>Xem chi tiết</span>} />
        </MenuItem>

        {activeMenuBooking && String(activeMenuBooking.status).toLowerCase() === "reserved" && (
          <>
            <MenuItem onClick={() => handleAction(adminConfirmBooking, activeMenuBooking.id)}>
              <ListItemIcon>
                <CheckIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary={<span style={{ fontSize: "12.5px", fontWeight: 600, color: "#16a34a" }}>Xác nhận đặt bàn</span>} />
            </MenuItem>
            <MenuItem onClick={() => handleAction(adminRejectBooking, activeMenuBooking.id)}>
              <ListItemIcon>
                <CancelIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary={<span style={{ fontSize: "12.5px", color: "#dc2626" }}>Từ chối đặt bàn</span>} />
            </MenuItem>
          </>
        )}

        {activeMenuBooking && String(activeMenuBooking.status).toLowerCase() === "confirmed" && (
          <>
            <MenuItem
              onClick={() => {
                setCheckInModal(activeMenuBooking);
                closeActionMenu();
              }}
            >
              <ListItemIcon>
                <HowToRegIcon fontSize="small" color="secondary" />
              </ListItemIcon>
              <ListItemText primary={<span style={{ fontSize: "12.5px", fontWeight: 600 }}>Check In</span>} />
            </MenuItem>
            <MenuItem onClick={() => handleAction(adminUpdateBookingStatus, activeMenuBooking.id, { status: "Cancelled" })}>
              <ListItemIcon>
                <CancelIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary={<span style={{ fontSize: "12.5px", color: "#dc2626" }}>Hủy lịch đặt</span>} />
            </MenuItem>
          </>
        )}

        {activeMenuBooking && String(activeMenuBooking.status).toLowerCase() === "checkedin" && (
          <MenuItem onClick={() => handleAction(adminUpdateBookingStatus, activeMenuBooking.id, { status: "Completed" })}>
            <ListItemIcon>
              <DoneAllIcon fontSize="small" color="info" />
            </ListItemIcon>
            <ListItemText primary={<span style={{ fontSize: "12.5px", fontWeight: 600 }}>Hoàn thành đơn</span>} />
          </MenuItem>
        )}
      </Menu>

      {/* ── Check-in Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {checkInModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
              zIndex: 1300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
            onClick={(e) => e.target === e.currentTarget && closeCheckInModal()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              style={{
                background: COLORS.card,
                borderRadius: "20px",
                padding: "24px",
                width: "100%",
                maxWidth: "440px",
                boxShadow: COLORS.shadowMd,
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.forest, fontSize: "17px", mb: 0.5 }}>
                  Xác nhận Check-in
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.textMuted, fontSize: "12.5px" }}>
                  Đơn <strong>{checkInModal.reservation_code}</strong> — Khách: <strong>{checkInModal.guest_name}</strong>
                </Typography>
              </Box>

              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: `2px dashed ${checkInImagePreview ? "var(--matcha)" : COLORS.border}`,
                  borderRadius: "10px",
                  p: 1.5,
                  mb: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  background: checkInImagePreview ? "rgba(107, 143, 62, 0.04)" : COLORS.alt,
                  transition: "all 0.2s",
                  "&:hover": { borderColor: "var(--matcha)", background: "rgba(107, 143, 62, 0.06)" },
                  minHeight: 100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 0.8,
                  overflow: "hidden",
                }}
              >
                {checkInImagePreview ? (
                  <img
                    src={checkInImagePreview}
                    alt="Check-in preview"
                    style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 8, objectFit: "contain" }}
                  />
                ) : (
                  <>
                    <Typography sx={{ fontSize: "12.5px", color: COLORS.textMuted, fontWeight: 500 }}>
                      Nhấn để tải ảnh Check-in lên
                    </Typography>
                    <Typography sx={{ fontSize: "10.5px", color: COLORS.textMuted }}>
                      JPG, PNG, WEBP — tối đa 5MB
                    </Typography>
                  </>
                )}
              </Box>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              {checkInImagePreview && (
                <Button
                  size="small"
                  variant="text"
                  color="error"
                  sx={{ mb: 1.5, fontSize: "11px" }}
                  onClick={() => {
                    setCheckInImage(null);
                    setCheckInImagePreview("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Xóa ảnh
                </Button>
              )}

              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={3}
                label="Ghi chú / Chú thích (tuỳ chọn)"
                value={checkInNote}
                onChange={(e) => setCheckInNote(e.target.value)}
                placeholder="VD: Khách đã vào bàn góc window..."
                sx={{
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "12.5px" },
                }}
              />

              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={closeCheckInModal}
                  disabled={checkInLoading}
                  sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, fontSize: "12.5px" }}
                >
                  Hủy bỏ
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleConfirmCheckIn}
                  disabled={checkInLoading}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "12.5px",
                    background: `linear-gradient(135deg, var(--matcha), var(--forest))`,
                    "&:hover": { background: "var(--forest)" },
                  }}
                >
                  {checkInLoading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Xác nhận Check-in"}
                </Button>
              </Box>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
