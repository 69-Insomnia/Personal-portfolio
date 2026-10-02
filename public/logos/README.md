# Platform & tool logos

The Hero's "Platforms & Tools I Work With" strip and the Technologies section's
category cards both render each tool's official brand mark. Marks are declared
once, in the `toolLogos` registry in `src/data/skills.ts`, keyed by the name
shown in the UI:

```ts
Shopify: { slug: 'shopify', src: '/logos/shopify.svg' },
```

`toPlatformTool()` turns that into the `PlatformTool` the components consume.
The only other place a name is written down is the category lists in the same
file — adding a tool there is enough; a name with no registry entry still
renders, as a monogram.

## Everything here is local

These were hotlinked from `cdn.simpleicons.org` until it was worth counting what
that cost. The Hero and the Technologies cards together rendered 34 of these
images, and because React 19 preloads every non-lazy image it server-renders,
24 of them fired as `<link rel="preload" as="image">` before first paint —
competing for bandwidth with the page's actual largest contentful paint, to
fetch 18px of decoration. On top of that: every visitor's IP reached a
third-party CDN, and the whole section broke behind a strict
`Content-Security-Policy`.

So every mark is a file in this folder and `src` is required. `ToolMark` also
sets `loading="lazy"`, which is what stops the preloads — the origin of the file
is not what React was reacting to.

## Adding a mark

1. Fetch the SVG into this folder. `https://cdn.simpleicons.org/<slug>` serves
   it in the brand's own colour.
2. Add an entry to `toolLogos` with `slug` (provenance) and `src`.
3. Set `srcDark` as well **only** if the mark is near-black and disappears on a
   dark chip. Both files then render and Tailwind's `dark:hidden` /
   `hidden dark:block` switches between them — in CSS rather than by reading the
   theme in JS, which would race the pre-paint theme script in `layout.tsx` and
   risk a hydration mismatch.

```ts
'Express.js': {
  slug: 'express',
  src: '/logos/express.svg',
  srcDark: '/logos/express-white.svg',
},
```

The white variant is the same slug with a colour appended:
`https://cdn.simpleicons.org/express/FFFFFF`.

Slugs in use:

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
| Photoshop | `adobephotoshop` |
| Canva | `canva` |
| Meta Pixel | none available |

**`Meta Pixel` has never had a Simple Icons mark.** It has no entry in the
registry and renders as a monogram tile. That's the designed fallback, not a
bug — but it is the one chip in the section without a logo.

`canva` and `adobephotoshop` are not on the CDN either. Simple Icons dropped the
Adobe marks in v14, and Canva isn't served even though the npm package carries
it. Both files here are the Simple Icons paths with the brand's own colour
applied (`#31A8FF`, `#00C4CC`) — Simple Icons ships monochrome paths, so the
fill has to be set on the way in. `npm i simple-icons` and copy from
`node_modules/simple-icons/icons/*.svg` if you need to redo one.

## Notes

- **Marks are square.** Every file here is a Simple Icons asset, and those all
  ship a 24×24 viewBox, so they render 18×18 in the chip. `ToolMark` sizes by
  height with `width: auto` and a 92px cap anyway, so a wider asset from a
  brand's own press kit would still lay out correctly if one is ever dropped in.
- **Marks sit directly on the chip — no backdrop tile and no CSS filter.** The
  single theme problem is a near-black logo on a dark chip, which is what
  `srcDark` is for. Only Next.js and Express.js need it so far.
- **Keep the SVGs square-ish or landscape, not tiny.** A very small viewBox
  renders soft at 18px.
- **Simple Icons draws monochrome paths.** Google's four-colour G and
  WooCommerce's purple wordmark come through as single-colour versions. If the
  full-colour asset matters, use the brand's own press kit — but then check it
  against both themes.
- **These are third-party trademarks.** Simple Icons' CC0 licence covers the
  *files*, not the marks; normal nominative-fair-use rules still apply. Using
  them to describe tools you work with is the intended use.
