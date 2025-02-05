import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "savanna": "#f4eecf",
        "neu-light": "#ffffff",
        "neu-dark": "#d1d9e6",
        "neu-shadow-dark": "rgba(163, 177, 198, 0.6)",
        "neu-shadow-light": "rgba(255, 255, 255, 0.8)",
        "neu-gradient-from": "#e6e9ef",
        "neu-gradient-to": "#eef1f5"
      },
      borderColor: {
        DEFAULT: "rgb(214, 201, 161)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fadeIn 1s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
