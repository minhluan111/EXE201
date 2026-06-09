import { useState, useEffect } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu as MenuIcon, X, LogOut, User, LayoutDashboard,
  Sun, Moon, ChevronDown, Leaf,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useThemeMode } from "@/context/ThemeContext";

const NAV_ITEMS = [
  { name: "Trang chủ", path: "/" },
  { name: "Menu", path: "/menu" },
  { name: "Đặt bàn", path: "/booking" },
  { name: "Liên hệ", path: "/contact" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { isDark, toggle } = useThemeMode();

  // Detect scroll for background opacity
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [location]);

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const avatarInitial = user?.full_name?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          transition: "all 0.3s ease",
          background: scrolled
            ? "var(--glass-bg)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
          borderBottom: scrolled ? "1px solid var(--glass-border)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 68,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {/* Logo */}
          <RouterLink
            to="/"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              textDecoration: "none", marginRight: "auto",
            }}
          >
            <img
              src="/assets/images/logo.jpg"
              alt="Yakishime"
              style={{
                width: 40, height: 40, borderRadius: 10,
                objectFit: "cover",
                boxShadow: "0 2px 12px rgba(107,143,62,0.25)",
              }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em",
                color: "var(--matcha)",
              }}
            >
              yakishime
            </span>
          </RouterLink>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex"
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            {NAV_ITEMS.map((item) => (
              <RouterLink
                key={item.path}
                to={item.path}
                style={{
                  position: "relative",
                  padding: "8px 16px",
                  textDecoration: "none",
                  fontSize: 14, fontWeight: 500,
                  color: isActive(item.path) ? "var(--matcha)" : "var(--text)",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => { if (!isActive(item.path)) e.currentTarget.style.color = "var(--matcha)"; }}
                onMouseLeave={(e) => { if (!isActive(item.path)) e.currentTarget.style.color = "var(--text)"; }}
              >
                {item.name}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="nav-indicator"
                    style={{
                      position: "absolute", bottom: 0, left: 12, right: 12,
                      height: 2, background: "var(--matcha)", borderRadius: 99,
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </RouterLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 16 }}>
            {/* Dark Mode Toggle */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={toggle}
              style={{
                width: 38, height: 38, borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--bg-alt)",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", color: "var(--text)",
                transition: "all 0.2s ease",
              }}
              title={isDark ? "Light mode" : "Dark mode"}
            >
              <AnimatePresence mode="wait">
                {isDark ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Sun size={16} />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Moon size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Auth section */}
            {user ? (
              /* User dropdown */
              <div style={{ position: "relative" }}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen((v) => !v)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "6px 12px 6px 6px",
                    borderRadius: 50, border: "1px solid var(--border)",
                    background: "var(--bg-card)", cursor: "pointer",
                    color: "var(--text)", transition: "all 0.2s ease",
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--matcha), var(--forest))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 12, fontWeight: 700,
                  }}>
                    {avatarInitial}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.full_name?.split(" ").pop()}
                  </span>
                  <motion.div animate={{ rotate: userMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: "absolute", top: "calc(100% + 8px)", right: 0,
                        minWidth: 180,
                        background: "var(--bg-card)", borderRadius: 14,
                        border: "1px solid var(--border)",
                        boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
                        overflow: "hidden", zIndex: 200,
                      }}
                    >
                      {[
                        { icon: User, label: "Hồ sơ", path: "/profile" },
                        { icon: Leaf, label: "Lịch sử đặt bàn", path: "/booking/history" },
                        ...(user.role === "admin" ? [{ icon: LayoutDashboard, label: "Quản trị", path: "/admin/accounts" }] : []),
                        ...(user.role === "manager" ? [{ icon: LayoutDashboard, label: "Quản lý", path: "/admin" }] : []),
                        ...(user.role === "staff" ? [{ icon: LayoutDashboard, label: "Nhân viên", path: "/admin/bookings" }] : []),
                      ].map((item) => (
                        <RouterLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setUserMenuOpen(false)}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "11px 16px", textDecoration: "none",
                            color: "var(--text)", fontSize: 14,
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-alt)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                        >
                          <item.icon size={15} style={{ color: "var(--matcha)" }} />
                          {item.label}
                        </RouterLink>
                      ))}
                      <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />
                      <button
                        onClick={handleLogout}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 10,
                          padding: "11px 16px", border: "none", background: "transparent",
                          color: "#EF4444", fontSize: 14, cursor: "pointer", textAlign: "left",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <LogOut size={15} /> Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Guest buttons */
              <div style={{ display: "flex", gap: 8 }}>
                <RouterLink
                  to="/login"
                  style={{
                    padding: "8px 18px", borderRadius: 50,
                    border: "1px solid var(--border)",
                    background: "transparent", color: "var(--text)",
                    textDecoration: "none", fontSize: 14, fontWeight: 600,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-alt)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  Đăng nhập
                </RouterLink>
                <RouterLink
                  to="/register"
                  style={{
                    padding: "8px 18px", borderRadius: 50,
                    background: "linear-gradient(135deg, var(--matcha), var(--forest))",
                    color: "#fff", textDecoration: "none",
                    fontSize: 14, fontWeight: 600,
                    boxShadow: "0 4px 16px rgba(107,143,62,0.3)",
                    transition: "all 0.2s",
                  }}
                >
                  Đăng ký
                </RouterLink>
              </div>
            )}

            {/* Hamburger (mobile) */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setMobileOpen((v) => !v)}
              style={{
                display: "none", // shown via media query workaround below
                width: 38, height: 38, borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--bg-alt)",
                cursor: "pointer", alignItems: "center",
                justifyContent: "center", color: "var(--text)",
              }}
              className="mobile-ham"
            >
              {mobileOpen ? <X size={18} /> : <MenuIcon size={18} />}
            </motion.button>
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ──────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 998,
                background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
              }}
            />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                position: "fixed", top: 0, right: 0, bottom: 0,
                width: 280, zIndex: 999,
                background: "var(--bg-card)",
                borderLeft: "1px solid var(--border)",
                padding: "24px 0",
                overflowY: "auto",
              }}
            >
              <div style={{ padding: "0 24px 24px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "var(--matcha)" }}>
                  yakishime
                </span>
              </div>

              <nav style={{ padding: "16px 0" }}>
                {NAV_ITEMS.map((item, i) => (
                  <motion.div key={item.path} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <RouterLink
                      to={item.path}
                      style={{
                        display: "block", padding: "13px 24px",
                        textDecoration: "none", fontSize: 16, fontWeight: 500,
                        color: isActive(item.path) ? "var(--matcha)" : "var(--text)",
                        background: isActive(item.path) ? "var(--bg-alt)" : "transparent",
                        borderRight: isActive(item.path) ? "3px solid var(--matcha)" : "3px solid transparent",
                        transition: "all 0.2s",
                      }}
                    >
                      {item.name}
                    </RouterLink>
                  </motion.div>
                ))}
              </nav>

              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
                {user ? (
                  <>
                    <RouterLink to="/profile" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", textDecoration: "none", color: "var(--text)", fontSize: 14 }}>
                      <User size={16} style={{ color: "var(--matcha)" }} /> Hồ sơ
                    </RouterLink>
                    <RouterLink to="/booking/history" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", textDecoration: "none", color: "var(--text)", fontSize: 14 }}>
                      <Leaf size={16} style={{ color: "var(--matcha)" }} /> Lịch sử đặt bàn
                    </RouterLink>
                    {user.role === "admin" && (
                      <RouterLink to="/admin/accounts" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", textDecoration: "none", color: "var(--text)", fontSize: 14 }}>
                        <LayoutDashboard size={16} style={{ color: "var(--matcha)" }} /> Quản trị
                      </RouterLink>
                    )}
                    {user.role === "manager" && (
                      <RouterLink to="/admin" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", textDecoration: "none", color: "var(--text)", fontSize: 14 }}>
                        <LayoutDashboard size={16} style={{ color: "var(--matcha)" }} /> Quản lý
                      </RouterLink>
                    )}
                    {user.role === "staff" && (
                      <RouterLink to="/admin/bookings" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", textDecoration: "none", color: "var(--text)", fontSize: 14 }}>
                        <LayoutDashboard size={16} style={{ color: "var(--matcha)" }} /> Nhân viên
                      </RouterLink>
                    )}
                    <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", border: "none", background: "transparent", color: "#EF4444", fontSize: 14, cursor: "pointer" }}>
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <RouterLink to="/login" style={{ padding: "10px 20px", borderRadius: 50, border: "1px solid var(--border)", textAlign: "center", textDecoration: "none", color: "var(--text)", fontSize: 14, fontWeight: 600 }}>
                      Đăng nhập
                    </RouterLink>
                    <RouterLink to="/register" style={{ padding: "10px 20px", borderRadius: 50, background: "linear-gradient(135deg, var(--matcha), var(--forest))", color: "#fff", textAlign: "center", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                      Đăng ký
                    </RouterLink>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .mobile-ham { display: flex !important; }
          nav { display: none !important; }
        }
      `}</style>
    </>
  );
}
