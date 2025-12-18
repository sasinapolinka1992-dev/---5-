/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      colors: {
        primary: '#6699CC',
        secondary: '#6C757D',
        danger: '#DC3545',
        uniGray: '#EAEAEA',
      },
      animation: {
        'fade-in-up': 'fadeIn 0.3s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        }
      }
    },
  },
  plugins: [],
}