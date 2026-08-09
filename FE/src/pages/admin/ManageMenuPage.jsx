import { useEffect, useState, useMemo } from "react";
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
  Checkbox,
  ListItemText,
  OutlinedInput,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Plus, Edit2, Trash2, Tag, Coffee, RefreshCw, ChevronDown, Minus } from "lucide-react";
import { useAuth } from "../../context/useAuthContext.js";
import {
  adminGetMenu,
  adminCreateMenuItem,
  adminUpdateMenuItem,
  adminDeleteMenuItem,
} from "../../services/apiClient.js";
import AdminHeader from "../../components/admin/AdminHeader.jsx";
import { useTenant } from "@/context/TenantContext";

const COLORS = {
  moss: "var(--matcha)",
  forest: "var(--forest)",
  soft: "var(--bg)",
  dark: "var(--text)",
};

const MATCHA_CATEGORIES = [
  { value: "Combo",      label: "Combo ưu đãi" },
  { value: "Traditional",label: "Truyền thống" },
  { value: "Latte",      label: "Latte" },
  { value: "Hojicha",    label: "Hojicha" },
  { value: "Desserts",   label: "Tráng miệng" },
  { value: "Food",       label: "Món ăn" },
];

const COM_TAM_CATEGORIES = [
  { value: "Combo",      label: "Combo ưu đãi" },
  { value: "MainCourse", label: "Món chính" },
  { value: "Drink",      label: "Đồ uống" },
  { value: "Dessert",    label: "Tráng miệng" },
  { value: "Snack",      label: "Ăn nhẹ" },
];

const SAM_HOUSE_CATEGORIES = [
  { value: "Combo",      label: "Combo ưu đãi" },
  { value: "Coffee",     label: "Cà phê" },
  { value: "MilkTea",    label: "Trà sữa" },
  { value: "FruitTea",   label: "Trà trái cây" },
  { value: "Other",      label: "Khác" },
];

const HOA_TEA_ROOM_CATEGORIES = [
  { value: "Combo",         label: "Combo ưu đãi" },
  { value: "MatchaSpecial", label: "Matcha Đặc Sản" },
  { value: "MatchaClassic", label: "Matcha Truyền Thống" },
  { value: "MilkTea",       label: "Trà Sữa & Set Quà" },
  { value: "Experiences",   label: "Trải nghiệm" },
];

const MONARI_CATEGORIES = [
  { value: "Combo",   label: "Bánh Trung Thu & Quà Tặng" },
  { value: "Drink",   label: "Trà & Thức Uống" },
  { value: "Dessert", label: "Bánh Ngọt" },
];

const COM_GA_CATEGORIES = [
  { value: "Combo",      label: "Combo ưu đãi" },
  { value: "MainCourse", label: "Món chính" },
  { value: "Snack",      label: "Ăn kèm" },
  { value: "Drink",      label: "Đồ uống" },
];

const TAGS = [
  { value: "BestSeller", label: "Bán chạy (Best Seller)" },
  { value: "Trending", label: "Món xu hướng (Trending)" },
  { value: "New", label: "Món mới (New)" },
  { value: "Normal", label: "Bình thường" },
];

const formatPriceInput = (val) => {
  if (val === "" || val === null || val === undefined) return "";
  const numStr = String(val).replace(/\D/g, "");
  if (!numStr) return "";
  return parseInt(numStr, 10).toLocaleString("vi-VN");
};

const uploadImageToImgBB = async (file) => {
  const formDataImg = new FormData();
  formDataImg.append("image", file);
  const uploadRes = await fetch(
    "https://api.imgbb.com/1/upload?key=0407d749b1703d2a6b06b9d2988625e3",
    { method: "POST", body: formDataImg }
  );
  const uploadData = await uploadRes.json();
  if (uploadData.success) {
    return uploadData.data.url;
  }
  throw new Error(uploadData.error?.message || "Upload ảnh lên ImgBB thất bại.");
};

export default function ManageMenuPage() {
  const { token } = useAuth();
  const { tenant } = useTenant();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const isMonari = tenant?.name?.toLowerCase().includes("monari") || tenant?.tenantName?.toLowerCase().includes("monari");
  const isComGa = tenant?.name?.toLowerCase().includes("cơm gà") || tenant?.name?.toLowerCase().includes("ông bách") || tenant?.tenantName?.toLowerCase().includes("comga");
  const isComTam = tenant?.name?.toLowerCase().includes("cơm tấm") || tenant?.tenantName?.toLowerCase().includes("cơm tấm");
  const isSamHouse = tenant?.name?.toLowerCase().includes("sam house") || tenant?.tenantName?.toLowerCase().includes("samhouse");
  const isMonQuanChat = tenant?.name?.toLowerCase().includes("quảng") || tenant?.tenantName?.toLowerCase().includes("monquanchat") || tenant?.tenantName?.toLowerCase().includes("monquangchat");
  const isHoaTeaRoom = tenant?.name?.toLowerCase().includes("hoa") || tenant?.name?.toLowerCase().includes("hoà") || tenant?.name?.toLowerCase().includes("hòa") || tenant?.tenantName?.toLowerCase().includes("hoa");
  
  const tenantCategories = isMonari ? MONARI_CATEGORIES : (isComGa ? COM_GA_CATEGORIES : ((isComTam || isMonQuanChat) ? COM_TAM_CATEGORIES : (isSamHouse ? SAM_HOUSE_CATEGORIES : (isHoaTeaRoom ? HOA_TEA_ROOM_CATEGORIES : MATCHA_CATEGORIES))));

  const availableCategoryValues = useMemo(() => {
    const vals = new Set(list.map(item => item.category));
    if (vals.has("Dessert")) vals.add("Desserts");
    if (vals.has("Desserts")) vals.add("Dessert");
    return Array.from(vals);
  }, [list]);

  const filterCategories = useMemo(() => {
    if (availableCategoryValues.length === 0) return tenantCategories;
    const filtered = tenantCategories.filter(cat => cat.value === "Combo" || availableCategoryValues.includes(cat.value));
    const uniqueLabels = new Set();
    return filtered.filter(cat => {
      if (uniqueLabels.has(cat.label)) return false;
      uniqueLabels.add(cat.label);
      return true;
    });
  }, [tenantCategories, availableCategoryValues]);

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
    imageBase64: "",
    imageFile: null,
    price: "",
    description: "",
    tag: "Normal",
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Combo Modal states
  const [openCombo, setOpenCombo] = useState(false);
  const [comboData, setComboData] = useState({
    name: "",
    selectedItems: {},
    price: "",
    category: "Combo",
    imageUrl: "",
    imageBase64: "",
    imageFile: null,
  });
  const [comboErrors, setComboErrors] = useState({});

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
      imageBase64: "",
      imageFile: null,
      price: "",
      description: "",
      tag: "Normal",
    });
    setFormErrors({});
    setOpen(true);
  };

  const handleOpenCombo = () => {
    setComboData({
      name: "",
      selectedItems: {},
      price: "",
      category: "Combo",
      imageUrl: "",
      imageBase64: "",
      imageFile: null,
    });
    setComboErrors({});
    setOpenCombo(true);
  };

  const validateCombo = () => {
    const errs = {};
    if (!comboData.name.trim()) errs.name = "Vui lòng nhập tên Combo.";
    const totalItems = Object.values(comboData.selectedItems).reduce((a, b) => a + b, 0);
    if (totalItems < 2) errs.selectedItems = "Combo phải bao gồm ít nhất 2 món.";
    if (!comboData.price || Number(comboData.price) <= 0) {
      errs.price = "Giá ưu đãi phải là số lớn hơn 0.";
    }
    return errs;
  };

  const handleSaveCombo = async () => {
    const errs = validateCombo();
    if (Object.keys(errs).length) {
      setComboErrors(errs);
      return;
    }

    setSaving(true);
    let finalImageUrl = (comboData.imageUrl || "").trim();

    if (comboData.imageFile) {
      try {
        finalImageUrl = await uploadImageToImgBB(comboData.imageFile);
      } catch (err) {
        alert(err.message || "Lỗi kết nối khi tải ảnh lên.");
        setSaving(false);
        return;
      }
    } else if (comboData.imageBase64 && !finalImageUrl) {
      finalImageUrl = comboData.imageBase64;
    }

    const selectedIds = Object.keys(comboData.selectedItems);
    let originalPrice = 0;
    const itemNames = [];
    selectedIds.forEach(id => {
      const item = list.find(i => i.id === id);
      if (item) {
        const qty = comboData.selectedItems[id];
        originalPrice += item.price * qty;
        itemNames.push(qty > 1 ? `${qty} ${item.name}` : item.name);
      }
    });
    const savings = originalPrice - Number(comboData.price);

    let description = "";
    if (savings > 0) {
      description = `Tiết kiệm ${savings.toLocaleString("vi-VN")}đ! Bao gồm: ${itemNames.join(", ")}.`;
    } else {
      description = `Bao gồm: ${itemNames.join(", ")}.`;
    }

    const comboName = comboData.name.trim().toLowerCase().includes("combo")
      ? comboData.name.trim()
      : `Combo ${comboData.name.trim()}`;

    const payload = {
      name: comboName,
      category: comboData.category,
      imageUrl: finalImageUrl || null,
      price: Number(comboData.price),
      description: description,
      tag: "Normal",
      ingredients: itemNames,
    };

    const res = await adminCreateMenuItem({ token, item: payload });
    setSaving(false);

    if (res.ok) {
      setOpenCombo(false);
      fetchMenu();
    } else {
      alert(res.message || "Tạo Combo thất bại.");
    }
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      imageUrl: item.imageUrl || "",
      imageBase64: "",
      imageFile: null,
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
    let finalImageUrl = (formData.imageUrl || "").trim();

    if (formData.imageFile) {
      try {
        finalImageUrl = await uploadImageToImgBB(formData.imageFile);
      } catch (err) {
        alert(err.message || "Lỗi kết nối khi tải ảnh lên.");
        setSaving(false);
        return;
      }
    } else if (formData.imageBase64 && !finalImageUrl) {
      finalImageUrl = formData.imageBase64;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      imageUrl: finalImageUrl || null,
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

  const handleFileChange = (e, isCombo = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh hợp lệ.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước ảnh quá lớn, vui lòng chọn ảnh dưới 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (isCombo) {
        setComboData({ ...comboData, imageBase64: reader.result, imageUrl: "", imageFile: file });
      } else {
        setFormData({ ...formData, imageBase64: reader.result, imageUrl: "", imageFile: file });
      }
    };
    reader.onerror = (error) => {
      console.error("Error reading file: ", error);
      alert("Có lỗi xảy ra khi đọc file ảnh.");
    };
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
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Plus size={18} />}
                onClick={handleOpenCombo}
                sx={{
                  textTransform: "none",
                  borderRadius: "12px",
                  padding: "8px 20px",
                  borderColor: "var(--matcha)",
                  color: "var(--matcha)",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "var(--forest)",
                    color: "var(--forest)",
                    background: "rgba(107, 143, 62, 0.05)"
                  },
                }}
              >
                Thêm Combo mới
              </Button>
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
              <Grid container spacing={2} sx={{ alignItems: "center" }}>
                <Grid xs={12} sm={6} md={3.5}>
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

                <Grid xs={12} sm={6} md={2.5}>
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
                      {filterCategories.map((cat) => (
                        <MenuItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6} md={2.5}>
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

                <Grid xs={12} sm={6} md={2.5}>
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

                <Grid xs={12} sm={12} md={1}>
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
                        Mục: {tenantCategories.find((c) => c.value === item.category)?.label || item.category}
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
              <Grid xs={6}>
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
                    {tenantCategories.filter(c => c.value !== "Combo").map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={6}>
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
                type="text"
                value={formatPriceInput(formData.price)}
                onChange={(e) => setFormData({ ...formData, price: e.target.value.replace(/\D/g, "") })}
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
                Ảnh món ăn
              </Typography>
              <Button
                component="label"
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: "12px",
                  borderColor: "transparent",
                  color: "var(--text)",
                  textTransform: "none",
                  justifyContent: "flex-start",
                  padding: "8.5px 14px",
                  background: "var(--bg-alt)",
                  "&:hover": { borderColor: "var(--matcha)", background: "rgba(107, 143, 62, 0.05)" }
                }}
              >
                {formData.imageBase64 || formData.imageUrl ? "Đã có ảnh (Nhấn để đổi)" : "📁 Chọn file ảnh..."}
                <input type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, false)} />
              </Button>
            </Box>

            {/* Live Image Preview */}
            {(formData.imageBase64 || (formData.imageUrl && formData.imageUrl.trim())) && (
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
                    src={formData.imageBase64 || formData.imageUrl.trim()}
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

      {/* Combo Dialog */}
      <Dialog
        open={openCombo}
        onClose={() => setOpenCombo(false)}
        maxWidth="md"
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
          🎁 Thêm Combo ưu đãi
        </DialogTitle>
        <DialogContent sx={{ pt: "24px !important" }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4 }}>
            {/* Left Side: Form */}
            <Box sx={{ width: { xs: '100%', sm: '40%' }, flexShrink: 0 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2.5, mt: 1 }}>
                <Box>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                    Tên Combo
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Tên gọi của Combo"
                    value={comboData.name}
                    onChange={(e) => setComboData({ ...comboData, name: e.target.value })}
                    error={!!comboErrors.name}
                    helperText={comboErrors.name}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        background: "var(--bg-alt)",
                        border: comboErrors.name ? "1px solid #EF4444" : "1px solid transparent",
                        transition: "border-color 0.2s",
                        "& fieldset": { border: "none" },
                      },
                    }}
                  />
                </Box>



                <Box>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                    Giá ưu đãi (VNĐ)
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Nhập giá bán Combo"
                    type="text"
                    value={formatPriceInput(comboData.price)}
                    onChange={(e) => setComboData({ ...comboData, price: e.target.value.replace(/\D/g, "") })}
                    error={!!comboErrors.price}
                    helperText={comboErrors.price}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        background: "var(--bg-alt)",
                        border: comboErrors.price ? "1px solid #EF4444" : "1px solid transparent",
                        transition: "border-color 0.2s",
                        "& fieldset": { border: "none" },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", mb: 0.8 }}>
                    Ảnh Combo
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderRadius: "12px",
                      borderColor: "transparent",
                      color: "var(--text)",
                      textTransform: "none",
                      justifyContent: "flex-start",
                      padding: "8.5px 14px",
                      background: "var(--bg-alt)",
                      "&:hover": { borderColor: "var(--matcha)", background: "rgba(107, 143, 62, 0.05)" }
                    }}
                  >
                    {comboData.imageBase64 || comboData.imageUrl ? "Đã có ảnh (Nhấn để đổi)" : "📁 Chọn file ảnh"}
                    <input type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, true)} />
                  </Button>
                </Box>

                {/* Live Image Preview */}
                {(comboData.imageBase64 || (comboData.imageUrl && comboData.imageUrl.trim())) && (
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
                      🖼️ Xem trước ảnh Combo
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
                        src={comboData.imageBase64 || comboData.imageUrl.trim()}
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

                <Box sx={{ mt: 1, p: 2, borderRadius: "12px", background: "rgba(107, 143, 62, 0.05)", border: "1px solid rgba(107, 143, 62, 0.15)" }}>
                  <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "var(--matcha)", mb: 1 }}>
                    Tóm tắt Combo
                  </Typography>
                  <Typography sx={{ fontSize: "13px", color: "var(--text)", mb: 0.5 }}>
                    Đã chọn: <strong>{Object.values(comboData.selectedItems).reduce((a, b) => a + b, 0)} món</strong>
                  </Typography>
                  <Typography sx={{ fontSize: "13px", color: "var(--text)" }}>
                    Tổng giá gốc: <strong style={{ color: "var(--text-muted)" }}>
                      {(() => {
                        let total = 0;
                        Object.keys(comboData.selectedItems).forEach(id => {
                          const item = list.find(i => i.id === id);
                          if (item) total += item.price * comboData.selectedItems[id];
                        });
                        return total.toLocaleString("vi-VN");
                      })()}đ
                    </strong>
                  </Typography>
                  {comboErrors.selectedItems && (
                    <Typography sx={{ color: "#EF4444", fontSize: "12px", mt: 1 }}>
                      {comboErrors.selectedItems}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Right Side: Menu List */}
            <Box sx={{ width: { xs: '100%', sm: '60%' }, flexGrow: 1 }}>
              <Box sx={{
                height: "100%",
                maxHeight: "360px",
                overflowY: "auto",
                pr: 1,
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": { background: "rgba(107, 143, 62, 0.3)", borderRadius: "10px" },
                "&::-webkit-scrollbar-track": { background: "transparent" }
              }}>
                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", mb: 2 }}>
                  Chọn món vào Combo
                </Typography>

                {(() => {
                  const groupedItems = list
                    .filter(item => !item.name.toLowerCase().includes("combo") && item.category !== "Combo")
                    .reduce((acc, item) => {
                      const cat = tenantCategories.find(c => c.value === item.category);
                      const key = cat ? cat.value : "Other";
                      const label = cat ? cat.label : "Khác";

                      if (!acc[key]) {
                        acc[key] = { label, items: [] };
                      }
                      acc[key].items.push(item);
                      return acc;
                    }, {});

                  return Object.keys(groupedItems).map((key) => {
                    const group = groupedItems[key];
                    return (
                      <Accordion
                        key={key}
                        disableGutters
                        sx={{
                          mb: 1.5,
                          borderRadius: "12px",
                          "&:before": { display: "none" },
                          boxShadow: "none",
                          border: "1px solid var(--border)",
                          background: "transparent",
                          overflow: "hidden"
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ChevronDown size={18} color="var(--text)" />}
                          sx={{
                            minHeight: "48px",
                            "&.Mui-expanded": { minHeight: "48px" },
                            background: "var(--bg-alt)",
                            borderBottom: "1px solid var(--border)"
                          }}
                        >
                          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
                            {group.label} ({group.items.length})
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 1.5 }}>
                          <Grid container spacing={1.5}>
                            {group.items.map((item) => (
                              <Grid xs={12} sm={6} key={item.id}>
                                <Box
                                  onClick={() => {
                                    const newSelected = { ...comboData.selectedItems };
                                    if (newSelected[item.id]) {
                                      delete newSelected[item.id];
                                    } else {
                                      newSelected[item.id] = 1;
                                    }
                                    setComboData({ ...comboData, selectedItems: newSelected });
                                  }}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    p: 1.5,
                                    borderRadius: "12px",
                                    border: "1px solid",
                                    borderColor: comboData.selectedItems[item.id] ? "var(--matcha)" : "var(--border)",
                                    background: comboData.selectedItems[item.id] ? "rgba(107, 143, 62, 0.05)" : "var(--bg-alt)",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    "&:hover": { borderColor: "var(--matcha)" },
                                    height: "100%"
                                  }}
                                >
                                  <Checkbox
                                    checked={!!comboData.selectedItems[item.id]}
                                    size="small"
                                    sx={{ p: 0, mr: 1.5, color: "var(--matcha)", "&.Mui-checked": { color: "var(--matcha)" } }}
                                  />
                                  <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                      {item.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                      {item.price.toLocaleString("vi-VN")}đ
                                    </Typography>
                                  </Box>
                                  {!!comboData.selectedItems[item.id] && (
                                    <Box
                                      onClick={(e) => e.stopPropagation()}
                                      sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 1, bgcolor: "var(--bg)", borderRadius: "8px", border: "1px solid var(--border)", p: 0.5 }}
                                    >
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          const qty = comboData.selectedItems[item.id];
                                          const newSelected = { ...comboData.selectedItems };
                                          if (qty > 1) {
                                            newSelected[item.id] = qty - 1;
                                          } else {
                                            delete newSelected[item.id];
                                          }
                                          setComboData({ ...comboData, selectedItems: newSelected });
                                        }}
                                        sx={{ p: 0.2, color: "var(--text-muted)", "&:hover": { color: "var(--matcha)" } }}
                                      >
                                        <Minus size={14} />
                                      </IconButton>
                                      <Typography sx={{ fontSize: "13px", fontWeight: 600, minWidth: "16px", textAlign: "center", color: "var(--text)" }}>
                                        {comboData.selectedItems[item.id]}
                                      </Typography>
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          setComboData({
                                            ...comboData,
                                            selectedItems: { ...comboData.selectedItems, [item.id]: comboData.selectedItems[item.id] + 1 }
                                          });
                                        }}
                                        sx={{ p: 0.2, color: "var(--text-muted)", "&:hover": { color: "var(--matcha)" } }}
                                      >
                                        <Plus size={14} />
                                      </IconButton>
                                    </Box>
                                  )}
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    );
                  });
                })()}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid var(--border)", mt: 2, p: 2 }}>
          <Button onClick={() => setOpenCombo(false)} sx={{ textTransform: "none", borderRadius: "10px", color: "var(--text-muted)" }}>
            Hủy
          </Button>
          <Button
            onClick={handleSaveCombo}
            variant="contained"
            disabled={saving}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              background: "var(--matcha)",
              "&:hover": { background: "var(--forest)" },
            }}
          >
            {saving ? "Đang tạo..." : "Tạo Combo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
