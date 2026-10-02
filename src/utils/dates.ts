/**
 * Date parsing for content that stores dates the way they read on the page.
 *
 * The `src/data` files write dates as display strings — "12 September 2026" —
 * because that string is rendered directly, and keeping a second machine-readable
 * copy beside it would be one more pair of values to hold in step. The structured
 * data and the sitemap both need the ISO form, so the conversion lives here once
 * rather than in each of them.
 *
 * Supabase-backed content is the other way round: `updated_at` arrives as a real
 * ISO-8601 timestamp and needs no parsing at all. Both paths end up at a string
 * like `2026-09-12` or at nothing.
 */

/**
 * Converts a display date to an ISO-8601 date (`YYYY-MM-DD`), or `undefined`.
 *
 * The guard is the point. `new Date("12 September 2026")` is not a format any
 * specification requires an engine to parse — V8 has always handled it, which is
 * why it is used here, but that is a fact about the engine rather than a
 * promise. When it stops resolving, this returns `undefined` and every caller
 * omits the property: an absent `datePublished` or `lastmod` costs nothing,
 * whereas one carrying `Invalid Date` is a correctness bug that propagates
 * straight into search results.
 *
 * A date-only string is also the right precision on purpose. The content does
 * not record a time of day, and inventing `T00:00:00Z` would claim one.
 */
export function isoDate(display: string | undefined): string | undefined {
  if (!display) return undefined;
  const parsed = new Date(display);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10);
}
