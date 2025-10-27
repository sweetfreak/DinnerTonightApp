/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./app/(tabs)/**/*.{js,jsx,ts,tsx}",
    "./app/components/*.{js,jsx,ts,tsx}",
    "./app/signIn/**/*.{js,jsx,ts,tsx}",

],
  theme: {
    extend: {},
  },
  plugins: [],
};