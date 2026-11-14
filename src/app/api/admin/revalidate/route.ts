import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

/**
 * Cache invalidation for the admin panel — the missing half of the save flow.
 *
 * Every public route is ISR-cached (`initialRevalidateSeconds: 300`) and every
 * Supabase read carries `next: { revalidate: 300 }`, so before this endpoint
 * existed an admin edit only surfaced after the five-minute window expired —
 * which is why saving in /admin appeared to do nothing. The form now calls
 * this route after a successful write, and `revalidatePath` drops the cached
 * copy so the next request re-renders from the database.
 *
 * ## Authentication
 *
 * The caller sends the admin's own Supabase access token as a bearer token.
 * It is verified **on the server** with `auth.getUser(token)` — never trusted
 * from the request body — and then checked for `app_metadata.role = 'admin'`,
 * the same claim the `services admin write` RLS policy keys off. A stolen or
 * forged path list from an anonymous caller therefore purges nothing.
 *
 * ## Input validation
 *
 * Paths are matched against a whitelist, not sanitised: only `/`, the
 * sitemap, and the three content sections with their detail slugs. `revalidatePath`
 * takes a filesystem-ish path, so accepting arbitrary input here would let an
 * authenticated admin (or a leaked token) invalidate routes far outside the
 * content they just edited. Slug characters are restricted to what the site's
 * own slugs use — lowercase letters, digits and hyphens.
 *
 * ## What is deliberately not here
 *
 * No data reads or writes. This endpoint only expires caches; the content row
 * itself is written by the form straight to Supabase under RLS, and mixing the
 * two would make a successful save depend on a successful purge.
 */

/** `/`, `/sitemap.xml`, `/services`, `/services/meta-ads`, `/blog/…`, `/work/…`. */
const ALLOWED_PATH = /^\/(?:sitemap\.xml|(?:services|blog|work)(?:\/[a-z0-9][a-z0-9-]*)?)?$/;

const MAX_PATHS = 25;

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request): Promise<Response> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return json(500, { error: 'Supabase is not configured on the server.' });
  }

  // 1. Authentication — the bearer token proves who is calling.
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) {
    return json(401, { error: 'Missing bearer token.' });
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return json(401, { error: 'Invalid or expired session.' });
  }
  const role = (data.user.app_metadata as { role?: unknown } | null)?.role;
  if (role !== 'admin') {
    return json(403, { error: 'Not an admin session.' });
  }

  // 2. Input validation — a whitelist, applied on the server.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'Body must be JSON: { "paths": ["/services"] }.' });
  }
  const paths = (body as { paths?: unknown } | null)?.paths;
  if (!Array.isArray(paths) || paths.length === 0 || paths.length > MAX_PATHS) {
    return json(400, { error: `"paths" must be an array of 1–${MAX_PATHS} paths.` });
  }
  for (const path of paths) {
    if (typeof path !== 'string' || !ALLOWED_PATH.test(path)) {
      return json(400, { error: `Path not allowed: ${String(path).slice(0, 80)}` });
    }
  }

  // 3. Purge. Deduped so the caller can send overlapping lists freely.
  const unique = [...new Set(paths)];
  try {
    for (const path of unique) revalidatePath(path);
  } catch (e) {
    return json(500, {
      error: e instanceof Error ? e.message : 'revalidatePath failed',
    });
  }

  return json(200, { revalidated: unique });
}
