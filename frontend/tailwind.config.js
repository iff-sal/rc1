/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    colors: {
      primary: '#FFC107', // Example Yellow
      secondary: '#7B1FA2', // Example Maroon-like
    },
  },
  plugins: [],
}