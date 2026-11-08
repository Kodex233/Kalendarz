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
          darkBg: '#131314',        // Deep dark background for app frame
          calendarBg: '#1e1f20',    // Dark surface for calendar canvas with rounded-3xl
          surface: '#282a2d',       // Cards and dialogs
          surfaceHover: '#35373a',
          surfaceActive: '#3c4043',
          border: '#303134',
          borderLight: '#3c4043',
          text: '#e3e3e3',
          textMuted: '#9aa0a6',
          blue: '#8ab4f8',
          blueHover: '#aecbfa',
          bluePill: '#a8c7fa',
          blueDark: '#004a77',
          blueText: '#041e49',
        }
      },
      borderRadius: {
        'calendar': '28px',
      }
    },
  },
  plugins: [],
}
