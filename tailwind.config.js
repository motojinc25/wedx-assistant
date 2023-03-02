/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'bounce200': 'bounce 1s infinite 200ms',
        'bounce400': 'bounce 1s infinite 400ms',
      },
      minWidth: {
        '150': '150px',
        '200': '200px',
        '250': '250px',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
