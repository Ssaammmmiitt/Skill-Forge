/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#000000',
        'surface-soft': '#0d0d0d',
        'surface-card': '#141414',
        'surface-elevated': '#1f1f1f',
        hairline: '#262626',
        'hairline-strong': '#3a3a3a',
        ink: '#ffffff',
        body: '#cccccc',
        'body-strong': '#e6e6e6',
        muted: '#999999',
        'muted-soft': '#666666',
        link: '#c3d9f3',
        warning: '#d4a017',
        success: '#5fa657',
      },
      fontFamily: {
        display: ['Bugatti Display', 'Saira Condensed', 'sans-serif'],
        body: ['Bugatti Text Regular', 'Cormorant Garamond', 'EB Garamond', 'serif'],
        mono: ['Bugatti Monospace', 'JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        pill: '9999px',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
