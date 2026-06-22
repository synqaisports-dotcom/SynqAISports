/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        nexus: {
          navy: '#0c1222',
          slate: '#1a2332',
          accent: '#3b6fd9',
          muted: '#8b9cb3',
        },
      },
    },
  },
  plugins: [],
};
