import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuthContext.js";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  Users,
  UtensilsCrossed,
  Layers,
  Star,
  LogOut,
} from "lucide-react";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
};

export default function AdminHeader({ title, subtitle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  const isStaff = user.role === "staff";
  const isAdmin = user.role === "admin";
  const isManager = user.role === "manager";

  // Build the dynamic menu list based on the user role
  const menuItems = [
    {
      label: "Bảng điều khiển",
      path: "/admin",
      icon: LayoutDashboard,
      roles: ["manager"],
    },
    {
      label: "Quản lý đặt bàn",
      path: "/admin/bookings",
      icon: CalendarDays,
      roles: ["manager", "staff"],
    },
    {
      label: "Quản lý tài khoản",
      path: "/admin/accounts",
      icon: Users,
      roles: ["admin"],
    },
    {
      label: "Quản lý thực đơn",
      path: "/admin/menus",
      icon: UtensilsCrossed,
      roles: ["manager"],
    },
    {
      label: "Bàn & Khu vực",
      path: "/admin/tables",
      icon: Layers,
      roles: ["manager"],
    },
    {
      label: "Quản lý đánh giá",
      path: "/admin/reviews",
      icon: Star,
      roles: ["manager"],
    },
  ].filter((item) => item.roles.includes(user.role));

  const currentPath = location.pathname;

  return (
    <div
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--glass-border)",
        padding: "32px 0 0",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Title & Logout */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1
              className="sumie-fade"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(24px, 4vw, 36px)",
                fontWeight: 700,
                color: "var(--matcha)",
                margin: 0,
                textTransform: "capitalize",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-muted)",
                  margin: "4px 0 0",
                  fontWeight: 500,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 50,
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "#EF4444",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-card)"; }}
          >
            <LogOut size={14} /> Đăng xuất
          </motion.button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          className="admin-tabs"
        >
          {menuItems.map((item) => {
            const active = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: active ? "var(--matcha)" : "var(--text-muted)",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                <item.icon size={16} />
                {item.label}
                {active && (
                  <motion.div
                    layoutId="admin-tab-indicator"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: "var(--matcha)",
                      borderRadius: "99px 99px 0 0",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
