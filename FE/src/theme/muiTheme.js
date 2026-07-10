import { createTheme } from "@mui/material/styles";

const muiTheme = createTheme({
  palette: {
    primary: {
      main: "var(--matcha)",
      dark: "var(--matcha-dark)",
      light: "var(--matcha-light)",
      contrastText: "#fff",
    },
    secondary: {
      main: "var(--forest)",
      dark: "var(--forest-dark)",
      light: "var(--matcha-light)",
      contrastText: "#fff",
    },
    background: {
      default: "var(--bg)",
      paper: "var(--bg-card)",
    },
    text: {
      primary: "var(--text)",
      secondary: "var(--text-muted)",
      disabled: "var(--text-light)",
    },
    divider: "var(--border)",
    success: {
      main: "var(--matcha)",
      dark: "var(--matcha-dark)",
      light: "var(--matcha-light)",
      contrastText: "#fff",
    },
    error: {
      main: "#EF5350",
      dark: "#C62828",
      light: "#E57373",
      contrastText: "#fff",
    },
    warning: {
      main: "#FFA726",
      dark: "#F57C00",
      light: "#FFB74D",
      contrastText: "#fff",
    },
    info: {
      main: "var(--forest)",
      dark: "var(--forest-dark)",
      light: "var(--matcha-light)",
      contrastText: "#fff",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "Roboto", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      color: "var(--text)",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      color: "var(--text)",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      color: "var(--text)",
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      color: "var(--text)",
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      color: "var(--text)",
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      color: "var(--text)",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
      color: "var(--text)",
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
      color: "var(--text-muted)",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "8px",
          padding: "10px 24px",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, var(--matcha) 0%, var(--forest) 100%)`,
          "&:hover": {
            background: `linear-gradient(135deg, var(--forest) 0%, var(--matcha) 100%)`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          border: `1px solid var(--border)`,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.10)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.15)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            color: "var(--text)",
            "& fieldset": {
              borderColor: "var(--border)",
            },
            "&:hover fieldset": {
              borderColor: "var(--matcha)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "var(--matcha)",
            },
          },
          "& .MuiInputLabel-root": {
            color: "var(--text-muted)",
            "&.Mui-focused": {
              color: "var(--matcha)",
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--bg-card) !important",
          color: "var(--text) !important",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        root: {
          "& .MuiBadge-badge": {
            backgroundColor: "var(--matcha)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--bg-alt)",
          color: "var(--text)",
          borderRadius: "20px",
        },
        colorPrimary: {
          backgroundColor: "var(--matcha)",
          color: "#fff",
        },
      },
    },
  },
});

export default muiTheme;
