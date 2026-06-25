/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        synq: {
          navy: '#0a1628',
          slate: '#132337',
          pitch: '#16a34a',
          accent: '#22c55e',
          muted: '#94a3b8',
        },
      },
    },
  },
  plugins: [],
};
