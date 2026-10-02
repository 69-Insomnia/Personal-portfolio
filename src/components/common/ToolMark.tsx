'use client';

import { useState } from 'react';
import type { PlatformTool } from '@/types';

/**
 * Sized by HEIGHT with `width: auto`, which is what lets a wide wordmark
 * (WooCommerce) render at its natural aspect instead of collapsing into a
 * square slot. The width cap stops an unusually long mark from pushing the
 * tool's name out of the chip.
 */
const imageClasses = 'h-[18px] w-auto max-w-[92px] shrink-0 object-contain';

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
 * SVGs, where the optimizer adds a round trip and buys nothing.
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
          src={tool.logo}
          alt=""
          aria-hidden
          decoding="async"
          onError={() => setFailed(true)}
          className={`${imageClasses} dark:hidden`}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tool.logoDark}
          alt=""
          aria-hidden
          decoding="async"
          onError={() => setFailed(true)}
          className={`${imageClasses} hidden dark:block`}
        />
      </>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={tool.logo}
      alt=""
      aria-hidden
      decoding="async"
      onError={() => setFailed(true)}
      className={imageClasses}
    />
  );
}
