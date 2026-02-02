/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Brand
        primary: {
          DEFAULT: "#F0421C",
          hover: "#E53A15",
          active: "#D63310",
          muted: "rgba(240, 66, 28, 0.2)",
          glow: "rgba(240, 66, 28, 0.4)",
        },
        // Background Layers
        bg: {
          deepest: "#050505",
          base: "#0A0A0A",
          surface: "#121212",
          elevated: "#1A1A1A",
          interactive: "#242424",
        },
        // Accents
        accent: {
          pink: "#EC4899",
          purple: "#8B5CF6",
          green: "#22C55E",
          yellow: "#EAB308",
          cyan: "#06B6D4",
        },
        // Text
        text: {
          primary: "#FFFFFF",
          secondary: "rgba(255, 255, 255, 0.70)",
          tertiary: "rgba(255, 255, 255, 0.50)",
          muted: "rgba(255, 255, 255, 0.40)",
          disabled: "rgba(255, 255, 255, 0.25)",
        },
        // Borders
        border: {
          subtle: "rgba(255, 255, 255, 0.05)",
          DEFAULT: "rgba(255, 255, 255, 0.10)",
          strong: "rgba(255, 255, 255, 0.15)",
          glow: "rgba(240, 66, 28, 0.30)",
          active: "rgba(240, 66, 28, 0.60)",
        },
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      spacing: {
        'sidebar': '280px',
        'sidebar-collapsed': '72px',
        'dock': '100px',
      }
    },
  },
  presets: [require("nativewind/preset")],
  plugins: [],
};
