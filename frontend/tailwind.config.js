/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-arti)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        arti: {
          night: "#0f172a",
          mist: "#e8eef9",
          lilac: "#c4b5fd",
        },
      },
      keyframes: {
        "cta-shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "float-scan": {
          "0%, 100%": { transform: "translateY(0) scale(1)", opacity: "0.75" },
          "50%": { transform: "translateY(-6px) scale(1.06)", opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.65", transform: "scale(1)" },
          "50%": { opacity: "0.95", transform: "scale(1.04)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "reveal": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "blob-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "40%": { transform: "translate(18px, -22px) scale(1.05)" },
          "70%": { transform: "translate(-12px, 14px) scale(0.97)" },
        },
        "flow-dash": {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
        "nudge-x": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(5px)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "70%": { transform: "scale(1.04)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "cta-shimmer": "cta-shimmer 1.25s ease-in-out infinite",
        "float-scan": "float-scan 2.8s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2.5s ease-in-out infinite",
        "fade-up": "fade-up 0.65s cubic-bezier(0.22, 1, 0.36, 1) both",
        "reveal": "reveal 0.85s cubic-bezier(0.22, 1, 0.36, 1) both",
        "blob-drift": "blob-drift 14s ease-in-out infinite",
        "flow-dash": "flow-dash 1.2s ease-in-out infinite alternate",
        "nudge-x": "nudge-x 1.8s ease-in-out infinite",
        "pop-in": "pop-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(99, 102, 241, 0.55)",
        "glow-lg":
          "0 0 48px -4px rgba(139, 92, 246, 0.45), 0 0 28px -8px rgba(37, 99, 235, 0.35)",
        card: "0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 12px 24px -6px rgba(15, 23, 42, 0.08)",
        "card-hover":
          "0 8px 12px -2px rgba(15, 23, 42, 0.08), 0 20px 40px -12px rgba(99, 102, 241, 0.15)",
      },
    },
  },
  plugins: [],
};
