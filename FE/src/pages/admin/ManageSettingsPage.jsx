import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
} from "@mui/material";
import { Save, RefreshCw, Clock, ShieldAlert, Store, AlertCircle, Wand2 } from "lucide-react";
import { useAuth } from "../../context/useAuthContext.js";
import { adminGetRestaurantInfo, adminUpdateRestaurantInfo, adminParseMapUrl } from "../../services/apiClient.js";
import AdminHeader from "../../components/admin/AdminHeader.jsx";

export default function ManageSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parsingMap, setParsingMap] = useState(false);
  const [lastParsedUrl, setLastParsedUrl] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const [form, setForm] = useState({
    address: "",
    phone: "",
    openingHours: "",
    mapUrl: "",
    noShowAfterMinutes: 15,
    cancelBeforeMinutes: 30,
    bookingLeadMinutes: 15,
    confirmationDeadlineMinutes: 30,
    highRiskThresholdMinutes: 60,
    mediumRiskThresholdMinutes: 120,
    lowRiskThresholdMinutes: 180,
    autoConfirmThresholdMinutes: 180,
    openingTime: "08:00",
    closingTime: "20:00",
  });

  const loadData = async () => {
    setLoading(true);
    const res = await adminGetRestaurantInfo();
    if (res.ok && res.data) {
      const url = res.data.mapUrl || res.data.MapUrl || "";
      setLastParsedUrl(url);
      setForm({
        address: res.data.address || res.data.Address || "",
        phone: res.data.phone || res.data.Phone || "",
        openingHours: res.data.openingHours || res.data.OpeningHours || "",
        mapUrl: url,
        noShowAfterMinutes: res.data.noShowAfterMinutes ?? 15,
        cancelBeforeMinutes: res.data.cancelBeforeMinutes ?? 30,
        bookingLeadMinutes: res.data.bookingLeadMinutes ?? 15,
        confirmationDeadlineMinutes: res.data.confirmationDeadlineMinutes ?? 30,
        highRiskThresholdMinutes: res.data.highRiskThresholdMinutes ?? 60,
        mediumRiskThresholdMinutes: res.data.mediumRiskThresholdMinutes ?? 120,
        lowRiskThresholdMinutes: res.data.lowRiskThresholdMinutes ?? 180,
        autoConfirmThresholdMinutes: res.data.autoConfirmThresholdMinutes ?? 180,
        openingTime: res.data.openingTime ? String(res.data.openingTime).substring(0, 5) : "08:00",
        closingTime: res.data.closingTime ? String(res.data.closingTime).substring(0, 5) : "20:00",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAutoParseMapUrl = async () => {
    const url = form.mapUrl?.trim();
    if (!url || url === lastParsedUrl || !url.startsWith("http")) return;

    setParsingMap(true);
    setToast({ open: true, message: "🔍 Đang bóc tách thông tin từ Google Maps...", severity: "info" });

    const res = await adminParseMapUrl({ mapUrl: url });
    setParsingMap(false);

    if (res.ok && res.data && res.data.success) {
      setLastParsedUrl(url);
      setForm((prev) => ({
        ...prev,
        address: res.data.address || prev.address,
        phone: res.data.phone || prev.phone,
        openingHours: res.data.openingHours || prev.openingHours,
        openingTime: res.data.openingTime ? String(res.data.openingTime).substring(0, 5) : prev.openingTime,
        closingTime: res.data.closingTime ? String(res.data.closingTime).substring(0, 5) : prev.closingTime,
      }));
      setToast({ open: true, message: "✨ Đã tự động điền Địa chỉ, SĐT và Giờ mở cửa từ Google Maps!", severity: "success" });
    } else {
      setToast({ open: true, message: res.data?.message || "Không thể tự động bóc tách từ link Google Maps này. Bạn vẫn có thể nhập tay.", severity: "warning" });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const high = Number(form.highRiskThresholdMinutes);
    const med = Number(form.mediumRiskThresholdMinutes);
    const low = Number(form.lowRiskThresholdMinutes);

    if (high <= 0 || med <= 0 || low <= 0) {
      setToast({ open: true, message: "Các ngưỡng rủi ro phải lớn hơn 0 phút.", severity: "error" });
      return;
    }

    if (high >= med || med >= low) {
      setToast({ open: true, message: "Thứ tự ngưỡng rủi ro bắt buộc phải: Cao < Trung bình < Thấp.", severity: "error" });
      return;
    }

    setSaving(true);
    const payload = {
      address: form.address,
      phone: form.phone,
      openingHours: form.openingHours,
      mapUrl: form.mapUrl || null,
      noShowAfterMinutes: Number(form.noShowAfterMinutes),
      cancelBeforeMinutes: Number(form.cancelBeforeMinutes),
      bookingLeadMinutes: Number(form.bookingLeadMinutes),
      confirmationDeadlineMinutes: Number(form.confirmationDeadlineMinutes),
      highRiskThresholdMinutes: high,
      mediumRiskThresholdMinutes: med,
      lowRiskThresholdMinutes: low,
      autoConfirmThresholdMinutes: Number(form.autoConfirmThresholdMinutes),
      openingTime: form.openingTime.length === 5 ? `${form.openingTime}:00` : form.openingTime,
      closingTime: form.closingTime.length === 5 ? `${form.closingTime}:00` : form.closingTime,
    };

    const res = await adminUpdateRestaurantInfo(payload);
    setSaving(false);

    if (res.ok) {
      setToast({ open: true, message: "Cập nhật cấu hình nhà hàng thành công!", severity: "success" });
      loadData();
    } else {
      setToast({ open: true, message: res.message || "Cập nhật cấu hình thất bại. Vui lòng kiểm tra lại.", severity: "error" });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", bgcolor: "var(--bg)" }}>
        <CircularProgress sx={{ color: "var(--matcha)" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "var(--bg)", minHeight: "100vh", pb: 8 }}>
      <AdminHeader
        title="Cấu hình nhà hàng & Quy định đặt bàn"
        subtitle="Quản lý các thuộc tính nhà hàng và mốc thời gian quy định đặt/hủy/giữ bàn tự động."
      />

      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <form onSubmit={handleSave}>
          <Grid container spacing={3}>
            {/* THÔNG TIN NHÀ HÀNG */}
            <Grid item xs={12}>
              <Card sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px" }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                    <Store color="var(--matcha)" size={22} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--text)" }}>
                      Thông Tin Chung Nhà Hàng
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Địa chỉ nhà hàng"
                        value={form.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Số điện thoại liên hệ"
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Chuỗi giờ mở cửa (Ví dụ: 08:00 - 22:00)"
                        value={form.openingHours}
                        onChange={(e) => handleChange("openingHours", e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Link Google Map URL"
                        value={form.mapUrl}
                        onChange={(e) => handleChange("mapUrl", e.target.value)}
                        onBlur={handleAutoParseMapUrl}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAutoParseMapUrl();
                          }
                        }}
                        variant="outlined"
                        size="small"
                        placeholder="https://maps.app.goo.gl/..."
                        helperText={parsingMap ? "⏳ Đang tự động đọc thông tin từ Google Maps..." : "* Link gg map sẽ tự động dán dữ liệu từ gg map sang"}
                        InputProps={{
                          endAdornment: parsingMap ? (
                            <InputAdornment position="end">
                              <CircularProgress size={18} color="inherit" />
                            </InputAdornment>
                          ) : (
                            <InputAdornment position="end">
                              <Wand2 size={16} color="var(--matcha)" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* KHUNG GIỜ HOẠT ĐỘNG CHUẨN */}
            <Grid item xs={12} md={6}>
              <Card sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", height: "100%" }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                    <Clock color="var(--matcha)" size={22} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--text)" }}>
                      Khung Giờ Phục Vụ
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="time"
                        label="Giờ Mở Cửa"
                        value={form.openingTime}
                        onChange={(e) => handleChange("openingTime", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="time"
                        label="Giờ Đóng Cửa"
                        value={form.closingTime}
                        onChange={(e) => handleChange("closingTime", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ color: "var(--text-muted)", fontSize: 13, mt: 1 }}>
                        📌 Lưu ý: Hệ thống sẽ chặn các lịch đặt ngoài khung giờ phục vụ chuẩn này.
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* QUY ĐỊNH THỜI GIAN ĐẶT & HỦY BÀN */}
            <Grid item xs={12} md={6}>
              <Card sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", height: "100%" }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                    <ShieldAlert color="#eab308" size={22} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--text)" }}>
                      Quy Định Đặt & Hủy Bàn (Phút)
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Đặt trước tối thiểu (Booking Lead)"
                        value={form.bookingLeadMinutes}
                        onChange={(e) => handleChange("bookingLeadMinutes", e.target.value)}
                        size="small"
                        helperText="Số phút đặt trước giờ đến"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Chặn hủy trước giờ hẹn (Cancel Limit)"
                        value={form.cancelBeforeMinutes}
                        onChange={(e) => handleChange("cancelBeforeMinutes", e.target.value)}
                        size="small"
                        helperText="Hạn chót khách được hủy"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Thời gian chờ No-Show"
                        value={form.noShowAfterMinutes}
                        onChange={(e) => handleChange("noShowAfterMinutes", e.target.value)}
                        size="small"
                        helperText="Số phút trễ hẹn tối đa"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Hạn chót Staff duyệt đơn"
                        value={form.confirmationDeadlineMinutes}
                        onChange={(e) => handleChange("confirmationDeadlineMinutes", e.target.value)}
                        size="small"
                        helperText="Quá hạn sẽ tự động hủy"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* CẤU HÌNH NGƯỠNG ĐÁNH GIÁ RỦI RO (DECISION ENGINE THRESHOLDS) */}
            <Grid item xs={12}>
              <Card sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px" }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                    <AlertCircle color="#3b82f6" size={22} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--text)" }}>
                      Cấu Hình Ngưỡng Rủi Ro Timeline (Decision Engine)
                    </Typography>
                  </Box>
                  <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>
                    Các ngưỡng thời gian (tính bằng phút) xác định mức độ khoảng cách an toàn giữa 2 lượt đặt bàn kề nhau.
                    Quy tắc bắt buộc: <strong>Ngưỡng Cao &lt; Ngưỡng Trung Bình &lt; Ngưỡng Thấp</strong>.
                  </Alert>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Ngưỡng Rủi Ro Cao (High Risk)"
                        value={form.highRiskThresholdMinutes}
                        onChange={(e) => handleChange("highRiskThresholdMinutes", e.target.value)}
                        size="small"
                        helperText="Khoảng cách ngắn hơn mốc này = Rủi ro cao (Đỏ)"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Ngưỡng Rủi Ro Trung Bình (Medium Risk)"
                        value={form.mediumRiskThresholdMinutes}
                        onChange={(e) => handleChange("mediumRiskThresholdMinutes", e.target.value)}
                        size="small"
                        helperText="Khoảng cách trong mốc này = Rủi ro vừa (Cam)"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Ngưỡng Rủi Ro Thấp (Low Risk)"
                        value={form.lowRiskThresholdMinutes}
                        onChange={(e) => handleChange("lowRiskThresholdMinutes", e.target.value)}
                        size="small"
                        helperText="Khoảng cách trong mốc này = Rủi ro thấp (Vàng)"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* BUTTON SAVE */}
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshCw size={16} />}
                onClick={loadData}
                disabled={saving}
                sx={{ borderRadius: 50, px: 3 }}
              >
                Tải lại
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
                disabled={saving}
                sx={{
                  bgcolor: "var(--matcha)",
                  color: "#ffffff",
                  borderRadius: 50,
                  px: 4,
                  fontWeight: 700,
                  "&:hover": { bgcolor: "var(--forest)" },
                }}
              >
                {saving ? "Đang lưu..." : "Lưu Cấu Hình"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>

      {/* TOAST SNACKBAR */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((prev) => ({ ...prev, open: false }))} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
