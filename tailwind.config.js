/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
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
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -30px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        float: 'float 20s ease-in-out infinite',
        fadeIn: 'fadeIn 0.3s ease-out',
        slideDown: 'slideDown 0.3s ease-out',
        slideIn: 'slideIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
