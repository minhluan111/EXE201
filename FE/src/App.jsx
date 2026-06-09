import AppRoutes from "./routes/AppRoutes.jsx";
import Navbar from "./components/common/Navbar.jsx";
import Footer from "./components/common/Footer.jsx";
import AppShell from "./routes/AppShell.jsx";
import FloatingChatBubble from "./components/common/FloatingChatBubble.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import "./index.css";

function Layout() {
  const { user } = useAuth();
  const isRestricted = user && ["manager", "staff", "admin"].includes(user.role);

  return (
    <>
      {!isRestricted && <Navbar />}
      <main style={{ minHeight: "calc(100vh - 68px)" }}>
        <AppRoutes />
      </main>
      {!isRestricted && <Footer />}
      {!isRestricted && <FloatingChatBubble />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell>
        <Layout />
      </AppShell>
    </ThemeProvider>
  );
}

