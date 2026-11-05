/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        google: {
          bg: '#1f1f1f',
          surface: '#282a2d',
          surfaceHover: '#35373a',
          surfaceActive: '#3c4043',
          border: '#3c4043',
          borderLight: '#444746',
          text: '#e3e3e3',
          textMuted: '#9aa0a6',
          blue: '#8ab4f8',
          blueHover: '#aecbfa',
          blueBg: '#1b3a57',
        }
      }
    },
  },
  plugins: [],
}
