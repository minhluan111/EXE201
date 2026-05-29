import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import muiTheme from "./theme/muiTheme";
import AppRoutes from "./routes/AppRoutes.jsx";
import Navbar from "./components/common/Navbar.jsx";
import Footer from "./components/common/Footer.jsx";
import AppShell from "./routes/AppShell.jsx";
import "./App.css";

export default function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AppShell>
        <div className="vizza-app">
          <Navbar />
          <main className="vizza-main">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </AppShell>
    </ThemeProvider>
  );
}
