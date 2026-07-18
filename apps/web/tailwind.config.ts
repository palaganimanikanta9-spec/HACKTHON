import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Colors from CSS custom properties ─────────────────────────────
      colors: {
        // Background layers
        bg: {
          base: "hsl(var(--bg-base))",
          surface: "hsl(var(--bg-surface))",
          elevated: "hsl(var(--bg-elevated))",
          overlay: "hsl(var(--bg-overlay))",
        },
        // Text
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          tertiary: "hsl(var(--text-tertiary))",
          inverse: "hsl(var(--text-inverse))",
        },
        // Border
        border: {
          subtle: "hsl(var(--border-subtle))",
          default: "hsl(var(--border-default))",
          strong: "hsl(var(--border-strong))",
        },
        // Accents
        accent: {
          primary: "hsl(var(--accent-primary))",
          "primary-hover": "hsl(var(--accent-primary-hover))",
          "primary-light": "hsl(var(--accent-primary-light))",
          secondary: "hsl(var(--accent-secondary))",
        },
        // Semantic
        success: "hsl(var(--success))",
        error: "hsl(var(--error))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
      },
      // ── Typography ──────────────────────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
      },
      // ── Spacing ─────────────────────────────────────────────────────────
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "nav-bottom": "72px",
        "top-bar": "60px",
      },
      // ── Border Radius ──────────────────────────────────────────────────
      borderRadius: {
        "2xs": "0.125rem",
        xs: "0.25rem",
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        full: "9999px",
      },
      // ── Shadows ─────────────────────────────────────────────────────────
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0,0,0,0.3)",
        sm: "0 1px 3px 0 rgba(0,0,0,0.3), 0 1px 2px -1px rgba(0,0,0,0.3)",
        md: "0 4px 6px -1px rgba(0,0,0,0.35), 0 2px 4px -2px rgba(0,0,0,0.35)",
        lg: "0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -4px rgba(0,0,0,0.35)",
        xl: "0 20px 25px -5px rgba(0,0,0,0.45), 0 8px 10px -6px rgba(0,0,0,0.4)",
        "2xl": "0 25px 50px -12px rgba(0,0,0,0.55)",
        // Glow shadows
        "violet": "0 0 40px rgba(139,92,246,0.25), 0 0 80px rgba(139,92,246,0.10)",
        "emerald": "0 0 40px rgba(16,185,129,0.20), 0 0 80px rgba(16,185,129,0.08)",
        "cyan": "0 0 40px rgba(6,182,212,0.20)",
        "glass": "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      // ── Backdrop Blur ──────────────────────────────────────────────────
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "20px",
        "2xl": "40px",
      },
      // ── Animation ──────────────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.98)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
        "strict-shimmer": {
          "0%": { transform: "translateX(-200%) rotate(35deg)" },
          "100%": { transform: "translateX(400%) rotate(35deg)" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.25s ease-out",
        "slide-down": "slide-down 0.25s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "strict-shimmer": "strict-shimmer 4s ease-in-out infinite",
        "count-up": "count-up 0.3s ease-out",
        float: "float 3s ease-in-out infinite",
        "spin-slow": "spin-slow 3s linear infinite",
      },
      // ── Transitions ─────────────────────────────────────────────────────
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.22, 1, 0.36, 1)",
        "expo-in": "cubic-bezier(0.64, 0, 0.78, 0)",
        "expo-in-out": "cubic-bezier(0.87, 0, 0.13, 1)",
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        standard: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      // ── Z-Index ─────────────────────────────────────────────────────────
      zIndex: {
        "nav": "50",
        "modal": "100",
        "toast": "200",
        "tooltip": "300",
      },
      // ── Height ──────────────────────────────────────────────────────────
      height: {
        "top-bar": "60px",
        "bottom-nav": "72px",
        "screen-safe": "calc(100dvh - 60px - 72px)",
      },
      // ── Max Width ───────────────────────────────────────────────────────
      maxWidth: {
        "app": "480px",
      },
    },
  },
  plugins: [],
};

export default config;
