// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'color-pulse': 'color-pulse 2s infinite alternate',
      },
      keyframes: {
        'color-pulse': {
          '0%, 100%': { backgroundColor: '#3b82f6' },
          '50%': { backgroundColor: '#ef4444' },
        },
      },
    },
  },
  plugins: [],
}
