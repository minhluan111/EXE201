import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
} from "@mui/material";
import { useAuth } from "../../context/useAuthContext.js";
import { adminGetBookings, adminUpdateBookingStatus } from "../../services/apiClient.js";
import AdminHeader from "../../components/admin/AdminHeader.jsx";

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

  const handleSearchClear = () => {
    setSearch("");
    setPage(1);
  };

  const handleStatusChange = async (id, newStatus) => {
    const res = await adminUpdateBookingStatus({ token, id, status: newStatus });
    if (res.ok) {
      fetchBookings();
    } else {
      alert("Cập nhật trạng thái thất bại: " + (res.message || "Lỗi hệ thống"));
    }
  };

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
              <Grid container spacing={3} alignItems="flex-end">
                <Grid item xs={12} sm={6} md={3.5}>
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
                <Grid item xs={12} sm={6} md={2.5}>
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
                <Grid item xs={12} sm={6} md={3.5}>
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
                      <MenuItem value="Confirmed">Đã xác nhận</MenuItem>
                      <MenuItem value="Completed">Đã hoàn thành</MenuItem>
                      <MenuItem value="Cancelled">Đã hủy lịch</MenuItem>
                      <MenuItem value="NoShow">Vắng mặt</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2.5}>
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
                            <FormControl fullWidth size="small">
                              <Select
                                value={
                                  String(booking.status || "").toLowerCase() === "completed"
                                    ? "Completed"
                                    : String(booking.status || "").toLowerCase() === "cancelled"
                                    ? "Cancelled"
                                    : String(booking.status || "").toLowerCase() === "noshow"
                                    ? "NoShow"
                                    : "Confirmed"
                                }
                                onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                sx={{
                                  fontSize: "13px",
                                  fontWeight: 500,
                                  height: "32px",
                                }}
                              >
                                <MenuItem value="Confirmed">Đã xác nhận</MenuItem>
                                <MenuItem value="Completed">Đã hoàn thành</MenuItem>
                                <MenuItem value="Cancelled">Đã hủy lịch</MenuItem>
                                <MenuItem value="NoShow">Vắng mặt</MenuItem>
                              </Select>
                            </FormControl>
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
    </Box>
  );
}
