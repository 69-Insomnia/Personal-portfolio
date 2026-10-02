'use client';

import { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';
import type { PlatformTool } from '@/types';

/**
 * Sized by HEIGHT with `width: auto`, which lets a mark render at its natural
 * aspect rather than being forced into a square slot, capped so an unusually
 * wide mark cannot push the tool's name out of the chip.
 *
 * In practice every mark in `public/logos/` is a Simple Icons file, and those
 * all ship a 24×24 viewBox — so they render square at this height and the width
 * cap never binds. Keeping `width: auto` costs nothing and is the right
 * behaviour if a brand's own press-kit asset is ever dropped in beside them.
 */
const imageClasses = 'h-[18px] w-auto max-w-[92px] shrink-0 object-contain';

/**
 * Shared attributes for every mark.
 *
 * `loading="lazy"` is the one that matters. React 19 emits
 * `<link rel="preload" as="image">` for every image it renders during server
 * rendering *unless* that image is lazy. With the Hero's strip and the
 * Technologies cards both drawing from the registry, that meant 24 preloads
 * firing before first paint — 24 requests competing for bandwidth with
 * whatever the real largest contentful paint was, to fetch 18px of decoration.
 * Lazy puts them back in the ordinary deferred queue, where they belong.
 *
 * `width`/`height` give the browser an aspect ratio before the file arrives, so
 * the chip's text does not jump when it does. They describe the intrinsic size,
 * not the rendered size — the classes above still decide that.
 */
const imageProps: ImgHTMLAttributes<HTMLImageElement> = {
  alt: '',
  'aria-hidden': true,
  loading: 'lazy',
  decoding: 'async',
  width: 24,
  height: 24,
};

/**
 * The mark beside a tool's name.
 *
 * Marks sit directly on the chip — no backdrop tile, and no CSS filter to
 * recolour them. The only theme problem is a near-black logo on a dark chip,
 * and `logoDark` handles that explicitly rather than tiling every mark for the
 * sake of the two brands it affects.
 *
 * Falls back to a monogram if the image fails, in the same 18px box so a
 * failure doesn't shift the chip's layout.
 *
 * Both branches are decorative — the tool's name always sits beside them — so
 * they're hidden from the accessibility tree and the chip's accessible name
 * comes from its text. A plain <img> rather than next/image: these are tiny
 * local SVGs, where the optimizer adds a round trip and buys nothing.
 */
export function ToolMark({ tool }: { tool: PlatformTool }) {
  const [failed, setFailed] = useState(false);

  if (!tool.logo || failed) {
    return (
      <span
        aria-hidden
        className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] bg-line text-micro font-bold uppercase leading-none tracking-normal text-muted"
      >
        {tool.name.charAt(0)}
      </span>
    );
  }

  // A near-black mark needs a light variant in dark mode. Both are rendered and
  // toggled in CSS rather than by reading the theme in JS, which would risk a
  // hydration mismatch against the pre-paint theme script in layout.tsx.
  if (tool.logoDark) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...imageProps}
          src={tool.logo}
          onError={() => setFailed(true)}
          className={`${imageClasses} dark:hidden`}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...imageProps}
          src={tool.logoDark}
          onError={() => setFailed(true)}
          className={`${imageClasses} hidden dark:block`}
        />
      </>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...imageProps}
      src={tool.logo}
      onError={() => setFailed(true)}
      className={imageClasses}
    />
  );
}
