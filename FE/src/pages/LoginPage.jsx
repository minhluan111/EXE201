import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  teal: "#3E6A7A",
  cream: "#E9E5D4",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login({ login: email, password });
      if (result?.ok) {
        navigate("/");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(135deg, ${COLORS.soft} 0%, ${COLORS.cream} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-160px",
          right: "-160px",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          backgroundColor: "rgba(120, 139, 69, 0.1)",
          filter: "blur(60px)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-160px",
          left: "-160px",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          backgroundColor: "rgba(62, 106, 122, 0.05)",
          filter: "blur(60px)",
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: "100%",
          maxWidth: "420px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <Card
          sx={{
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "24px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Box
                sx={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundImage: `linear-gradient(135deg, ${COLORS.moss} 0%, ${COLORS.forest} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ color: "white", fontWeight: "bold" }}>
                  V
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
                VIZZA
              </Typography>
            </Link>

            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Sign in to your account to continue
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              {/* Email */}
              <TextField
                fullWidth
                id="email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} style={{ color: COLORS.moss }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: COLORS.moss },
                    "&.Mui-focused fieldset": { borderColor: COLORS.moss },
                  },
                  "& .MuiOutlinedInput-input::placeholder": {
                    opacity: 0.7,
                  },
                }}
              />

              {/* Password */}
              <TextField
                fullWidth
                id="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} style={{ color: COLORS.moss }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: COLORS.moss }}
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: COLORS.moss },
                    "&.Mui-focused fieldset": { borderColor: COLORS.moss },
                  },
                }}
              />

              {/* Remember & Forgot */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <FormControlLabel
                  control={<Checkbox />}
                  label="Remember me"
                  sx={{
                    "& .MuiCheckbox-root": {
                      color: COLORS.moss,
                      "&.Mui-checked": { color: COLORS.moss },
                    },
                  }}
                />
                <Link
                  to="#"
                  style={{
                    color: COLORS.moss,
                    textDecoration: "none",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  Forgot password?
                </Link>
              </Box>

              {/* Error */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  backgroundImage: `linear-gradient(135deg, ${COLORS.moss} 0%, ${COLORS.forest} 100%)`,
                  color: "white",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "16px",
                  mb: 2,
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              {/* Sign Up Link */}
              <Box
                sx={{
                  textAlign: "center",
                  pt: 2,
                  borderTop: `1px solid ${COLORS.cream}`,
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    style={{
                      color: COLORS.moss,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Sign up now
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card
            sx={{
              mt: 3,
              backgroundColor: "rgba(255,255,255,0.5)",
              backdropFilter: "blur(8px)",
              border: `1px solid ${COLORS.cream}`,
              textAlign: "center",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 1, color: COLORS.dark }}>
                Demo Credentials
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Email: demo@vizza.com
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Password: demo123
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </Box>
  );
}
