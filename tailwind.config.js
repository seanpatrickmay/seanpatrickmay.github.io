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
          'ui-sans-serif','system-ui','-apple-system','Segoe UI','Roboto','Inter','Helvetica Neue','Arial','Noto Sans','sans-serif'
        ]
      }
    },
  },
  plugins: [],
}

