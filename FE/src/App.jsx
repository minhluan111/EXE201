import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import Navbar from "./components/common/Navbar.jsx";
import Footer from "./components/common/Footer.jsx";
import AppShell from "./routes/AppShell.jsx";
import FloatingChatBubble from "./components/common/FloatingChatBubble.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import muiTheme from "./theme/muiTheme.js";
import { useAuth } from "./context/AuthContext.jsx";
import "./index.css";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

import { useTenant } from "./context/TenantContext.jsx";

function Layout() {
  const { user } = useAuth();
  const { loading } = useTenant();
  const isRestricted = user && ["manager", "staff", "admin"].includes(user.role);
  const showChatBubble = !isRestricted || (user && user.role === "manager");

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#0A0A0A",
        color: "#ffffff",
      }}>
        {/* Sleek, premium looking spinner */}
        <div style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.06)",
          borderTopColor: "rgba(255,255,255,0.85)",
          animation: "spin 1s linear infinite"
        }} />
        <span style={{
          marginTop: 18,
          fontSize: 12,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          opacity: 0.5,
          fontFamily: "Inter, sans-serif"
        }}>
          Đang tải dữ liệu...
        </span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {!isRestricted && <Navbar />}
      <main style={{ minHeight: "calc(100vh - 68px)" }}>
        <AppRoutes />
      </main>
      {!isRestricted && <Footer />}
      {showChatBubble && <FloatingChatBubble />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MuiThemeProvider theme={muiTheme}>
        <AppShell>
          <ScrollToTop />
          <Layout />
        </AppShell>
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

