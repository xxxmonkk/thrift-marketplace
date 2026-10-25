/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'espresso': '#211713',
        'charcoal': '#171614',
        'parchment': '#F0E5D0',
        'ivory': '#E4D6BB',
        'gold': '#B39458',
        'sepia': '#856849',
        'walnut': '#483326',
        'olive': '#77745A',
        'border-soft': '#C4B08D',
      },
      fontFamily: {
        'display': ['"Cormorant Garamond"', 'Georgia', 'serif'],
        'serif': ['"Playfair Display"', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'parchment-gradient': 'linear-gradient(135deg, #F0E5D0 0%, #E4D6BB 100%)',
        'espresso-gradient': 'linear-gradient(135deg, #211713 0%, #171614 100%)',
        'gold-gradient': 'linear-gradient(135deg, #B39458 0%, #856849 100%)',
      },
      boxShadow: {
        'vintage': '0 2px 20px rgba(33, 23, 19, 0.15), 0 1px 4px rgba(33, 23, 19, 0.1)',
        'vintage-lg': '0 8px 40px rgba(33, 23, 19, 0.2), 0 2px 8px rgba(33, 23, 19, 0.15)',
        'gold': '0 4px 20px rgba(179, 148, 88, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
