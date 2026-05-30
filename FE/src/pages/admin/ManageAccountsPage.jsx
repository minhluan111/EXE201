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
  FormControl,
  Select,
  MenuItem,
  Chip,
  Button,
  CircularProgress,
  Grid,
} from "@mui/material";
import { useAuth } from "../../context/useAuthContext.js";
import { adminGetUsers, adminUpdateUserRole, adminDeleteUser } from "../../services/apiClient.js";
import AdminHeader from "../../components/admin/AdminHeader.jsx";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  soft: "#F5F5F0",
  border: "rgba(0, 0, 0, 0.08)",
};

export default function ManageAccountsPage() {
  const { token, user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await adminGetUsers({ token });
    if (res.ok) {
      setList(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleRoleChange = async (id, newRole) => {
    // Prevent self-demotion
    if (id === user.id) {
      alert("Bạn không thể tự thay đổi vai trò của tài khoản Admin hiện tại!");
      return;
    }
    const res = await adminUpdateUserRole({ token, id, role: newRole });
    if (res.ok) {
      fetchUsers();
    } else {
      alert("Cập nhật vai trò thất bại: " + (res.message || "Lỗi hệ thống"));
    }
  };

  const handleDelete = async (id) => {
    if (id === user.id) {
      alert("Bạn không thể xóa chính tài khoản Admin hiện tại!");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.")) {
      const res = await adminDeleteUser({ token, id });
      if (res.ok) {
        fetchUsers();
      } else {
        alert("Xóa tài khoản thất bại: " + (res.message || "Lỗi hệ thống"));
      }
    }
  };

  const getRoleBadge = (roleStr) => {
    const r = String(roleStr || "").toLowerCase();
    if (r === "admin") {
      return <Chip label="Admin" color="primary" size="small" sx={{ fontWeight: 600, bgcolor: COLORS.forest }} />;
    }
    if (r === "manager") {
      return <Chip label="Manager" color="info" size="small" sx={{ fontWeight: 600, bgcolor: "#3f51b5" }} />;
    }
    if (r === "staff") {
      return <Chip label="Staff" color="success" size="small" sx={{ fontWeight: 600, bgcolor: COLORS.moss }} />;
    }
    return <Chip label="User" variant="outlined" size="small" sx={{ fontWeight: 600 }} />;
  };

  return (
    <Box sx={{ bgcolor: "var(--bg)", minHeight: "100vh" }}>
      {/* Dynamic Header */}
      <AdminHeader
        title="Quản lý tài khoản"
        subtitle="Quản lý thông tin người dùng và phân quyền các tài khoản Staff / Admin hệ thống."
      />

      {/* Main Content */}
      <Box sx={{ py: 6, bgcolor: COLORS.soft, minHeight: "65vh" }}>
        <Container maxWidth="lg">
          {/* Table Card */}
          <Card
            sx={{
              borderRadius: "20px",
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
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
                  Không tìm thấy tài khoản nào.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ background: "transparent" }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead sx={{ bgcolor: "rgba(47, 91, 62, 0.04)" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: COLORS.forest }}>Tên tài khoản</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: COLORS.forest }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: COLORS.forest }}>Số điện thoại</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: COLORS.forest }}>Ngày tham gia</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: COLORS.forest }}>Vai trò</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: COLORS.forest, width: 220 }}>Phân quyền vai trò</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: COLORS.forest, width: 120 }}>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {list.map((uItem) => (
                      <TableRow key={uItem.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{uItem.fullName}</TableCell>
                        <TableCell>{uItem.email}</TableCell>
                        <TableCell>{uItem.phone || "Chưa cập nhật"}</TableCell>
                        <TableCell>
                          {new Date(uItem.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>{getRoleBadge(uItem.role)}</TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={uItem.role}
                              onChange={(e) => handleRoleChange(uItem.id, e.target.value)}
                              disabled={uItem.id === user.id}
                              sx={{
                                fontSize: "13px",
                                fontWeight: 500,
                                height: "32px",
                              }}
                            >
                              <MenuItem value="User">User (Khách hàng)</MenuItem>
                              <MenuItem value="Staff">Staff (Nhân viên)</MenuItem>
                              <MenuItem value="Manager">Manager (Quản lý)</MenuItem>
                              <MenuItem value="Admin">Admin (Quản trị)</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDelete(uItem.id)}
                            disabled={uItem.id === user.id}
                            sx={{
                              textTransform: "none",
                              fontSize: "12px",
                              fontWeight: 600,
                              borderRadius: "8px",
                            }}
                          >
                            Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
