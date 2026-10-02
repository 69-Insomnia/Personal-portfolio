# Platform & tool logos

The Hero's "Platforms & Tools I Work With" strip and the Technologies section's
category cards both render each tool's official brand mark. Marks are declared
once, in the `toolLogos` registry in `src/data/skills.ts`, keyed by the name
shown in the UI:

```ts
Shopify: { slug: 'shopify' },
```

`toPlatformTool()` turns that into the `PlatformTool` the components consume.
The only other place a name is written down is the category lists in the same
file — adding a tool there is enough; a name with no registry entry still
renders, as a monogram.

## Two marks are local, not hotlinked

`canva` and `adobephotoshop` are checked into this folder and referenced with an
explicit `src`:

```ts
Photoshop: { slug: 'adobephotoshop', src: '/logos/adobephotoshop.svg' },
```

Simple Icons dropped the Adobe marks in v14, and its CDN doesn't serve Canva
even though the npm package does. Both files here are the Simple Icons paths
with the brand's own colour applied (`#31A8FF`, `#00C4CC`) — Simple Icons ships
monochrome paths, so the fill has to be set on the way in.

**`Meta Pixel` has never had a Simple Icons mark.** It has no entry in the
registry and renders as a monogram tile. That's the designed fallback, not a
bug — but it is the one chip in the section without a logo.

## Switch the rest to local files for production

Hotlinking works immediately but costs you:

- **A couple of dozen third-party requests** per page load, across the Hero and
  the Technologies section
- **Your visitors' IPs** reaching that CDN
- **A hard dependency** on someone else's uptime — and it breaks behind a
  strict `Content-Security-Policy`

To move them local, download each SVG into this folder and add a `src`. That's
the only edit — `ToolMark` handles URLs and paths identically, and falls back to
a monogram if an image fails either way:

```ts
Shopify: { slug: 'shopify', src: '/logos/shopify.svg' },
```

```bash
npm i simple-icons     # then copy from node_modules/simple-icons/icons/*.svg
```

Or fetch individually — `https://cdn.simpleicons.org/<slug>` (append a colour
for a tint, e.g. `.../shopify/7AB55C`). The slugs in use:

| Tool | Slug |
|---|---|
| React | `react` |
| Next.js | `nextdotjs` |
| JavaScript | `javascript` |
| TypeScript | `typescript` |
| HTML | `html5` |
| CSS | `css` |
| Tailwind CSS | `tailwindcss` |
| Node.js | `nodedotjs` |
| Express.js | `express` |
| PHP | `php` |
| MongoDB | `mongodb` |
| MySQL | `mysql` |
| WordPress | `wordpress` |
| WooCommerce | `woocommerce` |
| Shopify | `shopify` |
| Google Ads | `googleads` |
| Meta / Meta Ads | `meta` |
| Google Analytics | `googleanalytics` |
| Google Tag Manager | `googletagmanager` |
| Google Search Console | `googlesearchconsole` |
| Figma | `figma` |
| Photoshop | `adobephotoshop` — **local only** |
| Canva | `canva` — **local only** |
| Meta Pixel | none available |

## Notes

- **Marks are sized by height, `width: auto`.** That's deliberate: an 18px-high
  slot renders a square glyph (Shopify) and a wide wordmark (WooCommerce) at
  their natural proportions. Width is capped at 92px so an unusually long mark
  can't push the tool's name out of the chip. If you swap in an asset that
  reads badly at that height, adjust `imageClasses` in `ToolMark`
  (`src/components/common/ToolMark.tsx`).
- **Marks sit directly on the chip — no backdrop tile and no CSS filter.** The
  single theme problem is a near-black logo on a dark chip, which is what the
  registry's `white` flag is for. Only Next.js and Express.js need it:

  ```ts
  'express': { slug: 'express', white: true },
  ```

  Both images render and are toggled with Tailwind's `dark:hidden` /
  `hidden dark:block`, rather than reading the theme in JS — that would race the
  pre-paint theme script in `layout.tsx` and risk a hydration mismatch. Set
  `white` only if a mark genuinely disappears in dark mode; brand colours
  generally read fine on both surfaces.
- **Keep the SVGs square-ish or landscape, not tiny.** A very small viewBox
  will render soft at 18px.
- **Simple Icons draws monochrome paths.** Google's four-colour G and
  WooCommerce's purple wordmark come through as single-colour versions. If the
  full-colour asset matters, use the brand's own press kit — but then check it
  against both themes.
- These are third-party trademarks. Simple Icons' CC0 licence covers the *files*,
  not the marks; normal nominative-fair-use rules still apply. Using them to
  describe tools you work with is the intended use.
