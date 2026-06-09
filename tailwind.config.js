/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './*.js'],
  theme: {
    extend: {
      colors: {
        emerald: {
          50:  '#e6f2f0',
          100: '#cce5e1',
          200: '#99cbc3',
          300: '#66b1a5',
          400: '#339787',
          500: '#056b57',
          600: '#045a4a',
          700: '#034638',
          800: '#022e26',
          900: '#011713'
        }
      }
    }
  },
  plugins: []
}
