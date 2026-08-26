import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand tokens — sampled directly from the Brasmeg logo
        // (blue #324A94, orange #D26E38). `navy` is a darker range
        // derived from that same blue, used for the sidebar/headers
        // so large surfaces don't look identical to the logo blue.
        navy: {
          DEFAULT: "#22315C",
          50: "#EEF1FA",
          100: "#D3DAF0",
          400: "#3B4F92",
          600: "#283A6B",
          700: "#1E2C50",
          900: "#141D37",
        },
        brand: {
          blue: "#324A94",
          blueDark: "#283A6B",
          orange: "#D26E38",
          orangeDark: "#B4592C",
        },
        ink: "#101828",
        mist: "#F5F7FA",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
