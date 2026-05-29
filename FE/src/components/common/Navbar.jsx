import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Menu,
  MenuItem,
  IconButton,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  X,
  LogOut,
  User,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  teal: "#3E6A7A",
  cream: "#E9E5D4",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Menu", path: "/menu" },
    { name: "Đặt bàn", path: "/booking" },
    { name: "Liên hệ", path: "/contact" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsOpen(false);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setIsOpen(!isOpen);
  };

  const mobileDrawer = (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={handleDrawerToggle}
      sx={{
        "& .MuiDrawer-paper": {
          backgroundColor: COLORS.soft,
          borderRight: `1px solid ${COLORS.cream}`,
        },
      }}
    >
      <Box sx={{ width: 280, pt: 2 }}>
        <List>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={RouterLink}
              to={item.path}
              selected={isActive(item.path)}
              onClick={() => setIsOpen(false)}
              sx={{
                backgroundColor: isActive(item.path)
                  ? COLORS.cream
                  : "transparent",
                color: isActive(item.path) ? COLORS.moss : COLORS.dark,
                "&.Mui-selected": {
                  backgroundColor: COLORS.cream,
                  "&:hover": { backgroundColor: COLORS.cream },
                },
              }}
            >
              <ListItemText primary={item.name} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <List>
          {user ? (
            <>
              <ListItemButton
                component={RouterLink}
                to="/profile"
                onClick={() => setIsOpen(false)}
              >
                <ListItemIcon>
                  <User size={20} style={{ color: COLORS.moss }} />
                </ListItemIcon>
                <ListItemText primary="Hồ sơ" />
              </ListItemButton>
              {user.role === "admin" && (
                <ListItemButton
                  component={RouterLink}
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                >
                  <ListItemIcon>
                    <LayoutDashboard size={20} style={{ color: COLORS.moss }} />
                  </ListItemIcon>
                  <ListItemText primary="Admin" />
                </ListItemButton>
              )}
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogOut size={20} style={{ color: COLORS.moss }} />
                </ListItemIcon>
                <ListItemText primary="Đăng xuất" />
              </ListItemButton>
            </>
          ) : (
            <>
              <ListItemButton
                component={RouterLink}
                to="/login"
                onClick={() => setIsOpen(false)}
              >
                <ListItemText primary="Đăng nhập" />
              </ListItemButton>
              <ListItemButton
                component={RouterLink}
                to="/register"
                onClick={() => setIsOpen(false)}
              >
                <ListItemText primary="Đăng ký" />
              </ListItemButton>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "white !important",
          color: COLORS.dark,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          borderBottom: `2px solid ${COLORS.cream}`,
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              color: "inherit",
              mr: "auto",
            }}
          >
            <Box
              component="img"
              src="/assets/images/logo.jpg"
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                objectFit: "cover",
              }}
            />
            <Box
              sx={{
                display: { xs: "none", sm: "block" },
                fontWeight: "bold",
                fontSize: "18px",
                color: COLORS.moss,
              }}
            >
              yakishime
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              <Box sx={{ display: "flex", gap: 4, mr: 4 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      color: isActive(item.path) ? COLORS.moss : COLORS.dark,
                      fontWeight: isActive(item.path) ? 600 : 500,
                      borderBottom: isActive(item.path)
                        ? `2px solid ${COLORS.moss}`
                        : "none",
                      pb: isActive(item.path) ? 0.5 : 0,
                      textTransform: "none",
                      fontSize: "14px",
                      "&:hover": { color: COLORS.moss },
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
              </Box>

              {/* Desktop Auth Buttons */}
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                {user ? (
                  <>
                    <Button
                      component={RouterLink}
                      to="/profile"
                      startIcon={<User size={16} />}
                      sx={{
                        textTransform: "none",
                        color: COLORS.dark,
                        "&:hover": { backgroundColor: COLORS.soft },
                      }}
                    >
                      Hồ sơ
                    </Button>
                    {user.role === "admin" && (
                      <Button
                        component={RouterLink}
                        to="/admin"
                        startIcon={<LayoutDashboard size={16} />}
                        sx={{
                          textTransform: "none",
                          color: COLORS.dark,
                          "&:hover": { backgroundColor: COLORS.soft },
                        }}
                      >
                        Admin
                      </Button>
                    )}
                    <Button
                      onClick={handleLogout}
                      startIcon={<LogOut size={16} />}
                      variant="outlined"
                      sx={{
                        textTransform: "none",
                        borderColor: COLORS.moss,
                        color: COLORS.moss,
                        "&:hover": {
                          borderColor: COLORS.forest,
                          color: COLORS.forest,
                        },
                      }}
                    >
                      Đăng xuất
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      component={RouterLink}
                      to="/login"
                      sx={{
                        textTransform: "none",
                        color: COLORS.dark,
                        "&:hover": { backgroundColor: COLORS.soft },
                      }}
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        backgroundColor: COLORS.moss,
                        color: "white",
                        "&:hover": { backgroundColor: COLORS.forest },
                      }}
                    >
                      Đăng ký
                    </Button>
                  </>
                )}
              </Box>
            </>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{ color: COLORS.dark }}
            >
              {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      {mobileDrawer}
    </>
  );
}
