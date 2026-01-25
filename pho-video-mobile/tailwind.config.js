/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F0421C",
        background: "#0A0A0A",
        surface: "#1A1A1A",
      },
    },
  },
  presets: [require("nativewind/preset")],
  plugins: [],
};
