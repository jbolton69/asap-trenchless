export default {
  content: ["./src/**/*.{njk,md,html}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0f1a",
          900: "#111827",
          800: "#1f2937",
          700: "#374151",
        },
        brand: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bce0ff",
          300: "#8ecdff",
          400: "#59b0ff",
          500: "#3390fb",
          600: "#1d71f0",
          700: "#175add",
          800: "#1949b3",
          900: "#1a418d",
          950: "#0f1d4a",
        },
        accent: {
          400: "#ffd23f",
          500: "#fbbf0f",
          600: "#d99c00",
          700: "#a87400",
        },
        flag: {
          500: "#d6202a",
          600: "#b3161f",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ['"Barlow Condensed"', '"Inter"', "system-ui", "sans-serif"],
      },
      maxWidth: { container: "1200px" },
    },
  },
  plugins: [],
};
