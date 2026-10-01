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
      // ── Official MVP brand palette ──────────────────────────
      // White + Blue dominant · Orange = action · Sky = discovery.
      colors: {
        // Primary Brand — intelligence, confidence, calm.
        brand: { DEFAULT: "#0E1F64", deep: "#0A1646", soft: "#E9EDF7" },
        // Action / Energy — "اضغط وجرب". Primary CTAs only.
        action: { DEFAULT: "#EE5800", deep: "#C94B00", soft: "#FCE8DB" },
        // Playful / Insight — AI insights, perspective shifts, surprise.
        sky: { DEFAULT: "#50C7E7", deep: "#0B6A86", soft: "#E3F6FC" },
        // Warm accent — used sparingly (progress, decorative).
        warm: { DEFAULT: "#F78C2C", deep: "#A65412", soft: "#FDEBD7" },
        // Dark navy — surfaces & depth instead of pure black.
        navy: "#1E2A44",
        // Text
        ink: "#15213B",
        muted: "#5B6680",
        // Neutrals
        line: "#DBE2EA",
        card: "#FFFFFF",
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
        "3xl": "2.25rem",
      },
      boxShadow: {
        // Navy-tinted, soft — calm depth on a white canvas.
        soft: "0 10px 40px -12px rgba(14, 31, 100, 0.16)",
        lift: "0 18px 48px -16px rgba(14, 31, 100, 0.26)",
        card: "0 2px 18px -6px rgba(14, 31, 100, 0.10)",
        // Energy glow reserved for the primary action.
        action: "0 16px 38px -14px rgba(238, 88, 0, 0.42)",
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
        flip: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(180deg)" },
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
