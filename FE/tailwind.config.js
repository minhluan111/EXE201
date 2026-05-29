/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        inter:   ["Inter", "sans-serif"],
      },
      colors: {
        matcha:  "#6B8F3E",
        forest:  "#2F5B3E",
        cream:   "#E9E5D4",
        soft:    "#F7F5EF",
        dark:    "#1C1C1A",
      },
      borderRadius: {
        "2xl":  "16px",
        "3xl":  "24px",
        "4xl":  "32px",
      },
      boxShadow: {
        soft:    "0 10px 30px rgba(0,0,0,0.08)",
        premium: "0 20px 60px rgba(0,0,0,0.14)",
        glow:    "0 8px 32px rgba(107,143,62,0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
