// Pennywise is a dark-first product, so the design tokens below are concrete dark-theme colours.
// (The previous config declared none, so classes such as `bg-card`, `text-foreground` and
// `bg-brand-primary` produced no CSS at all.) Hex values keep Tailwind's `/opacity` modifiers working.
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#050507',
        foreground: '#f4f4f5',
        card: '#0d0d12',
        border: '#2a2a33',
        input: '#1a1a22',
        accent: '#1f1f29',
        muted: { DEFAULT: '#1a1a22', foreground: '#a1a1aa' },
        destructive: { DEFAULT: '#f87171', foreground: '#050507' },
        brand: {
          DEFAULT: '#FF7F50',
          primary: '#FF7F50',
          hover: '#ff8f66',
          light: '#3a2218',
          dark: '#c2512a',
          muted: '#ffb199',
          destructive: '#f87171',
        },
      },
    },
  },
  plugins: [],
};
