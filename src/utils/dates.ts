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
 *
 * ## Why the date is read back out of local components
 *
 * `new Date("28 August 2026")` is parsed as **local** midnight. On a machine in
 * Nepal (UTC+05:45) that instant is `2026-08-27T18:15:00Z`, so
 * `.toISOString().slice(0, 10)` returned `2026-08-27` — the day before the one
 * written in the file. Every `datePublished` on the site, every `<time
 * dateTime>`, and every `lastmod` a post contributed to the sitemap was a day
 * early, and it was invisible to anyone testing on a UTC machine.
 *
 * Reading the local `getFullYear`/`getMonth`/`getDate` back out inverts exactly
 * the conversion the parser applied, so the answer is the date the content
 * actually says, in every timezone.
 */
export function isoDate(display: string | undefined): string | undefined {
  if (!display) return undefined;

  /**
   * Supabase timestamps arrive as real ISO-8601 and need no parsing at all —
   * re-parsing one can only lose information. Taking the leading date is also
   * the correct reading of a `timestamptz` for `lastmod` purposes.
   */
  const machine = /^(\d{4}-\d{2}-\d{2})/.exec(display);
  if (machine) return machine[1];

  const parsed = new Date(display);
  if (Number.isNaN(parsed.getTime())) return undefined;

  return [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, '0'),
    String(parsed.getDate()).padStart(2, '0'),
  ].join('-');
}

/**
 * The reverse direction: a date rendered the way the rest of the site writes
 * them ("12 September 2026").
 *
 * Built on `isoDate` rather than on `new Date` directly, so a display string
 * and a Supabase timestamp both land on the same day — see the note above for
 * what happens when they do not. `timeZone: 'UTC'` on the formatter is then
 * belt and braces: the value handed to it is already UTC midnight, and pinning
 * the zone keeps the server and the browser from rendering it as two different
 * days and tripping a hydration mismatch.
 */
export function displayDate(value: string | undefined): string | undefined {
  const iso = isoDate(value);
  if (!iso) return undefined;

  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
