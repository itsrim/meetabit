const konstaConfig = require('konsta/config');

/** @type {import('tailwindcss').Config} */
module.exports = konstaConfig({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        'primary-dark': '#4f46e5',
      }
    },
  },
  plugins: [],
});
