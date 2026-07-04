/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0D14',
        surface: '#181A25',
        primary: '#38bdf8',
        success: '#10b981',
        warning: '#eab308',
        danger: '#ef4444',
      }
    },
  },
  plugins: [],
}
