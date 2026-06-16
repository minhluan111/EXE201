import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  CircularProgress,
  Pagination,
  Grid,
  Divider,
  Skeleton,
} from "@mui/material";
import { useAuth } from "../../context/useAuthContext.js";
import { adminGetBookings, adminUpdateBookingStatus, adminConfirmBooking, adminRejectBooking, adminCheckInBooking } from "../../services/apiClient.js";
import AdminHeader from "../../components/admin/AdminHeader.jsx";
import { useAvailabilityHub } from "../../hooks/useAvailabilityHub.js";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
  border: "rgba(0, 0, 0, 0.08)",
};

export default function ManageBookingsPage() {
  const { token, user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter states
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState(""); // "" means All
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Check-in modal state
  const [checkInModal, setCheckInModal] = useState(null); // booking object
  const [checkInImage, setCheckInImage] = useState(null); // File object
  const [checkInImagePreview, setCheckInImagePreview] = useState("");
  const [checkInNote, setCheckInNote] = useState("");
  const [checkInLoading, setCheckInLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Details modal state
  const [detailsModal, setdetailsModal] = useState(null); // booking object
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
  }, [detailsModal?.checkInImageUrl]);

  const fetchBookings = async () => {
    setLoading(true);
    const res = await adminGetBookings({
      token,
      search: search || undefined,
      date: date || undefined,
      status: status || undefined,
      page,
      pageSize,
    });
    if (res.ok) {
      setList(res.data);
      setTotal(res.total);
    }
    setLoading(false);
  };

  // Run query on state changes
  useEffect(() => {
    fetchBookings();
  }, [token, date, status, page, pageSize]);

  // SignalR: auto-refresh when other admin/staff makes changes
  useAvailabilityHub(() => {
    fetchBookings();
  }, !!token);

  const handleSearchClear = () => {
    setSearch("");
    setPage(1);
  };

  // Update local list instead of full refresh
  const handleAction = async (actionFn, id, options = {}) => {
    const res = await actionFn({ token, id, ...options });
    if (res.ok) {
      // Optimistically update local list so no full reload needed
      setList((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...res.data } : b))
      );
    } else {
      alert("Thao tác thất bại: " + (res.message || "Lỗi hệ thống"));
    }
  };

  // Handle file pick
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCheckInImage(file);
    setCheckInImagePreview(URL.createObjectURL(file));
  };

  // Upload image to a free hosting then do check-in
  const handleConfirmCheckIn = async () => {
    if (!checkInModal) return;
    setCheckInLoading(true);
    let imageUrl = null;

    if (checkInImage) {
      // Upload to imgbb (free image hosting) using binary file
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

  const compressImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.75) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            "image/jpeg",
            quality
          );
        };
      };
    });

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const getStatusBadge = (statusStr) => {
    const s = String(statusStr || "").toLowerCase();
    if (s === "completed") {
      return <Chip label="Đã hoàn thành" color="info" size="small" sx={{ fontWeight: 600 }} />;
    }
    if (s === "cancelled") {
      return <Chip label="Đã hủy lịch" color="error" size="small" sx={{ fontWeight: 600 }} />;
    }
    if (s === "noshow") {
      return <Chip label="Vắng mặt" color="warning" size="small" sx={{ fontWeight: 600 }} />;
    }
    if (s === "checkedin") {
      return <Chip label="Đã Check-in" color="secondary" size="small" sx={{ fontWeight: 600 }} />;
    }
    if (s === "reserved") {
      return <Chip label="Đã đặt (chờ XN)" color="default" size="small" sx={{ fontWeight: 600 }} />;
    }
    return <Chip label="Đã xác nhận" color="success" size="small" sx={{ fontWeight: 600 }} />;
  };

  return (
    <Box sx={{ bgcolor: "var(--bg)", minHeight: "100vh" }}>
      {/* Dynamic Header */}
      <AdminHeader
        title="Quản lý đặt bàn"
        subtitle="Xem danh sách, tìm kiếm và thay đổi trạng thái đặt bàn của thực khách theo thời gian thực."
      />

      {/* Main Content */}
      <Box sx={{ py: 6, bgcolor: COLORS.soft, minHeight: "65vh" }}>
        <Container maxWidth="lg">
          {/* Filter Card */}
          <Card
            sx={{
              borderRadius: 3,
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              mb: 4,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} sx={{ alignItems: "flex-end" }}>
                <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                    Tìm kiếm khách hàng
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Tên, Email hoặc Số điện thoại..."
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        background: "var(--bg-alt)",
                        "& fieldset": { border: "none" },
                        "&:hover fieldset": { border: "none" },
                        "&.Mui-focused fieldset": { border: "none" },
                      },
                      "& input": {
                        fontSize: "14px",
                        color: "var(--text)",
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                    Lọc theo ngày
                  </Typography>
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
                        borderRadius: "12px",
                        background: "var(--bg-alt)",
                        "& fieldset": { border: "none" },
                        "&:hover fieldset": { border: "none" },
                        "&.Mui-focused fieldset": { border: "none" },
                      },
                      "& input": {
                        fontSize: "14px",
                        color: "var(--text)",
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                    Trạng thái đặt bàn
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                      }}
                      displayEmpty
                      sx={{
                        borderRadius: "12px",
                        background: "var(--bg-alt)",
                        "& fieldset": { border: "none" },
                        "&:hover fieldset": { border: "none" },
                        "&.Mui-focused fieldset": { border: "none" },
                        fontSize: "14px",
                        color: "var(--text)",
                        "& .MuiSelect-select": {
                          minWidth: "120px",
                        }
                      }}
                    >
                      <MenuItem value="">Tất cả trạng thái</MenuItem>
                      <MenuItem value="Reserved">Đã đặt (chờ XN)</MenuItem>
                      <MenuItem value="Confirmed">Đã xác nhận</MenuItem>
                      <MenuItem value="CheckedIn">Đã Check-in</MenuItem>
                      <MenuItem value="Completed">Đã hoàn thành</MenuItem>
                      <MenuItem value="Cancelled">Đã hủy lịch</MenuItem>
                      <MenuItem value="NoShow">Vắng mặt</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      mb: 0.8,
                      visibility: "hidden",
                      display: { xs: "none", sm: "block" }
                    }}
                  >
                    &nbsp;
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => {
                      setSearch("");
                      setDate("");
                      setStatus("");
                      setPage(1);
                    }}
                    sx={{
                      borderRadius: "12px",
                      background: "var(--bg-alt)",
                      border: "none",
                      height: "40px",
                      color: "var(--text)",
                      textTransform: "none",
                      fontSize: "14px",
                      fontWeight: 600,
                      "&:hover": {
                        background: "rgba(0,0,0,0.06)",
                        border: "none",
                      }
                    }}
                  >
                    Xóa lọc
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Bookings Table Card */}
          <Card
            sx={{
              borderRadius: 3,
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
                <CircularProgress sx={{ color: COLORS.forest }} />
              </Box>
            ) : list.length === 0 ? (
              <Box sx={{ py: 12, textAlign: "center" }}>
                <Typography variant="h6" sx={{ color: "#888", fontWeight: 500 }}>
                  Không tìm thấy lịch đặt bàn nào phù hợp.
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead sx={{ bgcolor: "rgba(47, 91, 62, 0.05)" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: COLORS.forest }}>Mã Đặt Bàn</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: COLORS.forest }}>Khách Hàng</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: COLORS.forest }}>Thông Tin Liên Hệ</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: COLORS.forest }}>Ngày giờ tạo</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: COLORS.forest }}>Ngày giờ đặt</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: COLORS.forest }}>Số Khách / Bàn</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: COLORS.forest }}>Trạng Thái</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: COLORS.forest, width: 200 }}>Cập Nhật Trạng Thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {list.map((booking) => (
                        <TableRow key={booking.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{booking.reservation_code}</TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>
                              {booking.guest_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: "13px" }}>{booking.guest_phone}</Typography>
                            <Typography sx={{ fontSize: "12px", color: "#666" }}>{booking.guest_email}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 500, fontSize: "14px" }}>
                              {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }) : "—"}
                            </Typography>
                            <Typography sx={{ fontSize: "12px", color: COLORS.moss, fontWeight: 500 }}>
                              {booking.createdAt ? new Date(booking.createdAt).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              }) : ""}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 500, fontSize: "14px" }}>
                              {booking.booking_date}
                            </Typography>
                            <Typography sx={{ fontSize: "12px", color: COLORS.moss, fontWeight: 500 }}>
                              {booking.booking_time}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                              {booking.num_of_people} người
                            </Typography>
                            <Typography sx={{ fontSize: "12px", color: "#666" }}>
                              {booking.table?.name || "Bàn tự động"} ({booking.seating_area_table_type || "2-seat"})
                            </Typography>
                          </TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {String(booking.status || "").toLowerCase() === "reserved" && (
                                <>
                                  <Button size="small" variant="contained" color="success" onClick={() => handleAction(adminConfirmBooking, booking.id)}>
                                    Xác nhận
                                  </Button>
                                  <Button size="small" variant="outlined" color="error" onClick={() => handleAction(adminRejectBooking, booking.id)}>
                                    Từ chối
                                  </Button>
                                </>
                              )}
                              {String(booking.status || "").toLowerCase() === "confirmed" && (
                                <>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => setCheckInModal(booking)}
                                  >
                                    Check In
                                  </Button>
                                  <Button size="small" variant="outlined" color="error" onClick={() => handleAction(adminUpdateBookingStatus, booking.id, { status: "Cancelled" })}>
                                    Hủy
                                  </Button>
                                </>
                              )}
                              {String(booking.status || "").toLowerCase() === "checkedin" && (
                                <Button size="small" variant="contained" color="info" onClick={() => handleAction(adminUpdateBookingStatus, booking.id, { status: "Completed" })}>
                                  Hoàn thành
                                </Button>
                              )}
                              {String(booking.status || "").toLowerCase() === "completed" && (
                                <Button size="small" variant="outlined" color="primary" onClick={() => setdetailsModal(booking)}>
                                  Chi tiết
                                </Button>
                              )}
                              {["cancelled", "noshow"].includes(String(booking.status || "").toLowerCase()) && (
                                <Typography variant="caption" color="text.secondary">
                                  Không có hành động
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: `1px solid ${COLORS.border}`,
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Hiển thị {list.length} / {total} kết quả
                  </Typography>
                  <Pagination
                    count={Math.ceil(total / pageSize)}
                    page={page}
                    onChange={(e, v) => setPage(v)}
                    color="primary"
                    size="medium"
                  />
                </Box>
              </>
            )}
          </Card>
        </Container>
      </Box>

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
                background: "var(--bg-card, #fff)",
                borderRadius: "20px",
                padding: "32px",
                width: "100%",
                maxWidth: "480px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              }}
            >
              {/* Header */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.forest, mb: 0.5 }}>
                  📷 Xác nhận Check-in
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Đơn <strong>{checkInModal.reservation_code}</strong> — Khách: <strong>{checkInModal.guest_name}</strong>
                </Typography>
              </Box>

              {/* Image Upload */}
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: `2px dashed ${checkInImagePreview ? COLORS.moss : COLORS.border}`,
                  borderRadius: "12px",
                  p: 2,
                  mb: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  background: checkInImagePreview ? "rgba(120,139,69,0.04)" : "rgba(0,0,0,0.02)",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: COLORS.moss, background: "rgba(120,139,69,0.06)" },
                  minHeight: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 1,
                  overflow: "hidden",
                }}
              >
                {checkInImagePreview ? (
                  <img
                    src={checkInImagePreview}
                    alt="Check-in preview"
                    style={{ maxWidth: "100%", maxHeight: 220, borderRadius: 8, objectFit: "contain" }}
                  />
                ) : (
                  <>
                    <Typography sx={{ fontSize: "32px", lineHeight: 1 }}>🖼️</Typography>
                    <Typography sx={{ fontSize: "13px", color: "#888", fontWeight: 500 }}>
                      Nhấn để tải ảnh Check-in lên
                    </Typography>
                    <Typography sx={{ fontSize: "11px", color: "#aaa" }}>
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
                  sx={{ mb: 2, fontSize: "12px" }}
                  onClick={() => {
                    setCheckInImage(null);
                    setCheckInImagePreview("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Xóa ảnh
                </Button>
              )}

              {/* Note */}
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                label="Ghi chú / Chú thích (tuỳ chọn)"
                value={checkInNote}
                onChange={(e) => setCheckInNote(e.target.value)}
                placeholder="VD: Khách đã vào, bàn 2 góc window..."
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": { borderRadius: "12px", fontSize: "14px" },
                }}
              />

              {/* Actions */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={closeCheckInModal}
                  disabled={checkInLoading}
                  sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 600 }}
                >
                  Hủy bỏ
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleConfirmCheckIn}
                  disabled={checkInLoading}
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${COLORS.moss}, ${COLORS.forest})`,
                    "&:hover": { background: COLORS.forest },
                  }}
                >
                  {checkInLoading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Xác nhận Check-in"}
                </Button>
              </Box>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Details Modal ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {detailsModal && (
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
            onClick={(e) => e.target === e.currentTarget && setdetailsModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              style={{
                background: "var(--bg-card, #fff)",
                borderRadius: "20px",
                padding: "32px",
                width: "100%",
                maxWidth: "480px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              }}
            >
              {/* Header */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.forest, mb: 0.5 }}>
                  Chi tiết Check-in
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Đơn <strong>{detailsModal.reservation_code}</strong> — Khách: <strong>{detailsModal.guest_name}</strong>
                </Typography>
              </Box>

              <Box
                sx={{
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "12px",
                  p: 1,
                  mb: detailsModal.checkInImageUrl ? 1 : 3,
                  textAlign: "center",
                  background: "rgba(0,0,0,0.02)",
                  minHeight: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {detailsModal.checkInImageUrl ? (
                  <Box sx={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {!imgLoaded && (
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={200}
                        sx={{ borderRadius: "8px" }}
                        animation="wave"
                      />
                    )}
                    <img
                      src={detailsModal.checkInImageUrl}
                      alt="Check-in preview"
                      onLoad={() => setImgLoaded(true)}
                      style={{
                        maxWidth: "100%",
                        maxHeight: 300,
                        borderRadius: 8,
                        objectFit: "contain",
                        display: imgLoaded ? "block" : "none",
                        cursor: "pointer",
                      }}
                      onClick={() => window.open(detailsModal.checkInImageUrl, "_blank")}
                      title="Bấm để xem ảnh gốc sắc nét"
                    />
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: "14px", color: "#888" }}>
                    Không có hình ảnh đính kèm.
                  </Typography>
                )}
              </Box>

              {detailsModal.checkInImageUrl && (
                <Typography variant="caption" sx={{ display: "block", textAlign: "center", color: "#888", mb: 3 }}>
                  Bấm vào ảnh để xem ảnh gốc chất lượng cao
                </Typography>
              )}

              {/* Note Display */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: COLORS.forest, mb: 1 }}>
                  Ghi chú:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px", background: "var(--bg-alt)", minHeight: "60px" }}>
                  <Typography variant="body2" sx={{ color: "var(--text)" }}>
                    {detailsModal.checkInNote || "Không có ghi chú."}
                  </Typography>
                </Paper>
              </Box>

              {/* Actions */}
              <Button
                fullWidth
                variant="contained"
                onClick={() => setdetailsModal(null)}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${COLORS.moss}, ${COLORS.forest})`,
                  "&:hover": { background: COLORS.forest },
                }}
              >
                Đóng
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
