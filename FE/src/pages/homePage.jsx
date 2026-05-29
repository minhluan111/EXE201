import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Chip,
  Paper,
  TextField,
} from "@mui/material";
import { Star, Clock, MapPin, Zap } from "lucide-react";
import { menuList } from "../services/mockApi";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  teal: "#3E6A7A",
  cream: "#E9E5D4",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
};

export default function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const result = await menuList();
        if (result.ok) {
          setProducts(result.data);
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const bestSellers = products.slice(0, 3);
  const trending = products.slice(3, 6);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <Box sx={{ bgcolor: COLORS.soft, minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: 'url("/assets/images/hero_img.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: { xs: "400px", md: "600px" },
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            color: "white",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              color: "#ffffff",
            }}
          >
            Where Every
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: "2rem", md: "3rem" },
              fontStyle: "italic",
              color: COLORS.cream,
            }}
          >
            Sip Tells a Story
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: "rgba(255, 255, 255, 0.85)",
              maxWidth: "600px",
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Handcrafted matcha, specialty coffee, and Japanese-inspired bites.
            Reserve your perfect spot before you arrive.
          </Typography>

          {/* Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              mb: 4,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: COLORS.forest,
                color: "white",
                "&:hover": { bgcolor: COLORS.moss },
                fontWeight: 600,
                borderRadius: "25px",
                px: 4,
              }}
              onClick={() => navigate("/booking")}
            >
              Book a Table →
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                color: "white",
                borderColor: "white",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                fontWeight: 600,
                borderRadius: "25px",
                px: 4,
              }}
            >
              View Space
            </Button>
          </Box>

          {/* Info Section */}
          <Box
            sx={{
              display: "flex",
              gap: 3,
              justifyContent: "center",
              flexWrap: "wrap",
              fontSize: "0.9rem",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              57 Nguyễn Cư Trình, Ninh Kiều, Cần Thơ
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              8:00 AM – 22:00
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ color: COLORS.cream, fontWeight: 600 }}>
                7 available
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Features Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              mb: 6,
              fontWeight: 700,
              color: COLORS.dark,
            }}
          >
            Why Choose VIZZA
          </Typography>

          <Grid container spacing={4} sx={{ mb: 8 }}>
            {[
              {
                icon: <Zap size={40} />,
                title: "Fast Delivery",
                desc: "Get your order in 30 mins or less",
              },
              {
                icon: <Star size={40} />,
                title: "Quality Food",
                desc: "Fresh ingredients, authentic taste",
              },
              {
                icon: <Clock size={40} />,
                title: "24/7 Available",
                desc: "Order anytime, anywhere",
              },
            ].map((feature, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <motion.div variants={itemVariants}>
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: "center",
                      bgcolor: "white",
                      border: `1px solid ${COLORS.cream}`,
                      borderRadius: 3,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        transform: "translateY(-10px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        color: COLORS.moss,
                        mb: 2,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {feature.desc}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Best Sellers */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              mb: 6,
              fontWeight: 700,
              color: COLORS.dark,
            }}
          >
            Best Sellers
          </Typography>

          <Grid container spacing={3} sx={{ mb: 10 }}>
            {bestSellers.map((product) => (
              <Grid item xs={12} md={4} key={product.id}>
                <motion.div variants={itemVariants}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      border: `1px solid ${COLORS.cream}`,
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        transform: "scale(1.05)",
                      },
                    }}
                    onClick={() => navigate(`/menu/${product.id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="250"
                      image={
                        product.image || "https://via.placeholder.com/300x250"
                      }
                      alt={product.name}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          mb: 1,
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {product.name}
                        </Typography>
                        <Chip
                          label={(product.rating || 0).toFixed(1)}
                          sx={{
                            bgcolor: COLORS.moss,
                            color: "white",
                            fontWeight: 600,
                          }}
                          size="small"
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 2 }}
                      >
                        {product.description}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: COLORS.moss }}
                        >
                          ${product.price}
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            bgcolor: COLORS.moss,
                            color: "white",
                            "&:hover": { bgcolor: COLORS.forest },
                          }}
                        >
                          Order
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Trending Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Paper
            sx={{
              backgroundImage: `linear-gradient(135deg, ${COLORS.moss} 0%, ${COLORS.forest} 100%)`,
              color: "white",
              p: 6,
              borderRadius: 3,
              mb: 8,
              textAlign: "center",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Trending Now
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
              Check out our latest and most popular dishes
            </Typography>
            <Grid container spacing={3}>
              {trending.map((product) => (
                <Grid item xs={12} md={4} key={product.id}>
                  <Box
                    sx={{
                      bgcolor: "rgba(255,255,255,0.1)",
                      p: 3,
                      borderRadius: 2,
                      backdropFilter: "blur(10px)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.2)",
                        transform: "translateY(-5px)",
                      },
                    }}
                    onClick={() => navigate(`/menu/${product.id}`)}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                      {product.description}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      ${product.price}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </motion.div>

        {/* Newsletter */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              border: `2px solid ${COLORS.moss}`,
              borderRadius: 3,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Subscribe to Our Newsletter
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
              Get exclusive offers and updates
            </Typography>
            <Box
              sx={{ display: "flex", gap: 2, maxWidth: "500px", mx: "auto" }}
            >
              <TextField
                placeholder="Enter your email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: COLORS.moss,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: COLORS.moss,
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{
                  bgcolor: COLORS.moss,
                  color: "white",
                  "&:hover": { bgcolor: COLORS.forest },
                  fontWeight: 600,
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
