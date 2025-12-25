/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Our professional colors
        background: {
          DEFAULT: '#F8F9FC',
          card: '#FFFFFF',
          subtle: '#F2F3F7',
        },
        text: {
          primary: '#0D0D0D',
          secondary: '#4A4A4A',
          tertiary: '#6F6F6F',
          muted: '#9DA3AF',
        },
        accent: {
          blue: '#3A7BFF',
          'blue-soft': '#A7C8FF',
          green: '#19C37D',
          yellow: '#F4C518',
          red: '#FF4D4F',
        },
        button: {
          primary: '#0A0A0A',
          'primary-text': '#FFFFFF',
        },
        border: {
          DEFAULT: '#E2E4EA',
          input: '#DADDE5',
        },
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out',
      },
      boxShadow: {
        soft: '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
        elevated: '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['corporate', 'business'], // Light and dark themes
  },
}