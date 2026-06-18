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
        charcoal: {
          DEFAULT: '#1a1a1a',
          50:  '#f5f5f5',
          100: '#e8e8e8',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#7a7a7a',
          500: '#555555',
          600: '#3a3a3a',
          700: '#2a2a2a',
          800: '#1a1a1a',
          900: '#0d0d0d',
        },
        brass: {
          DEFAULT: '#b8924a',
          light:   '#d4a85c',
          dark:    '#8a6a30',
          muted:   '#c4a26a',
        },
        cream: {
          DEFAULT: '#f5f0e8',
          dark:    '#e8e0d0',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'serif'],
        body:    ['var(--font-jost)', 'sans-serif'],
        mono:    ['var(--font-dm-mono)', 'monospace'],
      },
      letterSpacing: {
        widest: '0.3em',
        ultra:  '0.5em',
      },
      animation: {
        'fade-up':   'fadeUp 0.8s ease forwards',
        'fade-in':   'fadeIn 1s ease forwards',
        'shimmer':   'shimmer 2s infinite',
        'slow-zoom': 'slowZoom 20s ease infinite alternate',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slowZoom: {
          from: { transform: 'scale(1)' },
          to:   { transform: 'scale(1.08)' },
        },
      },
    },
  },
  plugins: [],
}