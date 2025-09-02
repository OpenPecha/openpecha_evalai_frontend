/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom color palette from your CSS
        primary: {
          50: '#f1eff5',
          100: '#ccb4f7',
          200: '#a881f1',
          300: '#854deb',
          400: '#6119e6',
          500: '#4b14b2',
          600: '#360e7e',
          700: '#20084b',
          800: '#0a0317',
        },
        secondary: {
          50: '#eff5f5',
          100: '#b4f1f7',
          200: '#81e8f1',
          300: '#4ddeeb',
          400: '#19d4e6',
          500: '#14a5b2',
          600: '#0e757e',
          700: '#08454b',
          800: '#031517',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
        }
      },
    },
  },
  plugins: [],
}
