import { ToolMark } from '@/components/common/ToolMark';
import type { PlatformTool } from '@/types';

/**
 * A tool's mark and name in a white pill.
 *
 * Shared by the Hero dashboard's strip and the Technologies section's category
 * cards, which is why it takes a resolved `PlatformTool` rather than a name —
 * those two draw from the same registry and must not drift apart.
 *
 * The chip is content-width and wraps, never a grid cell: a wide wordmark
 * (WooCommerce) needs a wider chip than a square glyph (Shopify), and a grid
 * would either crush the wordmark or leave the glyph rattling in dead space.
 */
export function ToolChip({ tool }: { tool: PlatformTool }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-surface py-2 pl-3 pr-3.5 shadow-sm ring-1 ring-line">
      <ToolMark tool={tool} />
      <span className="truncate text-sm font-medium tracking-tight text-muted">
        {tool.name}
      </span>
    </span>
  );
}
