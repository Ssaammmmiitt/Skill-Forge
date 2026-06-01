/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // RawBlock System - Theme-aware
        'raw-black': 'var(--raw-bg)',
        'raw-white': 'var(--raw-text)',
        'raw-surface': 'var(--raw-surface)',
        'raw-link': 'var(--raw-link)',
        'raw-success': 'var(--raw-success)',
        'raw-warning': 'var(--raw-warning)',
        'raw-error': 'var(--raw-error)',
        'raw-border': 'var(--raw-border)',
        'raw-hover': 'var(--raw-hover)',
        'raw-text-secondary': 'var(--raw-text-secondary)',
        'raw-text-tertiary': 'var(--raw-text-tertiary)',
        
        // StarChart System - Theme-aware
        'space-deep': 'var(--space-bg)',
        'space-surface': 'var(--space-surface)',
        'space-sunken': 'var(--space-sunken)',
        'space-overlay': 'var(--space-overlay)',
        'space-nebula': 'var(--space-nebula)',
        'space-star': 'var(--space-star)',
        'space-success': 'var(--space-success)',
        'space-warning': 'var(--space-warning)',
        'space-error': 'var(--space-error)',
        'space-info': 'var(--space-info)',
        'space-text': 'var(--space-text)',
        'space-text-secondary': 'var(--space-text-secondary)',
        
        // Arcade System - Theme-aware
        'arcade-primary': 'var(--arcade-primary)',
        'arcade-secondary': 'var(--arcade-secondary)',
        'arcade-surface': 'var(--arcade-bg)',
        'arcade-hover': 'var(--arcade-hover)',
        'arcade-danger': 'var(--arcade-danger)',
      },
      fontFamily: {
        'raw': ['Archivo Black', 'sans-serif'],
        'space': ['Fredoka', 'sans-serif'],
        'arcade': ['Press Start 2P', 'monospace'],
        'body': ['Work Sans', 'sans-serif'],
        'body-space': ['DM Sans', 'sans-serif'],
        'mono': ['Space Mono', 'monospace'],
      },
      borderRadius: {
        'none': '0px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'pill': '9999px',
        'circle': '50%',
      },
    },
  },
  plugins: [],
}
