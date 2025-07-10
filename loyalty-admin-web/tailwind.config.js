/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f6f8f4',
          100: '#e9ede4',
          200: '#d5dccb',
          300: '#b8c5a7',
          400: '#9caf88',
          500: '#7a8b6b',
          600: '#627156',
          700: '#4f5a47',
          800: '#41493c',
          900: '#383f34',
        },
        beige: {
          50: '#fafaf0',
          100: '#f5f5dc',
          200: '#f0f0c8',
          300: '#e8e8b8',
          400: '#e0e0a8',
          500: '#d8d898',
          600: '#c8c888',
          700: '#b8b878',
          800: '#a8a868',
          900: '#989858',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}