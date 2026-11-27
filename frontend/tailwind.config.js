import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: colors.slate,
        primary: {
          50: '#ecfdf7',
          100: '#d1faec',
          200: '#a7f3da',
          300: '#6ee7c2',
          400: '#34d3a6',
          500: '#10b98d',
          600: '#059673',
          700: '#04785f',
          800: '#065f4d',
          900: '#064e40',
          950: '#022c25',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.04)',
        lift: '0 10px 30px -10px rgba(4,120,95,0.45)',
        nav: '0 -1px 0 rgba(15,23,42,0.06), 0 -8px 24px rgba(15,23,42,0.04)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
        drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
};
