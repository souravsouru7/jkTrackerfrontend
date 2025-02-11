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
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' }
        }
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
        fadeIn: 'fadeIn 0.3s ease-out',
        fadeOut: 'fadeOut 0.8s ease-in',
        shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both'
      },
    },
  },
  plugins: [],
}