/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./app/_layout.tsx",
    "./app/index.tsx",
    "./app/(tabs)/**/*.tsx",
    "./app/components/*.{js,jsx,ts,tsx}",
    "./app/signIn/**/*.{js,jsx,ts,tsx}"

],
  theme: {
    extend: {},
  },
  plugins: [],
};