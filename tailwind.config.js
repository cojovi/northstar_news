/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f5f9',
          100: '#d9e5ed',
          200: '#b3cce0',
          300: '#80a9cf',
          400: '#5085bb',
          500: '#2d5f9e',
          600: '#1f4a84',
          700: '#1a3c6d',
          800: '#19335b',
          900: '#192d4d',
        },
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [],
};
