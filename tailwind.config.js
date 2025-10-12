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
        aurora: {
          50: '#e6fffa',
          100: '#b3f5ec',
          200: '#80ebe0',
          300: '#4de0d3',
          400: '#1ad6c7',
          500: '#00ccba',
          600: '#00a394',
          700: '#007a6f',
          800: '#00524a',
          900: '#002925',
        },
        dark: {
          950: '#0a0e14',
          900: '#0f1419',
          850: '#13171d',
          800: '#1a1f29',
          700: '#242936',
          600: '#2d3443',
          500: '#3d4556',
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
