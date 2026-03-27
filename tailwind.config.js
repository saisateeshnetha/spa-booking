/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ref: {
          header: '#3d2c1e',
          'nav-active': '#ffd54f',
          'filter-btn': '#fdf5f2',
          'filter-border': '#e8ddd6',
          'clear-filter': '#c05621',
          checkbox: '#4d2c19',
          shade: '#e8e8e8',
          grid: '#e5e7eb',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',
        },
        ink: {
          DEFAULT: '#0f172a',
          muted: '#64748b',
          subtle: '#94a3b8',
        },
        line: '#e2e8f0',
        brand: {
          DEFAULT: '#0d9488',
          foreground: '#ffffff',
        },
        booking: {
          confirmed: '#2563eb',
          'confirmed-bg': '#dbeafe',
          progress: '#db2777',
          'progress-bg': '#fce7f3',
          cancelled: '#94a3b8',
          'cancelled-bg': '#f1f5f9',
        },
        therapist: {
          female: '#ec4899',
          male: '#3b82f6',
        },
        card: {
          tui: { bg: '#dbeafe', border: '#93c5fd' },
          slim: { bg: '#fce7f3', border: '#f9a8d4' },
          mint: { bg: '#d1fae5', border: '#6ee7b7' },
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.06)',
        panel: '-4px 0 24px rgb(15 23 42 / 0.08)',
      },
    },
  },
  plugins: [],
};
