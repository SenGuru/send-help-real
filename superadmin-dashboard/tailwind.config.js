/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Flutter Neutral Color Palette
        primary: {
          50: '#F7FAFC',
          100: '#EDF2F7',
          200: '#E2E8F0',
          300: '#CBD5E0',
          400: '#A0AEC0',
          500: '#718096',
          600: '#4A5568',
          700: '#2D3748',
          800: '#1A202C',
          900: '#171923',
          DEFAULT: '#2D3748', // Dark Slate Gray
        },
        secondary: {
          DEFAULT: '#4A5568', // Medium Gray
          light: '#718096',
          dark: '#2D3748',
        },
        accent: {
          50: '#EBF8FF',
          100: '#BEE3F8',
          200: '#90CDF4',
          300: '#63B3ED',
          400: '#4299E1',
          500: '#3182CE',
          600: '#2B6CB0',
          700: '#2C5282',
          800: '#2A4365',
          900: '#1A365D',
          DEFAULT: '#3182CE', // Professional Blue
        },
        neutral: {
          background: '#F7FAFC',
          card: '#FFFFFF',
          surface: '#F1F5F9',
          border: '#E2E8F0',
          'border-light': '#F1F5F9',
          divider: '#E5E7EB',
        },
        text: {
          primary: '#1A202C',
          secondary: '#718096',
          light: '#9CA3AF',
          'on-primary': '#FFFFFF',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}