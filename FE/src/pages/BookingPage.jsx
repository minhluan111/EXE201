import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  TextField,
  MenuItem,
  Button,
  Grid,
  Chip,
  Alert,
  InputAdornment,
} from "@mui/material";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { bookingCheckStatus, tablesList } from "../services/mockApi.js";
import { useBookingContext } from "../context/useBookingContext.js";
import TableMap from "../components/booking/TableMap.jsx";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
  teal: "#3E6A7A",
  cream: "#E9E5D4",
  soft: "#F5F5F0",
  dark: "#1F1F1F",
};

export default function BookingPage() {
  const nav = useNavigate();
  const { selected, setSelected } = useBookingContext();

  const [loading, setLoading] = useState(true);

  const todayStr = useMemo(() => {
    const d = new Date();
    const s = new Date(d.getTime() + 1000 * 60 * 60 * 24)
      .toISOString()
      .slice(0, 10);
    return s;
  }, []);

  const [booking_date, setBookingDate] = useState(todayStr);
  const [booking_time, setBookingTime] = useState("12:00");
  const [num_of_people, setNumOfPeople] = useState(2);
  const [floorTables, setFloorTables] = useState([]);
  const [error, setError] = useState("");

  const slotTimes = ["12:00", "13:00", "18:00", "19:00"];

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [, statusRes] = await Promise.all([
        tablesList(),
        bookingCheckStatus({ booking_date, booking_time }),
      ]);

      setFloorTables(statusRes.ok ? statusRes.data : []);
      setLoading(false);
    })();
  }, [booking_date, booking_time]);

  const canSelect = (table) => {
    if (!table) return false;
    if (table.status !== "available") return false;
    return num_of_people <= 2 ? table.max_seats === 2 : table.max_seats === 4;
  };

  const isFormValid = () => {
    return booking_date && booking_time && num_of_people && selected;
  };

  const handleProceed = () => {
    if (!isFormValid()) {
      setError("Please fill in all fields and select a table");
      return;
    }
    nav("/booking/confirm", {
      state: { booking_date, booking_time, num_of_people, selected },
    });
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "white" }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          py: 4,
          backgroundImage: `linear-gradient(135deg, ${COLORS.moss} 0%, ${COLORS.forest} 100%)`,
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "-128px",
            right: "-128px",
            width: "256px",
            height: "256px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.1)",
            filter: "blur(60px)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: "-96px",
            left: "-128px",
            width: "384px",
            height: "384px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.05)",
            filter: "blur(60px)",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, color: "white", mb: 1 }}
            >
              Reserve Your Table
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.9)" }}>
              Choose your perfect dining time and table
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Booking Form */}
          <Grid item xs={12} lg={4}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                sx={{
                  position: { lg: "sticky" },
                  top: { lg: "80px" },
                  borderRadius: 3,
                  border: `1px solid ${COLORS.cream}`,
                }}
              >
                <CardHeader
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Booking Details
                    </Typography>
                  }
                />
                <CardContent
                  sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                >
                  {/* Date */}
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={booking_date}
                    onChange={(e) => setBookingDate(e.target.value)}
                    inputProps={{ min: todayStr }}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Calendar size={20} style={{ color: COLORS.moss }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": { borderColor: COLORS.moss },
                        "&.Mui-focused fieldset": { borderColor: COLORS.moss },
                      },
                    }}
                  />

                  {/* Time */}
                  <TextField
                    select
                    fullWidth
                    label="Time"
                    value={booking_time}
                    onChange={(e) => setBookingTime(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Clock size={20} style={{ color: COLORS.moss }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": { borderColor: COLORS.moss },
                        "&.Mui-focused fieldset": { borderColor: COLORS.moss },
                      },
                    }}
                  >
                    {slotTimes.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* Number of People */}
                  <TextField
                    select
                    fullWidth
                    label="Guests"
                    value={num_of_people}
                    onChange={(e) => setNumOfPeople(parseInt(e.target.value))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Users size={20} style={{ color: COLORS.moss }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": { borderColor: COLORS.moss },
                        "&.Mui-focused fieldset": { borderColor: COLORS.moss },
                      },
                    }}
                  >
                    <MenuItem value={1}>1 Person</MenuItem>
                    <MenuItem value={2}>2 People</MenuItem>
                    <MenuItem value={3}>3 People</MenuItem>
                    <MenuItem value={4}>4 People</MenuItem>
                    <MenuItem value={5}>5+ People</MenuItem>
                  </TextField>

                  {/* Selected Table Summary */}
                  {selected && (
                    <Card
                      sx={{
                        backgroundColor: `${COLORS.moss}15`,
                        border: `1px solid ${COLORS.moss}50`,
                        borderRadius: 2,
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 2,
                          display: "flex",
                          gap: 2,
                          alignItems: "center",
                        }}
                      >
                        <MapPin size={24} style={{ color: COLORS.moss }} />
                        <Box>
                          <Typography
                            sx={{ fontWeight: 600, color: COLORS.dark }}
                          >
                            Table Selected
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Table {selected.table_num} ({selected.max_seats}{" "}
                            seats)
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  )}

                  {/* Error */}
                  {error && <Alert severity="error">{error}</Alert>}

                  {/* CTA */}
                  <Button
                    onClick={handleProceed}
                    disabled={!isFormValid()}
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundImage: `linear-gradient(135deg, ${COLORS.moss} 0%, ${COLORS.forest} 100%)`,
                      color: "white",
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: "16px",
                    }}
                  >
                    {selected ? "Confirm Booking" : "Select a Table"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Table Map */}
          <Grid item xs={12} lg={8}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                sx={{ borderRadius: 3, border: `1px solid ${COLORS.cream}` }}
              >
                <CardHeader
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Available Tables
                    </Typography>
                  }
                />
                <CardContent>
                  <Box
                    sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}
                  >
                    <Chip
                      label="● Available"
                      sx={{
                        backgroundColor: "#4caf50",
                        color: "white",
                      }}
                      size="small"
                    />
                    <Chip
                      label="● Booked"
                      sx={{
                        backgroundColor: COLORS.cream,
                        color: COLORS.dark,
                      }}
                      size="small"
                    />
                    <Chip
                      label="● Suitable"
                      sx={{
                        backgroundColor: "transparent",
                        border: `1px solid ${COLORS.moss}`,
                        color: COLORS.moss,
                      }}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ p: 3, bgcolor: COLORS.soft, borderRadius: 2 }}>
                    <TableMap
                      tables={floorTables}
                      selected={selected}
                      onSelect={(table) => {
                        if (canSelect(table)) {
                          setSelected(table);
                          setError("");
                        } else {
                          setError(
                            table.status === "available"
                              ? "This table cannot accommodate your party size"
                              : "This table is already booked",
                          );
                        }
                      }}
                      canSelect={canSelect}
                    />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
