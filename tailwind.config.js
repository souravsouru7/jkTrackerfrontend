// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 1s ease-in forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      colors: {
        copper: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#b08968',
          600: '#8b6b4c',
          700: '#654e38',
          800: '#443322',
          900: '#221911',
        },
      },
      animation: {
        'float-3d': 'float-3d 20s infinite ease-in-out',
        'shine': 'shine 3s linear infinite',
        'gradient-x': 'gradient-x 3s linear infinite',
        'pulse-border': 'pulse-border 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'float': 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}