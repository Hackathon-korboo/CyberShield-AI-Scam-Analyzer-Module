/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#efece6',
          canvas: '#efece6',
          card: '#ffffff',
          subtle: '#f7f5f0',
          border: '#dedad2',
          muted: '#52504c',
          text: '#141416',
        },
        charcoal: {
          DEFAULT: '#141416',
          surface: '#18181b',
          border: '#27272a',
        },
        brand: {
          orange: '#ff5500',
          coral: '#ff6b1a',
          dark: '#141416',
        },
        cyber: {
          dark: '#0a0d14',
          card: '#111726',
          border: '#1e293b',
          accent: '#06b6d4',
          cyan: '#22d3ee',
          violet: '#8b5cf6',
          danger: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
          muted: '#64748b'
        }
      }
    },
  },
  plugins: [],
}

