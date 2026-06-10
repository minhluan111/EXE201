import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import Navbar from "./components/common/Navbar.jsx";
import Footer from "./components/common/Footer.jsx";
import AppShell from "./routes/AppShell.jsx";
import FloatingChatBubble from "./components/common/FloatingChatBubble.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
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

function Layout() {
  const { user } = useAuth();
  const isRestricted = user && ["manager", "staff", "admin"].includes(user.role);
  const showChatBubble = !isRestricted || (user && user.role === "manager");

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
      <AppShell>
        <ScrollToTop />
        <Layout />
      </AppShell>
    </ThemeProvider>
  );
}

