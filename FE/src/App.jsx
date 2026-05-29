import AppRoutes from "./routes/AppRoutes.jsx";
import Navbar from "./components/common/Navbar.jsx";
import Footer from "./components/common/Footer.jsx";
import AppShell from "./routes/AppShell.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";

export default function App() {
  return (
    <ThemeProvider>
      <AppShell>
        <Navbar />
        <main style={{ minHeight: "calc(100vh - 68px)" }}>
          <AppRoutes />
        </main>
        <Footer />
      </AppShell>
    </ThemeProvider>
  );
}
