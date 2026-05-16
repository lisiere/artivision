/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: { center: true, padding: "1.25rem", screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        brand: {
          50: "rgb(var(--brand-50) / <alpha-value>)",
          100: "rgb(var(--brand-100) / <alpha-value>)",
          200: "rgb(var(--brand-200) / <alpha-value>)",
          300: "rgb(var(--brand-300) / <alpha-value>)",
          400: "rgb(var(--brand-400) / <alpha-value>)",
          500: "rgb(var(--brand-500) / <alpha-value>)",
          600: "rgb(var(--brand-600) / <alpha-value>)",
          700: "rgb(var(--brand-700) / <alpha-value>)",
          800: "rgb(var(--brand-800) / <alpha-value>)",
          900: "rgb(var(--brand-900) / <alpha-value>)",
        },
        bg: "rgb(var(--bg) / <alpha-value>)",
        "bg-soft": "rgb(var(--bg-soft) / <alpha-value>)",
        "bg-elev": "rgb(var(--bg-elev) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter Variable", "system-ui", "sans-serif"],
        display: ['"Plus Jakarta Sans Variable"', '"Plus Jakarta Sans"', "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem, 7vw, 5.5rem)", { lineHeight: "1.02", letterSpacing: "-0.035em" }],
        "display-xl": ["clamp(2.5rem, 5vw, 4rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
      },
      height: {
        13: "3.25rem",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        soft: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        lg: "var(--shadow-lg)",
        glow: "var(--shadow-glow)",
      },
      animation: {
        shine: "shine 8s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulseSlow 4s ease-in-out infinite",
      },
      keyframes: {
        shine: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
