import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Plus, Edit2, Trash2, Layers, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/useAuthContext.js";
import {
  adminGetSeatingAreas,
  adminCreateSeatingArea,
  adminUpdateSeatingArea,
  adminDeleteSeatingArea,
} from "../../services/apiClient.js";
import AdminHeader from "../../components/admin/AdminHeader.jsx";

const COLORS = {
  forest: "#2F5B3E",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
  border: "rgba(0, 0, 0, 0.08)",
};

const AREAS = [
  { value: "Window", label: "Cửa sổ" },
  { value: "Corner", label: "Góc" },
  { value: "Indoor", label: "Trong nhà" },
  { value: "Outdoor", label: "Ngoài trời" },
];

export default function ManageTablesPage() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, filter, and sort states
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // Compute filtered and sorted list in memory
  const filteredAndSortedList = [...list]
    .filter((item) => {
      const matchSearch =
        !search.trim() ||
        item.tableType.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
      const matchArea = !selectedArea || item.area === selectedArea;
      return matchSearch && matchArea;
    })
    .sort((a, b) => {
      if (sortBy === "default") {
        const areaOrder = ["Window", "Corner", "Indoor", "Outdoor"];
        const orderA = areaOrder.indexOf(a.area);
        const orderB = areaOrder.indexOf(b.area);
        if (orderA !== orderB) return orderA - orderB;
        return a.tableType.localeCompare(b.tableType, "vi");
      }
      if (sortBy === "total-asc") {
        return a.totalTables - b.totalTables;
      }
      if (sortBy === "total-desc") {
        return b.totalTables - a.totalTables;
      }
      if (sortBy === "reservable-asc") {
        return a.reservableTables - b.reservableTables;
      }
      if (sortBy === "reservable-desc") {
        return b.reservableTables - a.reservableTables;
      }
      return 0;
    });

  // Dialog Form states
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    tableType: "",
    area: "Window",
    totalTables: "",
    reservableTables: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchAreas = async () => {
    setLoading(true);
    const res = await adminGetSeatingAreas({ token });
    if (res.ok) {
      setList(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAreas();
  }, [token]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      tableType: "",
      area: "Window",
      totalTables: "",
      reservableTables: "",
      description: "",
    });
    setFormErrors({});
    setOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      tableType: item.tableType,
      area: item.area,
      totalTables: item.totalTables,
      reservableTables: item.reservableTables,
      description: item.description || "",
    });
    setFormErrors({});
    setOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.tableType.trim()) errs.tableType = "Vui lòng nhập loại bàn (ví dụ: Cửa sổ 2 chỗ).";
    if (!formData.totalTables || Number(formData.totalTables) <= 0) {
      errs.totalTables = "Tổng số bàn phải lớn hơn 0.";
    }
    if (!formData.reservableTables || Number(formData.reservableTables) < 0) {
      errs.reservableTables = "Số bàn cho phép đặt không được âm.";
    } else if (Number(formData.reservableTables) > Number(formData.totalTables)) {
      errs.reservableTables = "Số bàn cho phép đặt không vượt quá tổng số bàn.";
    }
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    setSaving(true);
    const payload = {
      tableType: formData.tableType.trim(),
      area: formData.area,
      totalTables: Number(formData.totalTables),
      reservableTables: Number(formData.reservableTables),
      description: formData.description.trim() || null,
    };

    let res;
    if (editingId) {
      res = await adminUpdateSeatingArea({ token, id: editingId, area: payload });
    } else {
      res = await adminCreateSeatingArea({ token, area: payload });
    }

    setSaving(false);
    if (res.ok) {
      setOpen(false);
      fetchAreas();
    } else {
      alert(res.message || "Lưu thất bại.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khu vực bàn này?")) return;

    const res = await adminDeleteSeatingArea({ token, id });
    if (res.ok) {
      fetchAreas();
    } else {
      alert(res.message || "Xóa thất bại.");
    }
  };

  return (
    <Box sx={{ bgcolor: "var(--bg)", minHeight: "100vh" }}>
      {/* Dynamic Header */}
      <AdminHeader
        title="Bàn & Khu vực Setup"
        subtitle="Cấu hình các sơ đồ khu vực (Window, Corner, Indoor, Outdoor) và giới hạn bàn."
      />

      {/* Main Content */}
      <Box sx={{ py: 6, bgcolor: COLORS.soft }}>
        <Container maxWidth="lg">
          {/* Action Bar */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: "var(--matcha)" }}>
              Sơ đồ bàn & khu vực ({filteredAndSortedList.length} / {list.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={handleOpenAdd}
              sx={{
                textTransform: "none",
                borderRadius: "12px",
                padding: "8px 20px",
                background: "var(--matcha)",
                fontWeight: 600,
                "&:hover": { background: "var(--forest)" },
              }}
            >
              Thêm sơ đồ mới
            </Button>
          </Box>

          {/* Premium Filter & Search Card */}
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid var(--border)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
              mb: 4,
              background: "var(--bg-card)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                    Tìm kiếm loại bàn / đặc điểm
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Nhập tên loại bàn hoặc mô tả..."
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        background: "var(--bg-alt)",
                        "& fieldset": { border: "none" },
                      },
                      "& input": {
                        fontSize: "14px",
                        color: "var(--text)",
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                    Khu vực
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      displayEmpty
                      sx={{
                        borderRadius: "12px",
                        background: "var(--bg-alt)",
                        "& fieldset": { border: "none" },
                        fontSize: "14px",
                        color: "var(--text)",
                      }}
                    >
                      <MenuItem value="">Tất cả khu vực</MenuItem>
                      {AREAS.map((a) => (
                        <MenuItem key={a.value} value={a.value}>
                          {a.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                    Sắp xếp theo
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      sx={{
                        borderRadius: "12px",
                        background: "var(--bg-alt)",
                        "& fieldset": { border: "none" },
                        fontSize: "14px",
                        color: "var(--text)",
                      }}
                    >
                      <MenuItem value="default">Mặc định (Khu vực & Tên)</MenuItem>
                      <MenuItem value="total-asc">Tổng số bàn: Thấp đến Cao</MenuItem>
                      <MenuItem value="total-desc">Tổng số bàn: Cao đến Thấp</MenuItem>
                      <MenuItem value="reservable-asc">Cho phép đặt: Ít đến Nhiều</MenuItem>
                      <MenuItem value="reservable-desc">Cho phép đặt: Nhiều đến Ít</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
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
                    variant="text"
                    onClick={() => {
                      setSearch("");
                      setSelectedArea("");
                      setSortBy("default");
                    }}
                    sx={{
                      borderRadius: "12px",
                      height: "40px",
                      textTransform: "none",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--matcha)",
                      minWidth: "auto",
                      whiteSpace: "nowrap",
                      "&:hover": {
                        background: "rgba(120, 139, 69, 0.08)",
                      }
                    }}
                  >
                    Xóa lọc
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {loading ? (
            <Box sx={{ textAlign: "center", py: 12 }}>
              <CircularProgress sx={{ color: "var(--matcha)", mb: 2 }} />
              <Typography sx={{ color: "var(--text-muted)" }}>Đang tải danh sách khu vực bàn...</Typography>
            </Box>
          ) : list.length === 0 ? (
            <Card sx={{ borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <CardContent sx={{ textAlign: "center", py: 12 }}>
                <Typography sx={{ fontSize: "56px", mb: 2 }}>🪑</Typography>
                <Typography variant="h6">Chưa có khu vực bàn nào</Typography>
                <Typography sx={{ mt: 1, fontSize: "14px", opacity: 0.6 }}>
                  Nhấp vào nút "Thêm sơ đồ mới" để bắt đầu thiết lập bố trí chỗ ngồi.
                </Typography>
              </CardContent>
            </Card>
          ) : filteredAndSortedList.length === 0 ? (
            <Card sx={{ borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <CardContent sx={{ textAlign: "center", py: 12 }}>
                <Typography sx={{ fontSize: "56px", mb: 2 }}>🔍</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--text)" }}>Không tìm thấy khu vực bàn phù hợp</Typography>
                <Typography sx={{ mt: 1, fontSize: "14px", color: "var(--text-muted)" }}>
                  Hãy thử điều chỉnh từ khóa hoặc bộ lọc của bạn.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)"
                },
                gap: 3,
              }}
            >
              {filteredAndSortedList.map((item) => (
                <Card
                  key={item.id}
                  sx={{
                    borderRadius: 4,
                    border: "1px solid var(--border)",
                    background: "var(--bg-card)",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 30px rgba(107, 143, 62, 0.05)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "10px",
                            bgcolor: "rgba(107, 143, 62, 0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--matcha)",
                          }}
                        >
                          <Layers size={20} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--text)", fontSize: "17px" }}>
                            {item.tableType}
                          </Typography>
                          <Typography sx={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            Khu vực: {AREAS.find((a) => a.value === item.area)?.label || item.area}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton size="small" onClick={() => handleOpenEdit(item)} sx={{ color: "var(--matcha)" }}>
                            <Edit2 size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa khu vực">
                          <IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ color: "#EF4444" }}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Typography sx={{ color: "var(--text-muted)", fontSize: "14px", mb: 3, flex: 1 }}>
                      {item.description || "Không có mô tả chi tiết."}
                    </Typography>

                    <Grid container spacing={2} sx={{ pt: 2, borderTop: "1px solid var(--border)" }}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: "center", p: 1.5, borderRadius: 3, bgcolor: "var(--bg-alt)" }}>
                          <Typography sx={{ fontSize: "12px", color: "var(--text-muted)" }}>Tổng số bàn</Typography>
                          <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>
                            {item.totalTables}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: "center", p: 1.5, borderRadius: 3, bgcolor: "var(--bg-alt)" }}>
                          <Typography sx={{ fontSize: "12px", color: "var(--text-muted)" }}>Cho phép đặt bàn</Typography>
                          <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "var(--matcha)" }}>
                            {item.reservableTables}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Container>
      </Box>

      {/* Add / Edit Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            padding: 2,
            background: "var(--bg-card)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 64px rgba(47, 91, 62, 0.12)",
            border: "1px solid var(--border)",
          },
        }}
      >
        <DialogTitle sx={{
          fontWeight: 800,
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "26px",
          color: "var(--matcha)",
          borderBottom: "1px solid var(--border)",
          pb: 2,
        }}>
          {editingId ? "🪑 Chỉnh sửa khu vực bàn" : "✨ Thêm sơ đồ khu vực mới"}
        </DialogTitle>
        <DialogContent sx={{ pt: "24px !important" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2.5, mt: 1 }}>
            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8, display: "flex", alignItems: "center", gap: 0.5 }}>
                🪑 Tên loại bàn (ví dụ: Window 2-seat)
              </Typography>
              <TextField
                fullWidth
                placeholder="Nhập loại bàn..."
                value={formData.tableType}
                onChange={(e) => setFormData({ ...formData, tableType: e.target.value })}
                error={!!formErrors.tableType}
                helperText={formErrors.tableType}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    background: "var(--bg-alt)",
                    border: formErrors.tableType ? "1px solid #EF4444" : "1px solid transparent",
                    transition: "border-color 0.2s",
                    "& fieldset": { border: "none" },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8, display: "flex", alignItems: "center", gap: 0.5 }}>
                📍 Khu vực
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  sx={{
                    borderRadius: "12px",
                    background: "var(--bg-alt)",
                    "& fieldset": { border: "none" },
                  }}
                >
                  {AREAS.map((a) => (
                    <MenuItem key={a.value} value={a.value}>
                      {a.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8, display: "flex", alignItems: "center", gap: 0.5 }}>
                  📊 Tổng số bàn
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={formData.totalTables}
                  onChange={(e) => setFormData({ ...formData, totalTables: e.target.value })}
                  error={!!formErrors.totalTables}
                  helperText={formErrors.totalTables}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      background: "var(--bg-alt)",
                      border: formErrors.totalTables ? "1px solid #EF4444" : "1px solid transparent",
                      transition: "border-color 0.2s",
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8, display: "flex", alignItems: "center", gap: 0.5 }}>
                  🛡️ Cho đặt trực tuyến
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={formData.reservableTables}
                  onChange={(e) => setFormData({ ...formData, reservableTables: e.target.value })}
                  error={!!formErrors.reservableTables}
                  helperText={formErrors.reservableTables}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      background: "var(--bg-alt)",
                      border: formErrors.reservableTables ? "1px solid #EF4444" : "1px solid transparent",
                      transition: "border-color 0.2s",
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8, display: "flex", alignItems: "center", gap: 0.5 }}>
                📝 Mô tả đặc điểm chỗ ngồi
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Ví dụ: View cạnh cửa kính ngắm hồ sen thơ mộng, lãng mạn..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    background: "var(--bg-alt)",
                    "& fieldset": { border: "none" },
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid var(--border)", mt: 2, p: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: "none", borderRadius: "10px", color: "var(--text-muted)" }}>
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              background: "var(--matcha)",
              "&:hover": { background: "var(--forest)" },
            }}
          >
            {saving ? "Đang lưu..." : "Lưu lại"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
