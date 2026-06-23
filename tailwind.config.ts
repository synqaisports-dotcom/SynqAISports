/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        tp: {
          night: '#0a0e17',
          panel: '#111827',
          cyan: '#22d3ee',
          green: '#34d399',
          amber: '#fbbf24',
        },
      },
    },
  },
  plugins: [],
};
