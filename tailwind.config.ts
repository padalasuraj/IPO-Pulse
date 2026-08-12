import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070B15",
        "ink-2": "#0B1120",
        surface: "#0F1626",
        "surface-2": "#151E32",
        line: "#1E2A44",
        "line-2": "#2A3A5C",
        muted: "#7C8AA5",
        fg: "#E7ECF6",
        cyan: "#22D3EE",
        "cyan-soft": "#67E8F9",
        magenta: "#FF2E9A",
        lime: "#A3E635",
        amber: "#FBBF24",
        danger: "#FF476F",
        violet: "#8B5CF6",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        "glow-cyan": "0 0 0 1px rgba(34,211,238,0.35), 0 0 24px -6px rgba(34,211,238,0.55)",
        "glow-magenta": "0 0 0 1px rgba(255,46,154,0.4), 0 0 26px -6px rgba(255,46,154,0.6)",
        "glow-lime": "0 0 0 1px rgba(163,230,53,0.35), 0 0 22px -8px rgba(163,230,53,0.5)",
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 20px 40px -24px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        grid:
          "linear-gradient(to right, rgba(42,58,92,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(42,58,92,0.25) 1px, transparent 1px)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        marquee: "marquee var(--marquee-duration, 40s) linear infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-up": "fade-up 0.4s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
