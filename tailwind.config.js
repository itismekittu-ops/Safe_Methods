
/** @type {import('tailwindcss').Config} */
export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        background: 'var(--background)',
        surface: 'var(--surface)',
        foreground: 'var(--foreground)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        destructive: 'var(--destructive)',
        // ── Private-wealth theme tokens ──
        cream: {
          DEFAULT: '#F7F3EA',
          card: '#FBF7EF',
          deep: '#EDE7D8',
          bubble: '#FFFBF0',
        },
        forest: {
          DEFAULT: '#0B3D2E',
          soft: '#16513E',
          ink: '#062418',
        },
        gold: {
          DEFAULT: '#C9A227',
          light: '#F0D780',
          dark: '#9A7A1A',
        },
        line: {
          DEFAULT: '#E3DCCB',
          80: 'rgba(227, 220, 203, 0.8)',
        },
        ink: '#1F1B16',
        sage: '#8A9B87',
        note: '#7A7264',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        raised: 'var(--shadow-raised)',
        panel: '0 8px 30px -12px rgba(11, 61, 46, 0.18)',
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
        16: '64px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
