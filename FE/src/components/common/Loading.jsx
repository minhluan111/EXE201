import { Box, CircularProgress, Typography } from "@mui/material";

const COLORS = {
  moss: "#788B45",
};

export default function Loading({ label = "Loading..." }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        py: 8,
      }}
    >
      <CircularProgress sx={{ color: COLORS.moss }} />
      <Typography sx={{ color: "#666" }}>{label}</Typography>
    </Box>
  );
}
