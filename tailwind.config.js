/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#1a73e8',
          blueHover: '#1557b0',
          blueLight: '#e8f0fe',
          gray: '#5f6368',
          border: '#dadce0',
          surface: '#ffffff',
          bg: '#f8f9fa'
        }
      }
    },
  },
  plugins: [],
}
