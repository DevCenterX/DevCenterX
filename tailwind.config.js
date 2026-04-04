/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './docs/**/*.html',
    './docs/**/*.js',
    './chat/**/*.js',
    './api/**/*.js',
    './*.html'
  ],
  theme: {
    extend: {
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        float: 'float 6s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out 3s infinite',
        'epic-enter': 'epicEnter 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'success-pop': 'successPop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'pan-grid': 'panGrid 20s linear infinite',
        'spin-slow': 'spin 20s linear infinite',
        'spin-reverse': 'spin 25s linear infinite reverse'
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'epicEnter': {
          '0%': { opacity: '0', transform: 'scale(0.85) translateY(40px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.7', transform: 'scale(1.1)' }
        },
        successPop: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '70%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        panGrid: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(24px)' }
        }
      }
    }
  }
};
