import { Box, Typography } from "@mui/material";

const COLORS = {
  moss: "#788B45",
  forest: "#2F5B3E",
};

export default function SectionHeading({
  kicker,
  title,
  description,
  align = "center",
}) {
  return (
    <Box sx={{ textAlign: align }}>
      {kicker && (
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: COLORS.moss,
            opacity: 0.9,
            mb: 1.5,
          }}
        >
          {kicker}
        </Typography>
      )}
      <Typography
        variant="h2"
        sx={{
          fontSize: { xs: "28px", md: "36px" },
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: COLORS.forest,
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography
          sx={{
            mt: 2,
            fontSize: { xs: "16px", md: "18px" },
            opacity: 0.7,
            maxWidth: "500px",
            mx: align === "center" ? "auto" : 0,
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
}
