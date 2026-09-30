import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-arabic)", "system-ui", "sans-serif"],
      },
      colors: {
        // Brand palette — warm, playful, premium
        cream: "#FBF7F0",
        ink: "#1C1A26",
        muted: "#6B6577",
        brand: {
          DEFAULT: "#6C4DF6", // curious violet
          soft: "#EEE9FF",
          deep: "#4B2ED4",
        },
        sun: {
          DEFAULT: "#FF8A3D", // warm accent
          soft: "#FFEBDC",
        },
        mint: {
          DEFAULT: "#1FC7A8", // success / reward
          soft: "#DBF6EF",
        },
        card: "#FFFFFF",
        line: "#ECE7DE",
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
        "3xl": "2.25rem",
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(28, 26, 38, 0.18)",
        lift: "0 20px 60px -18px rgba(108, 77, 246, 0.35)",
        card: "0 2px 18px -6px rgba(28, 26, 38, 0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
