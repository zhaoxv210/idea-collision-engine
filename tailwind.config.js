/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: {
          900: "#0A0B0E",
          800: "#12141A",
          700: "#1A1D26",
        },
        parchment: {
          DEFAULT: "#E8DCC4",
          muted: "#C4B8A0",
        },
        amber: {
          gold: "#D4A574",
          glow: "#E8C094",
        },
        domain: {
          tech: "#4A6FA5",
          history: "#C84B4B",
          nature: "#7A8471",
          art: "#9B7BB3",
          society: "#D4956A",
          science: "#5B8C85",
          psychology: "#A67C7C",
          economics: "#8B9A6D",
        },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        body: ["Inter Tight", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "draw-line": "drawLine 1s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(212, 165, 116, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(212, 165, 116, 0.6)" },
        },
        drawLine: {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};
