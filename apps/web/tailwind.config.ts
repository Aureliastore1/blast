import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0B1220",
          900: "#0F172A",
          800: "#111827",
          700: "#1E293B",
          600: "#334155",
        },
        accent: {
          cyan: "#06B6D4",
          teal: "#14B8A6",
          green: "#22C55E",
          indigo: "#6366F1",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(6, 182, 212, 0.35)",
        soft: "0 8px 30px rgba(0, 0, 0, 0.35)",
      },
      backgroundImage: {
        "grid-glow":
          "radial-gradient(circle at 20% 0%, rgba(99,102,241,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(6,182,212,0.16), transparent 40%)",
        "brand-gradient": "linear-gradient(135deg, #06B6D4 0%, #6366F1 50%, #14B8A6 100%)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
