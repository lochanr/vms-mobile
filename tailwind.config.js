/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: '#080c14',
        surface: 'rgba(255,255,255,0.04)',
        accent: '#f59e0b',
        muted: '#64748b',
      }
    },
  },
  plugins: [],
}
