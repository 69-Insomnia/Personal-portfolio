import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--color-paper)',
        subtle: 'var(--color-subtle)',
        'paper-blur': 'var(--color-paper-blur)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        line: 'var(--color-line)',
        'line-strong': 'var(--color-line-strong)',
        'on-accent': 'var(--color-on-accent)',
        faint: 'var(--color-faint)',
        /* Modal scrim — pre-mixed rgba, so it needs no opacity modifier. */
        scrim: 'var(--color-scrim)',
        /* Status colours live in the same luminance band as the accent, so no
           single one shouts louder than the brand colour. There is no `warning`
           — the accent is orange, which leaves a warning token nowhere to point
           that a reader would not read as "on brand". See globals.css. */
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',
        /* WhatsApp brand — fixed identity colours, same in every theme. */
        whatsapp: {
          DEFAULT: 'var(--color-whatsapp)',
          hover: 'var(--color-whatsapp-hover)',
          ink: 'var(--color-whatsapp-ink)',
        },
        /* Focus treatment, so `ring-focus` / `outline-focus` stay one decision. */
        focus: 'var(--color-ring)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          strong: 'var(--color-accent-strong)',
          soft: 'var(--color-accent-soft)',
          50: 'var(--color-accent-50)',
          100: 'var(--color-accent-100)',
          200: 'var(--color-accent-200)',
          300: 'var(--color-accent-300)',
          400: 'var(--color-accent-400)',
          500: 'var(--color-accent-500)',
          600: 'var(--color-accent-600)',
          700: 'var(--color-accent-700)',
          800: 'var(--color-accent-800)',
          900: 'var(--color-accent-900)',
          950: 'var(--color-accent-950)',
        },
        /* Direct access to the inverse palette, for the rare case that needs the
           band's colours without being inside `.section-inverse`. Prefer the
           scope class — inside it, the normal tokens already resolve here. */
        inverse: {
          DEFAULT: 'var(--color-inverse)',
          surface: 'var(--color-inverse-surface)',
          raised: 'var(--color-inverse-raised)',
          line: 'var(--color-inverse-line)',
          ink: 'var(--color-inverse-ink)',
          muted: 'var(--color-inverse-muted)',
          faint: 'var(--color-inverse-faint)',
          accent: 'var(--color-inverse-accent)',
          'accent-strong': 'var(--color-inverse-accent-strong)',
          'on-accent': 'var(--color-inverse-on-accent)',
          danger: 'var(--color-inverse-danger)',
        },
      },
      /* Overrides Tailwind's default sm/md/lg with theme-aware tokens, so
         `shadow-sm` on a card is warm-tinted in light mode and deeper in dark
         mode instead of a single cold rgba that only suits one theme. */
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      fontFamily: {
        /* The site's only face — Space Grotesk, loaded in layout.tsx and
           exposed as `--font-sans`, so the `font-sans` in globals.css's body
           rule IS the display face. The fallback stack is deliberately sans: a
           serif fallback would make the font-swap flash from serif to grotesque. */
        sans: [
          'var(--font-sans)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
      },
      fontSize: {
        /* Leading and tracking are tuned for Space Grotesk. It's derived from
           Space Mono and carries wider geometric sidebearings than a neutral
           text face, so it takes MORE negative tracking as the size climbs, not
           less — the opposite of what Inter wanted at the same steps.
           `label` runs the other way: it's the tracked uppercase micro-type
           behind the eyebrows and card captions, and it wants the air the large
           steps are shedding. */
        display: [
          'clamp(2.5rem, 4.4vw, 3.75rem)',
          { lineHeight: '1.06', letterSpacing: '-0.028em' },
        ],
        h1: ['clamp(2.25rem, 5vw, 4.25rem)', { lineHeight: '1.06', letterSpacing: '-0.028em' }],
        h2: ['clamp(1.875rem, 3.4vw, 3.25rem)', { lineHeight: '1.1', letterSpacing: '-0.024em' }],
        h3: ['clamp(1.375rem, 2vw, 1.75rem)', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        lead: ['clamp(1.0625rem, 1.2vw, 1.1875rem)', { lineHeight: '1.65' }],
        /* The two tracked-uppercase steps. Everything in caps — eyebrows, badges,
           the tags on a project card, the captions inside the mock dashboards —
           lands on one of these, so there is exactly ONE letter-spacing value
           for tracked type in the whole system. `micro` is the denser of the
           two, for chrome inside a dashboard panel; `label` is the default.
           Both carry their tracking inline, so an element that uses them never
           needs a `tracking-[…]` escape hatch. */
        micro: ['0.625rem', { lineHeight: '1.4', letterSpacing: '0.18em' }],
        label: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.18em' }],
      },
      maxWidth: {
        container: '86rem',
      },
      /* One radius for every card and inset, so a card containing an inset still
         reads as a single object. Defined in globals.css. */
      borderRadius: {
        card: 'var(--radius-card)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      zIndex: {
        nav: '70',
        menu: '80',
        /* Above both: the image lightbox has to cover the open mobile menu,
           which is itself a full-screen overlay. */
        modal: '90',
      },
    },
  },
  plugins: [],
};

export default config;
