import daisyui from "daisyui"

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        studypathshala: {
          primary: "#1d4ed8",         // blue-700
          "primary-content": "#ffffff",
          secondary: "#7c3aed",       // violet-600
          accent: "#16a34a",          // green-600
          neutral: "#111827",         // gray-900 for good contrast
          "base-100": "#ffffff",
          "base-content": "#111827",
          info: "#2563eb",
          success: "#16a34a",
          warning: "#d97706",
          error: "#dc2626",
        },
      },
      "light",
      "dark",
    ],
  },
}

