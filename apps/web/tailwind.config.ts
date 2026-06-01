import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#09090F",
          surface: "#111118",
          elevated: "#18181F",
          overlay: "#1F1F2A",
        },
        border: {
          subtle: "#1E1E2E",
          default: "#2A2A3E",
          strong: "#3A3A56",
        },
        brand: {
          purple: "#8B5CF6",
          "purple-dim": "#6D28D9",
          green: "#10B981",
        },
        text: {
          primary: "#F0F0F5",
          secondary: "#A0A0B8",
          muted: "#5A5A78",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
