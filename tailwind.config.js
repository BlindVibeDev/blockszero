/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '480px',
        'xxs': '360px',
      },
      fontSize: {
        'xxs': '0.65rem',
      },
      colors: {
        theme: {
          bg: 'rgb(var(--theme-bg) / <alpha-value>)',
          'bg-secondary': 'rgb(var(--theme-bg-secondary) / <alpha-value>)',
          border: 'rgb(var(--theme-border) / <alpha-value>)',
          accent: 'rgb(var(--theme-accent) / <alpha-value>)',
          'accent-dark': 'rgb(var(--theme-accent-dark) / <alpha-value>)',
          text: {
            primary: 'rgb(var(--theme-text-primary) / <alpha-value>)',
            secondary: 'rgb(var(--theme-text-secondary) / <alpha-value>)',
            accent: 'rgb(var(--theme-text-accent) / <alpha-value>)'
          }
        }
      },
      borderColor: {
        DEFAULT: 'rgb(var(--theme-border))'
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
          },
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'),
  ],
};