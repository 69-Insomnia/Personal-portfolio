import { getSupabase } from '@/lib/supabase-browser';

/**
 * Asks the server to drop the ISR cache for `paths` after a successful write.
 *
 * The admin form writes to Supabase from the browser, so nothing about a save
 * naturally reaches Next's cache — every route is cached for five minutes and
 * every read for another five, and the edit would only surface once both
 * expired. This POSTs to `/api/admin/revalidate`, which verifies the session's
 * access token on the server before purging.
 *
 * Best-effort by design: if the purge fails, the save has already succeeded
 * and the ISR window still refreshes the page within five minutes. So a
 * failure is logged and swallowed rather than surfaced as a save error — the
 * alternative would report "Save failed" for a save that worked.
 */
export async function revalidatePaths(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  try {
    const { data } = await getSupabase().auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    const response = await fetch('/api/admin/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ paths }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error(`[admin] revalidate failed (${response.status}): ${detail}`);
    }
  } catch (e) {
    console.error(
      `[admin] revalidate threw: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
}

/**
 * The public paths a content edit can affect: the home page (it renders the
 * services band, the proof strip and the footer), the collection's index, the
 * edited row's detail page when it has one, and the sitemap.
 *
 * `undefined` for the row's detail path means the caller had no slug (a
 * reorder, or a collection whose rows have no page of their own).
 */
export function pathsFor(
  pathPrefix: string | undefined,
  detailSlug?: string | null,
): string[] {
  const paths = new Set<string>(['/']);
  if (pathPrefix) {
    paths.add(`/${pathPrefix}`);
    paths.add('/sitemap.xml');
    if (detailSlug) paths.add(`/${pathPrefix}/${detailSlug}`);
  }
  return [...paths];
}
