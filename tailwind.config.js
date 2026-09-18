/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark:    '#0A1E32',
          darker:  '#070D1A',
          card:    '#13203A',
          border:  '#253B5C',
          green:   '#00DFA2',
          greenD:  '#00B894',
          red:     '#FF6B6B',
          blue:    '#4A8BFF',
          text:    '#F0F4FA',
          muted:   '#8FA4C8',
          subtle:  '#5A7399',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}