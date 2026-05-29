import { createTheme } from "@mui/material/styles";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  teal: "#3E6A7A",
  cream: "#E9E5D4",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
};

const muiTheme = createTheme({
  palette: {
    primary: {
      main: COLORS.moss,
      dark: COLORS.forest,
      light: "#A8B973",
      contrastText: "#fff",
    },
    secondary: {
      main: COLORS.teal,
      dark: "#2D4F5E",
      light: "#6A8A9A",
      contrastText: "#fff",
    },
    background: {
      default: COLORS.soft,
      paper: "#FFFFFF",
    },
    text: {
      primary: COLORS.dark,
      secondary: "#666666",
    },
    success: {
      main: COLORS.moss,
    },
    error: {
      main: "#EF5350",
    },
    warning: {
      main: "#FFA726",
    },
    info: {
      main: COLORS.teal,
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "Roboto", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      color: COLORS.dark,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      color: COLORS.dark,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      color: COLORS.dark,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      color: COLORS.dark,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      color: COLORS.dark,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      color: COLORS.dark,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
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
          background: `linear-gradient(135deg, ${COLORS.moss} 0%, ${COLORS.forest} 100%)`,
          "&:hover": {
            background: `linear-gradient(135deg, ${COLORS.forest} 0%, ${COLORS.moss} 100%)`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          border: `1px solid ${COLORS.soft}`,
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
            "&:hover fieldset": {
              borderColor: COLORS.moss,
            },
            "&.Mui-focused fieldset": {
              borderColor: COLORS.moss,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "white !important",
          color: COLORS.dark + " !important",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        root: {
          "& .MuiBadge-badge": {
            backgroundColor: COLORS.moss,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.soft,
          borderRadius: "20px",
        },
        colorPrimary: {
          backgroundColor: COLORS.moss,
          color: "#fff",
        },
      },
    },
  },
});

export default muiTheme;
