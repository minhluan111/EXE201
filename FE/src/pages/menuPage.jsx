import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ChevronRight } from "lucide-react";
import {
  Box,
  Container,
  TextField,
  MenuItem,
  Chip,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
} from "@mui/material";
import { menuList } from "../services/mockApi.js";
import Loading from "../components/common/Loading.jsx";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  teal: "#3E6A7A",
  cream: "#E9E5D4",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function MenuPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [tag, setTag] = useState("all");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const categories = useMemo(
    () => ["all", "Đồ uống", "Món chính", "Món khai vị", "Món tráng miệng"],
    [],
  );

  const tags = useMemo(
    () => [
      { key: "all", label: "Tất cả" },
      { key: "best_seller", label: "Best Seller" },
      { key: "trending", label: "Trending" },
    ],
    [],
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await menuList({ q, category, tag });
      setItems(res.ok ? res.data : []);
      setLoading(false);
    })();
  }, [q, category, tag]);

  if (loading) return <Loading />;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "white" }}>
      {/* Hero */}
      <Box
        sx={{
          py: 10,
          backgroundImage: `linear-gradient(135deg, ${COLORS.moss} 0%, ${COLORS.forest} 100%)`,
          position: "relative",
          overflow: "hidden",
          color: "white",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.1)",
            filter: "blur(80px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -50,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.05)",
            filter: "blur(80px)",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Our Menu
            </Typography>
            <Typography
              variant="h5"
              sx={{ mb: 0, color: "rgba(255,255,255,0.9)" }}
            >
              Explore our carefully curated selection of dishes made with the
              finest ingredients.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ py: 6 }}>
        <Container maxWidth="lg">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {/* Search */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search dishes..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Search
                        size={20}
                        style={{ marginRight: 8, color: COLORS.moss }}
                      />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": { borderColor: COLORS.moss },
                      "&.Mui-focused fieldset": { borderColor: COLORS.moss },
                    },
                  }}
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": { borderColor: COLORS.moss },
                      "&.Mui-focused fieldset": { borderColor: COLORS.moss },
                    },
                  }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Tags */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": { borderColor: COLORS.moss },
                      "&.Mui-focused fieldset": { borderColor: COLORS.moss },
                    },
                  }}
                >
                  {tags.map((t) => (
                    <MenuItem key={t.key} value={t.key}>
                      {t.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* Active Filters Display */}
            {(q || category !== "all" || tag !== "all") && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 4 }}>
                {q && (
                  <Chip
                    label={`Search: ${q}`}
                    onDelete={() => setQ("")}
                    sx={{
                      backgroundColor: COLORS.cream,
                      color: COLORS.dark,
                      fontWeight: 600,
                    }}
                  />
                )}
                {category !== "all" && (
                  <Chip
                    label={category}
                    onDelete={() => setCategory("all")}
                    sx={{
                      backgroundColor: COLORS.cream,
                      color: COLORS.dark,
                      fontWeight: 600,
                    }}
                  />
                )}
                {tag !== "all" && (
                  <Chip
                    label={tags.find((t) => t.key === tag)?.label}
                    onDelete={() => setTag("all")}
                    sx={{
                      backgroundColor: COLORS.cream,
                      color: COLORS.dark,
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>
            )}
          </motion.div>

          {/* Results */}
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: "center",
                paddingTop: 80,
                paddingBottom: 80,
              }}
            >
              <Typography variant="h2" sx={{ mb: 2, color: COLORS.dark }}>
                🍽️
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: COLORS.dark, mb: 1 }}
              >
                No dishes found
              </Typography>
              <Typography sx={{ color: "#666", mb: 3 }}>
                Try adjusting your filters
              </Typography>
              <Button
                variant="contained"
                sx={{
                  bgcolor: COLORS.moss,
                  color: "white",
                  "&:hover": { bgcolor: COLORS.forest },
                }}
                onClick={() => {
                  setQ("");
                  setCategory("all");
                  setTag("all");
                }}
              >
                Reset Filters
              </Button>
            </motion.div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show">
              <Grid container spacing={3}>
                {items.map((dish) => (
                  <Grid item xs={12} md={6} lg={4} key={dish.id}>
                    <motion.div variants={item}>
                      <Card
                        component={RouterLink}
                        to={`/menu/${dish.id}`}
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          textDecoration: "none",
                          cursor: "pointer",
                          borderRadius: 3,
                          border: `1px solid ${COLORS.cream}`,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                            transform: "scale(1.05)",
                          },
                          position: "relative",
                        }}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            height: 250,
                            overflow: "hidden",
                            backgroundColor: COLORS.soft,
                          }}
                        >
                          <CardMedia
                            component="img"
                            height="250"
                            image={dish.image_url || ""}
                            alt={dish.name}
                            sx={{
                              objectFit: "cover",
                              transition: "transform 0.3s ease",
                              "&:hover": { transform: "scale(1.1)" },
                            }}
                          />
                          {(dish.tag === "best_seller" ||
                            dish.tag === "trending") && (
                            <Chip
                              label={
                                dish.tag === "best_seller"
                                  ? "⭐ Best"
                                  : "🔥 Trending"
                              }
                              sx={{
                                position: "absolute",
                                top: 16,
                                right: 16,
                                backgroundColor: COLORS.moss,
                                color: "white",
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Box>

                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "start",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color: COLORS.dark,
                                flex: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {dish.name}
                            </Typography>
                            {dish.avg_rating && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <Typography sx={{ fontSize: "14px" }}>
                                  ⭐
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: COLORS.dark,
                                  }}
                                >
                                  {dish.avg_rating}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#666",
                              mb: 2,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {dish.description}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "24px",
                                fontWeight: 700,
                                color: COLORS.moss,
                              }}
                            >
                              ${(dish.price / 23000).toFixed(2)}
                            </Typography>
                            <Button
                              size="small"
                              variant="contained"
                              sx={{
                                bgcolor: COLORS.moss,
                                color: "white",
                                textTransform: "none",
                                "&:hover": { bgcolor: COLORS.forest },
                              }}
                              endIcon={<ChevronRight size={16} />}
                            >
                              View
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}
        </Container>
      </Box>
    </Box>
  );
}
