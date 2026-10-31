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
           single one shouts louder than the brand colour. See globals.css. */
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
        /* `accent` is the INTERACTIVE colour: green. Every button, link, focus
           ring and active state. It kept its name through the redesign — only
           the value moved — which is why the whole site re-themed without a
           per-component edit. */
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
        /* Marigold. DECORATIVE ONLY — 2.0:1 on paper, so it is the offset shape
           behind the portrait, timeline dots, short rules and icon fills. Never
           body text or a link. `marigold-ink` is the text-safe read of the same
           hue (6.4:1) for the rare place it must carry meaning. */
        marigold: {
          DEFAULT: 'var(--color-marigold)',
          soft: 'var(--color-marigold-soft)',
          ink: 'var(--color-marigold-ink)',
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
         `shadow-sm` on a card is the one soft shadow the design specifies and
         `shadow-lg` is the hover lift, rather than two cold rgba values that
         only suit one theme. */
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      fontFamily: {
        /* Body. Plus Jakarta Sans, loaded in layout.tsx and exposed as
           `--font-sans`, so the `font-sans` in globals.css's body rule IS this
           face. The fallback stack is deliberately sans — a serif fallback
           would make the font-swap flash from serif to sans. */
        sans: [
          'var(--font-sans)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
        /* Headings. Fraunces, exposed as `--font-display` and applied to every
           h1–h4 by the base layer in globals.css. The fallback is a serif so a
           swap never changes the *shape* of a heading, only its refinement. */
        display: [
          'var(--font-display)',
          'ui-serif',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'serif',
        ],
      },
      fontSize: {
        /* Leading and tracking are tuned for FRAUNCES.

           The previous scale was cut for Space Grotesk, a grotesque derived
           from Space Mono, which carries wide geometric sidebearings and takes
           strongly negative tracking as the size climbs (-0.028em at display).
           Fraunces is a serif with optical sizing: it already tightens its own
           large sizes, and stacking a grotesque's tracking on top of that reads
           cramped and brittle. These steps run roughly half the old tracking.

           `label` runs the other way — it is the small supporting type behind
           badges, card captions and meta rows. Its 0.18em tracking was there to
           open up UPPERCASE; now that the design is sentence case throughout,
           that much air between lowercase letters just reads as broken spacing,
           so it drops to 0.04em. */
        display: [
          'clamp(2.5rem, 4.6vw, 4rem)',
          { lineHeight: '1.08', letterSpacing: '-0.016em' },
        ],
        h1: ['clamp(2.5rem, 6vw, 4.25rem)', { lineHeight: '1.08', letterSpacing: '-0.016em' }],
        h2: ['clamp(1.75rem, 4vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.012em' }],
        h3: ['clamp(1.25rem, 2.2vw, 1.75rem)', { lineHeight: '1.25', letterSpacing: '-0.008em' }],
        lead: ['clamp(1.0625rem, 1.1vw, 1.1875rem)', { lineHeight: '1.65' }],
        /* The two supporting steps. `micro` is the denser of the two, for
           chrome inside a panel; `label` is the default. Both carry their
           tracking inline, so an element that uses them never needs a
           `tracking-[…]` escape hatch. */
        micro: ['0.6875rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        label: ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.04em' }],
      },
      maxWidth: {
        container: '86rem',
        /* The brief's prose measure. Mirrors the `.measure` utility in
           globals.css so either spelling works. */
        prose: '68ch',
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
