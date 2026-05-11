/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        border: 'var(--color-border)',
        muted: 'var(--color-text-muted)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        accent: 'var(--color-accent)',
        text: 'var(--color-text)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.4,0,0.2,1)',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0.3)' },
          '50%': { boxShadow: '0 0 0 8px rgba(99,102,241,0)' },
        },
      },
      boxShadow: {
        'glow': '0 0 40px rgba(99,102,241,0.2)',
        'glow-sm': '0 0 20px rgba(99,102,241,0.15)',
        'dark': '0 25px 80px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
        'gradient-accent': 'linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #c4b5fd 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a1a24 0%, #0f0f13 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(26,26,36,1) 100%)',
      },
    },
  },
  plugins: [],
}
