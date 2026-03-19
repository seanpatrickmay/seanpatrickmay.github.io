/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"DM Sans"','ui-sans-serif','system-ui','-apple-system','sans-serif'
        ],
        display: [
          '"Instrument Serif"','Georgia','ui-serif','serif'
        ],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 600ms ease-out both',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
