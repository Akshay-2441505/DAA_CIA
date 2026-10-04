/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0E13",
        surface: {
          DEFAULT: "#171C25",
          elevated: "#202633",
          secondary: "#262D39",
          border: "rgba(255, 255, 255, 0.07)",
        },
        energy: {
          green: "#9CFF72",
          dim: "#4ade80",
          glow: "rgba(156, 255, 114, 0.15)",
        },
        text: {
          primary: "#F3F5F7",
          secondary: "#9AA2AE",
          muted: "#6E7684",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        'card': '20px',
        'btn': '12px',
      }
    },
  },
  plugins: [],
}
