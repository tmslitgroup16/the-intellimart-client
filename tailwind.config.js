/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff001d',
        secondary: '#fcba03',
      }
    },
  },
  plugins: [
    require('postcss-nested'),
    require('tailwindcss'),
    require('autoprefixer'),
  ]
}
