/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'binance-dark': '#0b0e11',
        'binance-dark-2': '#181a20',
        'binance-yellow': '#FCD535',
        'binance-text': '#EAECEF',
      },
      fontFamily: {
        'plex': ['IBM Plex Sans', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}