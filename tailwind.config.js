/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
   darkMode: 'class',
     theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        temple: {
          // Main purple from logo
          purple: '#7B2D8E',
          'purple-light': '#9B4DB0',
          'purple-dark': '#5A1F68',
          // Gold accent from logo
          gold: '#D4A574',
          'gold-light': '#E8C49A',
          'gold-dark': '#B8864A',
          // Deep purple for text
          violet: '#6B2D7B',
          'dark-card': '#252542',    
          'dark-surface': '#1E1E36',           
          // Background options
          dark: '#1A1A2E',
          cream: '#FDF8F3',
        }
      },
      backgroundImage: {
        'gradient-temple': 'linear-gradient(135deg, #7B2D8E 0%, #5A1F68 100%)',
        'gradient-temple-gold': 'linear-gradient(135deg, #D4A574 0%, #B8864A 100%)',
        'gradient-temple-soft': 'linear-gradient(135deg, rgba(123, 45, 142, 0.1) 0%, rgba(90, 31, 104, 0.1) 100%)',
        'gradient-temple-dark': 'linear-gradient(135deg, #1A1A2E 0%, #2D1F3D 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
      },
      backdropBlur: {
        'glass': '10px',
      }
    },
  },
  plugins: [],
}
