/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6B8F71',
          light: '#9BB5A0',
          dark: '#4A6B4F',
          50: '#F0F5F1',
          100: '#DCE8DE',
          200: '#B8D1BC',
          300: '#9BB5A0',
          400: '#6B8F71',
          500: '#5A7D60',
          600: '#4A6B4F',
          700: '#3A5940',
          800: '#2A4730',
          900: '#1A3520',
        },
        accent: {
          DEFAULT: '#D4A843',
          light: '#E5C97A',
          dark: '#B8912E',
        },
        stress: {
          high: '#E07A7A',
          medium: '#E0A84D',
          low: '#7ABF7E',
        },
        background: '#FAF8F5',
        surface: '#FFFFFF',
        text: {
          DEFAULT: '#2D3436',
          light: '#636E72',
          muted: '#B2BEC3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
