import type { Config } from 'tailwindcss';

const config: Config = {
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
        /* `accent` is the INTERACTIVE colour: deep blue. Every button, link,
           focus ring and active state. It kept its name through two hue
           changes — only the value moved — which is why the whole site
           re-themed without a per-component edit. */
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
        /* Coral (still named `marigold`). DECORATIVE ONLY — 2.8:1 on white, so
           it is the offset shape behind the portrait, timeline dots, short
           rules and icon fills. Never body text or a link. `marigold-ink` is
           the text-safe read of the same hue (6.4:1) for the rare place it
           must carry meaning. */
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
        /* Body. Inter, loaded in layout.tsx and exposed as `--font-sans`, so
           the `font-sans` in globals.css's body rule IS this face. The fallback
           stack is deliberately sans — a serif fallback would make the
           font-swap flash from serif to sans. */
        sans: [
          'var(--font-sans)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
        /* Headings. Sora, exposed as `--font-display` and applied to every
           h1–h4 by the base layer in globals.css. The fallback is a neutral
           sans so a swap never changes the *shape* of a heading, only its
           refinement. */
        display: [
          'var(--font-display)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
      },
      fontSize: {
        /* Leading and tracking are tuned for SORA.

           Sora is a wide geometric sans: at display sizes its round bowls
           need more negative tracking than a text face would (−0.03em reads
           as tight rather than cramped at 4rem) and a shorter leading, since
           the tall x-height already fills the line box. The old Fraunces scale
           ran optical-size-aware near-zero tracking; these steps do that work
           by hand.

           The two supporting steps are documented at their definitions below. */
        display: [
          'clamp(2.75rem, 5vw, 4.5rem)',
          { lineHeight: '1.02', letterSpacing: '-0.032em' },
        ],
        h1: ['clamp(2.5rem, 5.4vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        h2: ['clamp(1.875rem, 3.6vw, 2.75rem)', { lineHeight: '1.12', letterSpacing: '-0.024em' }],
        h3: ['clamp(1.25rem, 2vw, 1.625rem)', { lineHeight: '1.28', letterSpacing: '-0.014em' }],
        lead: ['clamp(1.0625rem, 1.1vw, 1.1875rem)', { lineHeight: '1.65' }],
        /* The two supporting steps. `micro` is the denser of the two, for
           chrome inside a panel; `label` is the default for breadcrumbs, meta
           rows and card captions — most of which are sentence case, so it
           keeps modest tracking. The UPPERCASE idiom lives on `.eyebrow` in
           globals.css, which carries its own wide tracking where it needs it. */
        micro: ['0.6875rem', { lineHeight: '1.5', letterSpacing: '0.04em' }],
        label: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em' }],
      },
      maxWidth: {
        /*1280px — a laptop-first measure. The old 86rem (1376px) left wide
           gutters at common desktop widths without giving the content more
           room;1440px+ views now center a denser column, which is how the
           agency/SaaS references this design takes its cues from behave. */
        container: '80rem',
        /* The brief's prose measure. Mirrors the `.measure` utility in
           globals.css so either spelling works. */
        prose: '68ch',
      },
      /* Two radii, mirroring globals.css: `card` for surfaces, `control` for
         buttons, inputs and chips. One radius for every nested panel still
         holds — a card containing a panel reads as a single object. */
      borderRadius: {
        card: 'var(--radius-card)',
        control: 'var(--radius-control)',
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
