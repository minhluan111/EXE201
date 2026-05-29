import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
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
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  teal: "#3E6A7A",
  cream: "#E9E5D4",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      if (result?.ok) {
        navigate("/");
      } else {
        setError(result?.message || "Registration failed");
      }
    } catch (err) {
      setError(err.message || "Registration failed");
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
        py: 3,
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
              Create Account
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Join us for an exceptional dining experience
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              {/* Name */}
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={20} style={{ color: COLORS.moss }} />
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

              {/* Email */}
              <TextField
                fullWidth
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} style={{ color: COLORS.moss }} />
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

              {/* Phone */}
              <TextField
                fullWidth
                id="phone"
                name="phone"
                type="tel"
                label="Phone Number"
                placeholder="+84 (0) 123 456 789"
                value={formData.phone}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone size={20} style={{ color: COLORS.moss }} />
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

              {/* Password */}
              <TextField
                fullWidth
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
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

              {/* Confirm Password */}
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                label="Confirm Password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
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
                        onClick={() => setShowConfirm(!showConfirm)}
                        edge="end"
                        sx={{ color: COLORS.moss }}
                      >
                        {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
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

              {/* Terms */}
              <FormControlLabel
                control={<Checkbox required />}
                label={
                  <Typography variant="body2">
                    I agree to the{" "}
                    <Link
                      to="#"
                      style={{
                        color: COLORS.moss,
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="#"
                      style={{
                        color: COLORS.moss,
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{
                  mb: 2,
                  "& .MuiCheckbox-root": {
                    color: COLORS.moss,
                    "&.Mui-checked": { color: COLORS.moss },
                  },
                }}
              />

              {/* Error */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Register Button */}
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
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              {/* Sign In Link */}
              <Box
                sx={{
                  textAlign: "center",
                  pt: 2,
                  borderTop: `1px solid ${COLORS.cream}`,
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    style={{
                      color: COLORS.moss,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
