import type { Config } from 'tailwindcss'

// Placeholder only. `theme-factory` replaces this once the Claude Design
// direction is chosen - colours, type scale, spacing and motion curves all
// come from there. Do not hand-pick values here in the meantime.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: { extend: {} },
} satisfies Config
