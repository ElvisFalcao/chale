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
        void:      'rgb(var(--chale-void) / <alpha-value>)',
        sheet:     'rgb(var(--chale-sheet) / <alpha-value>)',
        surface:   'rgb(var(--chale-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--chale-surface-2) / <alpha-value>)',
        line:      'rgb(var(--chale-line) / <alpha-value>)',
        accent:    'rgb(var(--chale-accent) / <alpha-value>)',
        'accent-2': 'rgb(var(--chale-accent-2) / <alpha-value>)',
        gold:      'rgb(var(--chale-gold) / <alpha-value>)',
        ink:       'rgb(var(--chale-text) / <alpha-value>)',
        'ink-2':   'rgb(var(--chale-text-2) / <alpha-value>)',
        'ink-3':   'rgb(var(--chale-text-3) / <alpha-value>)',
        'ink-4':   'rgb(var(--chale-text-4) / <alpha-value>)',
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
