import Link from 'next/link';
import { formatNpr, serviceStartingPrice } from '@/data/pricing';
import type { Service } from '@/types';

/**
 * The services as comparative data.
 *
 * ## Why a real `<table>`
 *
 * This site's own audit found that it had no tables anywhere, and named that as
 * a specific loss: "Comparative data (project before/after, service scope, cost
 * ranges) is exactly what gets lifted into AI answers and tables are the format
 * it lifts most readily." A grid of `<div>`s looks the same to a reader and
 * tells a retrieval system nothing — the relationship between a service and its
 * timeline exists only in the visual layout. A `<table>` states it.
 *
 * So this is a genuine table with a `<caption>`, `<th scope="col">` on every
 * column and `<th scope="row">` on every service name. The scopes are what let
 * a screen reader announce "SEO Services, Starting price: Contact for a quote"
 * rather than reading a stream of unrelated cells, and they are equally what
 * lets an extractor pair a cell with its row.
 *
 * It renders on the server with no client JavaScript, which matters more here
 * than anywhere else on the site: the crawlers this exists for — GPTBot,
 * PerplexityBot, ClaudeBot — do not execute scripts. A table that only appeared
 * after hydration would be invisible to the only audience it was built for.
 *
 * ## Why it scrolls rather than reflowing
 *
 * Five columns do not fit a phone. The alternative to the `overflow-x-auto`
 * wrapper below is dropping columns at small widths with `hidden md:table-cell`
 * — but that removes content from the reading experience on the device most
 * visitors are using, and "what's included" is the single most useful column
 * here. One table that scrolls beats two layouts that can disagree.
 *
 * The `min-w-0` on the parent is load-bearing and is the same hazard
 * `AdminShell.tsx` documents: without it, the grid or flex track the table sits
 * in stretches to the table's intrinsic width and the whole *page* scrolls
 * sideways instead of the table's own container.
 */

/** Columns the matrix renders, in reading order. */
const COLUMNS = [
  'Service',
  "What's included",
  'Typical timeline',
  'Starting price',
  'Best for',
] as const;

/**
 * True when a service has anything to show in the table.
 *
 * A service with no comparison data renders no row, and if none of them have
 * any, the table is not rendered at all — an empty table with headers is worse
 * than no table, because it claims a comparison exists and then declines to
 * make one. `fromNpr` counts as data even when it resolves to `null`, since
 * "Contact for a quote" is a real, published answer.
 */
function hasComparisonData(service: Service): boolean {
  return Boolean(
    service.deliverables?.length ||
      service.timeline ||
      service.bestFor ||
      service.fromNpr !== undefined,
  );
}

export function ServiceComparisonTable({
  services,
  className,
}: {
  services: Service[];
  className?: string;
}) {
  const rows = services.filter(hasComparisonData);

  if (rows.length === 0) return null;

  return (
    <div className={className}>
      <div className="min-w-0 overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[52rem] border-collapse text-left align-top">
          <caption className="sr-only">
            What each service includes, how long it typically takes, what it
            starts from and who it is for.
          </caption>

          <thead>
            <tr className="border-b border-line">
              {COLUMNS.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="text-label px-4 py-3.5 font-medium uppercase text-muted"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((service) => {
              const price = serviceStartingPrice(service.slug, service.fromNpr);
              const formatted = formatNpr(price);

              return (
                <tr
                  key={service.slug}
                  className="border-b border-line align-top last:border-b-0"
                >
                  {/* The row header is the service, and it links to the page.
                      The audit named internal linking as this cluster's weakest
                      part, and a table of seven services is seven contextual
                      links that did not exist before. */}
                  <th scope="row" className="px-4 py-4 text-sm font-medium text-ink">
                    <Link
                      href={`/services/${service.slug}`}
                      className="transition-colors hover:text-accent"
                    >
                      {service.title}
                    </Link>
                  </th>

                  <td className="px-4 py-4 text-sm text-muted">
                    {service.deliverables?.length ? (
                      <ul className="flex flex-col gap-1.5">
                        {service.deliverables.map((item) => (
                          <li key={item} className="leading-relaxed">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-muted">
                    {service.timeline ?? <span className="text-faint">—</span>}
                  </td>

                  <td className="px-4 py-4 text-sm text-muted">
                    {/* `null` is not missing data — it is the published answer
                        "not quoted here", which is what every tier in
                        src/data/pricing.ts says today. Rendering it as "—"
                        would hide a real answer. */}
                    {formatted ?? <span className="text-faint">Contact for a quote</span>}
                  </td>

                  <td className="px-4 py-4 text-sm text-muted">
                    {service.bestFor ?? <span className="text-faint">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * One service's own scope, on its detail page.
 *
 * A two-column `attribute / value` table rather than a second copy of the
 * matrix. Repeating the seven-service comparison on an individual service page
 * would be a worse answer to the question that page is asked ("what does this
 * one include"), and seven near-identical tables across seven URLs is the kind
 * of duplicated block that dilutes rather than helps.
 *
 * The mechanism is still a real `<table>` with scoped headers, for the same
 * extraction reason as the matrix above. No `<caption>` here because the row
 * headers name the table's subject on every line.
 */
export function ServiceSpecTable({ service }: { service: Service }) {
  const price = serviceStartingPrice(service.slug, service.fromNpr);
  const formatted = formatNpr(price);

  const rows: Array<{ label: string; value: React.ReactNode }> = [];

  if (service.deliverables?.length) {
    rows.push({
      label: "What's included",
      value: (
        <ul className="flex flex-col gap-1.5">
          {service.deliverables.map((item) => (
            <li key={item} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (service.timeline) {
    rows.push({ label: 'Typical timeline', value: service.timeline });
  }

  if (service.fromNpr !== undefined) {
    rows.push({
      label: 'Starting from',
      value: formatted ?? 'Contact for a quote',
    });
  }

  if (service.bestFor) {
    rows.push({ label: 'Best for', value: service.bestFor });
  }

  if (rows.length === 0) return null;

  return (
    <div className="min-w-0 overflow-x-auto border border-line bg-paper">
      <table className="w-full min-w-[28rem] border-collapse text-left align-top">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-line align-top last:border-b-0">
              <th
                scope="row"
                className="w-1/3 px-4 py-4 text-label font-medium uppercase text-muted"
              >
                {row.label}
              </th>
              <td className="px-4 py-4 text-sm leading-relaxed text-muted">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
