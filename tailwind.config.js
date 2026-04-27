/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Cormorant Garamond'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        cream: '#F5F0E8',
        gold: '#C9A96E',
        'gold-light': '#E8D5AA',
        charcoal: '#1A1A1A',
        warm: '#0D0D0D',
      },
    },
  },
  plugins: [],
}
