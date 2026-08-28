import type { Config } from 'tailwindcss'

/**
 * Direction 1c "Quicama" - verde tropical nocturno.
 * Values mirror src/styles/tokens.css; change them there, not here.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void:      'var(--chale-void)',
        sheet:     'var(--chale-sheet)',
        surface:   'var(--chale-surface)',
        'surface-2': 'var(--chale-surface-2)',
        line:      'var(--chale-line)',
        accent:    'var(--chale-accent)',
        'accent-2': 'var(--chale-accent-2)',
        gold:      'var(--chale-gold)',
        ink:       'var(--chale-text)',
        'ink-2':   'var(--chale-text-2)',
        'ink-3':   'var(--chale-text-3)',
        'ink-4':   'var(--chale-text-4)',
      },
      fontFamily: {
        sans: ["'Space Grotesk'", 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ["'Space Mono'", 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        control: '16px',
        card: '24px',
        cta: '22px',
        sheet: '32px',
      },
      boxShadow: {
        glow: 'var(--chale-glow)',
      },
      transitionTimingFunction: {
        chale: 'var(--chale-ease)',
      },
    },
  },
} satisfies Config
