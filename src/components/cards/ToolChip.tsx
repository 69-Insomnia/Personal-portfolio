import { ToolMark } from '@/components/common/ToolMark';
import type { PlatformTool } from '@/types';

/**
 * A tool's mark and name in a pill.
 *
 * Shared by the Stack section's category rows, which is why it takes a
 * resolved `PlatformTool` rather than a name — the rows draw from the same
 * registry and must not drift apart.
 *
 * The chip is content-width and wraps, never a grid cell: a wide wordmark
 * (WooCommerce) needs a wider chip than a square glyph (Shopify), and a grid
 * would either crush the wordmark or leave the glyph rattling in dead space.
 *
 * It used to carry `shadow-sm` and a `ring-1`. Under the previous shadow scale
 * that was a hairline; under this one `shadow-sm` is the design's single soft
 * shadow — 30px of blur — which on a 32px pill reads as a smudge rather than
 * elevation. Chips sit flush on the page now, separated by a hairline only.
 */
export function ToolChip({ tool }: { tool: PlatformTool }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-2.5 pr-3.5">
      <ToolMark tool={tool} />
      <span className="truncate text-sm text-ink">{tool.name}</span>
    </span>
  );
}
