import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Plus, Edit2, Trash2, Tag, Coffee, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/useAuthContext.js";
import {
  adminGetMenu,
  adminCreateMenuItem,
  adminUpdateMenuItem,
  adminDeleteMenuItem,
} from "../../services/apiClient.js";
import AdminHeader from "../../components/admin/AdminHeader.jsx";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
};

const CATEGORIES = [
  { value: "Drink", label: "Đồ uống / Trà đạo" },
  { value: "MainCourse", label: "Món chính" },
  { value: "Dessert", label: "Tráng miệng / Wagashi" },
  { value: "Snack", label: "Ăn nhẹ" },
];

const TAGS = [
  { value: "Normal", label: "Bình thường" },
  { value: "BestSeller", label: "Bán chạy (Best Seller)" },
  { value: "Trending", label: "Món xu hướng" },
  { value: "New", label: "Món mới (New)" },
];

export default function ManageMenuPage() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, filter, and sort states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // Compute filtered and sorted list in memory
  const filteredAndSortedList = [...list]
    .filter((item) => {
      const matchSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = !selectedCategory || item.category === selectedCategory;
      const matchTag = !selectedTag || item.tag === selectedTag;
      return matchSearch && matchCategory && matchTag;
    })
    .sort((a, b) => {
      if (sortBy === "default") {
        const categoryOrder = ["Drink", "MainCourse", "Dessert", "Snack"];
        const orderA = categoryOrder.indexOf(a.category);
        const orderB = categoryOrder.indexOf(b.category);
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name, "vi");
      }
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name, "vi");
      }
      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name, "vi");
      }
      if (sortBy === "price-asc") {
        return a.price - b.price;
      }
      if (sortBy === "price-desc") {
        return b.price - a.price;
      }
      return 0;
    });

  // Modal form states
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Drink",
    imageUrl: "",
    price: "",
    description: "",
    tag: "Normal",
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchMenu = async () => {
    setLoading(true);
    const res = await adminGetMenu({ token });
    if (res.ok) {
      setList(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMenu();
  }, [token]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      category: "Drink",
      imageUrl: "",
      price: "",
      description: "",
      tag: "Normal",
    });
    setFormErrors({});
    setOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      imageUrl: item.imageUrl || "",
      price: item.price,
      description: item.description || "",
      tag: item.tag,
    });
    setFormErrors({});
    setOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Vui lòng nhập tên món ăn/thức uống.";
    if (!formData.price || Number(formData.price) <= 0) {
      errs.price = "Giá tiền phải là số lớn hơn 0.";
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
      name: formData.name.trim(),
      category: formData.category,
      imageUrl: formData.imageUrl.trim() || null,
      price: Number(formData.price),
      description: formData.description.trim() || null,
      tag: formData.tag,
    };

    let res;
    if (editingId) {
      res = await adminUpdateMenuItem({ token, id: editingId, item: payload });
    } else {
      res = await adminCreateMenuItem({ token, item: payload });
    }

    setSaving(false);
    if (res.ok) {
      setOpen(false);
      fetchMenu();
    } else {
      alert(res.message || "Thao tác thất bại.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa món này khỏi thực đơn?")) return;

    const res = await adminDeleteMenuItem({ token, id });
    if (res.ok) {
      fetchMenu();
    } else {
      alert(res.message || "Xóa thất bại.");
    }
  };

  return (
    <Box sx={{ bgcolor: "var(--bg)", minHeight: "100vh" }}>
      {/* Dynamic Header */}
      <AdminHeader
        title="Quản lý thực đơn"
        subtitle="Thiết lập danh mục sản phẩm, cập nhật giá cả, mô tả món trà đạo và bánh wagashi."
      />

      {/* Main Content */}
      <Box sx={{ py: 6, bgcolor: COLORS.soft }}>
        <Container maxWidth="lg">
          {/* Action Bar */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: "var(--matcha)" }}>
              Danh sách thực đơn ({filteredAndSortedList.length} / {list.length})
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
              Thêm món mới
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
                <Grid item xs={12} sm={6} md={3.5}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                    Tìm kiếm món ăn
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Nhập tên món hoặc mô tả..."
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

                <Grid item xs={12} sm={6} md={2.5}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                    Danh mục
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      displayEmpty
                      sx={{
                        borderRadius: "12px",
                        background: "var(--bg-alt)",
                        "& fieldset": { border: "none" },
                        fontSize: "14px",
                        color: "var(--text)",
                      }}
                    >
                      <MenuItem value="">Tất cả danh mục</MenuItem>
                      {CATEGORIES.map((cat) => (
                        <MenuItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2.5}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                    Nhãn đặc trưng
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      displayEmpty
                      sx={{
                        borderRadius: "12px",
                        background: "var(--bg-alt)",
                        "& fieldset": { border: "none" },
                        fontSize: "14px",
                        color: "var(--text)",
                      }}
                    >
                      <MenuItem value="">Tất cả nhãn</MenuItem>
                      {TAGS.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                          {t.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2.5}>
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
                      <MenuItem value="default">Mặc định (Nhóm & Tên)</MenuItem>
                      <MenuItem value="name-asc">Tên: A đến Z</MenuItem>
                      <MenuItem value="name-desc">Tên: Z đến A</MenuItem>
                      <MenuItem value="price-asc">Giá: Thấp đến Cao</MenuItem>
                      <MenuItem value="price-desc">Giá: Cao đến Thấp</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={12} md={1}>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      mb: 0.8,
                      visibility: "hidden",
                      display: { xs: "none", md: "block" }
                    }}
                  >
                    &nbsp;
                  </Typography>
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => {
                      setSearch("");
                      setSelectedCategory("");
                      setSelectedTag("");
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
              <Typography sx={{ color: "var(--text-muted)" }}>Đang tải danh sách món ăn...</Typography>
            </Box>
          ) : list.length === 0 ? (
            <Card sx={{ borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <CardContent sx={{ textAlign: "center", py: 12 }}>
                <Typography sx={{ fontSize: "56px", mb: 2 }}>🍵</Typography>
                <Typography variant="h6">Thực đơn trống</Typography>
                <Typography sx={{ mt: 1, fontSize: "14px", opacity: 0.6 }}>
                  Nhấp vào nút "Thêm món mới" để bắt đầu thiết lập thực đơn của quán.
                </Typography>
              </CardContent>
            </Card>
          ) : filteredAndSortedList.length === 0 ? (
            <Card sx={{ borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <CardContent sx={{ textAlign: "center", py: 12 }}>
                <Typography sx={{ fontSize: "56px", mb: 2 }}>🔍</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--text)" }}>Không tìm thấy món ăn phù hợp</Typography>
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
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)"
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
                  {/* Image */}
                  <Box sx={{ height: 180, width: "100%", bgcolor: "rgba(0,0,0,0.02)", overflow: "hidden", position: "relative" }}>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                        <Coffee size={40} />
                      </Box>
                    )}
                    {/* Tag label */}
                    {item.tag && item.tag !== "Normal" && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "50px",
                          background: "rgba(107, 143, 62, 0.9)",
                          color: "#fff",
                          fontSize: "12px",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Tag size={12} />
                        {TAGS.find((t) => t.value === item.tag)?.label || item.tag}
                      </Box>
                    )}
                  </Box>

                  {/* Card Content */}
                  <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--text)", fontSize: "17px" }}>
                        {item.name}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "var(--matcha)", fontSize: "16px" }}>
                        {item.price.toLocaleString("vi-VN")}đ
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "var(--text-muted)",
                        mb: 2,
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {item.description || "Không có mô tả."}
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1, borderTop: "1px solid var(--border)" }}>
                      <Typography sx={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        Mục: {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton size="small" onClick={() => handleOpenEdit(item)} sx={{ color: "var(--matcha)" }}>
                            <Edit2 size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa món">
                          <IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ color: "#EF4444" }}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
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
          {editingId ? "✨ Chỉnh sửa món ăn" : "🍵 Thêm món mới vào thực đơn"}
        </DialogTitle>
        <DialogContent sx={{ pt: "24px !important" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2.5, mt: 1 }}>
            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                Tên món ăn / thức uống
              </Typography>
              <TextField
                fullWidth
                placeholder="Ví dụ: Usucha Ceremonial Matcha"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
                helperText={formErrors.name}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    background: "var(--bg-alt)",
                    border: formErrors.name ? "1px solid #EF4444" : "1px solid transparent",
                    transition: "border-color 0.2s",
                    "& fieldset": { border: "none" },
                  },
                }}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                  Danh mục
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    sx={{
                      borderRadius: "12px",
                      background: "var(--bg-alt)",
                      "& fieldset": { border: "none" },
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                  Nhãn hiển thị
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    sx={{
                      borderRadius: "12px",
                      background: "var(--bg-alt)",
                      "& fieldset": { border: "none" },
                    }}
                  >
                    {TAGS.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                Giá tiền (VNĐ)
              </Typography>
              <TextField
                fullWidth
                placeholder="Nhập giá bán..."
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                error={!!formErrors.price}
                helperText={formErrors.price}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    background: "var(--bg-alt)",
                    border: formErrors.price ? "1px solid #EF4444" : "1px solid transparent",
                    transition: "border-color 0.2s",
                    "& fieldset": { border: "none" },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                Đường dẫn ảnh món ăn (Link URL)
              </Typography>
              <TextField
                fullWidth
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
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

            {/* Live Image Preview */}
            {formData.imageUrl && formData.imageUrl.trim() && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 2,
                  borderRadius: "16px",
                  bgcolor: "var(--bg-alt)",
                  border: "1px dashed var(--border)",
                  textAlign: "center",
                }}
              >
                <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", mb: 1.2 }}>
                  🖼️ Xem trước ảnh món ăn
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    maxHeight: 180,
                    borderRadius: "12px",
                    overflow: "hidden",
                    bgcolor: "rgba(0,0,0,0.02)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={formData.imageUrl.trim()}
                    alt="Xem trước ảnh"
                    style={{ maxWidth: "100%", maxHeight: 180, objectFit: "contain", borderRadius: "12px" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                      const msgDiv = document.createElement("div");
                      msgDiv.style.color = "#EF4444";
                      msgDiv.style.fontSize = "13px";
                      msgDiv.style.fontWeight = "500";
                      msgDiv.style.padding = "16px";
                      msgDiv.innerText = "⚠️ Không tải được ảnh. Vui lòng kiểm tra lại liên kết.";
                      e.target.parentElement.appendChild(msgDiv);
                    }}
                  />
                </Box>
              </Box>
            )}

            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                Mô tả món ăn
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Mô tả ngắn gọn về hương vị, nguyên liệu..."
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
