import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Stack,
} from "@mui/material";
import { MapPin, Phone, Mail, Star, Heart, Share2 } from "lucide-react";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  teal: "#3E6A7A",
  cream: "#E9E5D4",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
};

const FooterLink = ({ to, children }) => (
  <Link
    component={RouterLink}
    to={to}
    sx={{
      color: "#666",
      textDecoration: "none",
      fontWeight: 500,
      fontSize: "14px",
      "&:hover": {
        color: COLORS.moss,
        transition: "color 0.3s",
      },
    }}
  >
    {children}
  </Link>
);

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundImage: `linear-gradient(180deg, ${COLORS.soft} 0%, white 100%)`,
        borderTop: `2px solid ${COLORS.cream}`,
      }}
    >
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={6} sx={{ mb: 6 }}>
          {/* Brand */}
          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
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
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: "18px",
                    color: COLORS.dark,
                  }}
                >
                  VIZZA
                </Typography>
              </Box>
              <Typography
                sx={{ fontSize: "14px", color: "#666", mb: 2, lineHeight: 1.6 }}
              >
                Premium restaurant experience with authentic flavors and elegant
                ambiance.
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                {[Star, Heart, Share2].map((Icon, idx) => (
                  <IconButton
                    key={idx}
                    size="small"
                    sx={{
                      backgroundColor: COLORS.cream,
                      color: COLORS.dark,
                      "&:hover": {
                        backgroundColor: COLORS.moss,
                        color: "white",
                      },
                    }}
                  >
                    <Icon size={16} />
                  </IconButton>
                ))}
              </Box>
            </motion.div>
          </Grid>

          {/* Explore */}
          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  color: COLORS.dark,
                  mb: 2,
                  fontSize: "16px",
                }}
              >
                Khám phá
              </Typography>
              <Stack spacing={1}>
                <FooterLink to="/">Trang chủ</FooterLink>
                <FooterLink to="/menu">Menu</FooterLink>
                <FooterLink to="/booking">Đặt bàn</FooterLink>
                <FooterLink to="/contact">Liên hệ</FooterLink>
              </Stack>
            </motion.div>
          </Grid>

          {/* Account */}
          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  color: COLORS.dark,
                  mb: 2,
                  fontSize: "16px",
                }}
              >
                Tài khoản
              </Typography>
              <Stack spacing={1}>
                <FooterLink to="/login">Đăng nhập</FooterLink>
                <FooterLink to="/register">Đăng ký</FooterLink>
                <FooterLink to="/profile">Hồ sơ</FooterLink>
                <FooterLink to="/booking/history">Lịch sử đặt bàn</FooterLink>
              </Stack>
            </motion.div>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  color: COLORS.dark,
                  mb: 2,
                  fontSize: "16px",
                }}
              >
                Liên hệ
              </Typography>
              <Stack spacing={1.5}>
                <Box
                  sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}
                >
                  <MapPin
                    size={20}
                    style={{
                      color: COLORS.moss,
                      marginTop: "2px",
                      flexShrink: 0,
                    }}
                  />
                  <Typography sx={{ fontSize: "14px", color: "#666" }}>
                    123 Zen Garden, District 1, HCM
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <Phone size={20} style={{ color: COLORS.moss }} />
                  <Link
                    href="tel:+84123456789"
                    sx={{
                      fontSize: "14px",
                      color: "#666",
                      textDecoration: "none",
                      "&:hover": { color: COLORS.moss },
                    }}
                  >
                    +84 (0) 123 456 789
                  </Link>
                </Box>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <Mail size={20} style={{ color: COLORS.moss }} />
                  <Link
                    href="mailto:info@vizza.com"
                    sx={{
                      fontSize: "14px",
                      color: "#666",
                      textDecoration: "none",
                      "&:hover": { color: COLORS.moss },
                    }}
                  >
                    info@vizza.com
                  </Link>
                </Box>
              </Stack>
            </motion.div>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ my: 3, backgroundColor: COLORS.cream }} />

        {/* Bottom */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography sx={{ fontSize: "14px", color: "#666" }}>
            © {new Date().getFullYear()} VIZZA Restaurant. All rights reserved.
          </Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Link
              href="#"
              sx={{
                fontSize: "14px",
                color: "#666",
                textDecoration: "none",
                "&:hover": { color: COLORS.moss },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              sx={{
                fontSize: "14px",
                color: "#666",
                textDecoration: "none",
                "&:hover": { color: COLORS.moss },
              }}
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              sx={{
                fontSize: "14px",
                color: "#666",
                textDecoration: "none",
                "&:hover": { color: COLORS.moss },
              }}
            >
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
