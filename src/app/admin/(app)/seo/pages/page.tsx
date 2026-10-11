'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { getSupabase } from '@/lib/supabase-browser';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { staticPages } from '@/data/static-pages';

/**
 * The static pages, and whether each one has SEO overrides.
 *
 * ## Why this screen had to exist
 *
 * `seo_meta` is keyed by `(entity_type, entity_slug)`, and the seven static
 * routes use `entity_type = 'page'` with a stable name instead of a slug. Those
 * rows are real and they are read — `src/app/services/page.tsx` calls
 * `getSeo('page', 'services')` and merges the result over the template in
 * `src/data/seo.ts`, and the sitemap consults the same rows to decide what is
 * indexable.
 *
 * But nothing in `/admin` could edit them. The SEO panel is rendered by
 * `AdminForm`, which is driven by a `Collection` from `config.ts` — and every
 * collection there is backed by a database table. These pages have no table:
 * their content is `page.tsx` files and `src/data/*`. So they were the one part
 * of the site whose SEO could be set once by the seed migration and never
 * changed again.
 *
 * The list is rendered from `staticPages` rather than from the database rows,
 * which is the important detail. Reading rows alone would show only the pages
 * that already have an override and silently omit the ones that do not — the
 * exact pages most likely to need attention.
 */
type PageRow = {
  entity_slug: string;
  meta_title: string | null;
  meta_description: string | null;
  noindex: boolean | null;
};

export default function StaticPagesSeoPage() {
  const [rows, setRows] = useState<Record<string, PageRow> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: err } = await getSupabase()
        .from('seo_meta')
        .select('entity_slug, meta_title, meta_description, noindex')
        .eq('entity_type', 'page');

      if (cancelled) return;
      if (err) {
        setError(err.message);
        setRows({});
        return;
      }
      setRows(
        Object.fromEntries(
          (data ?? []).map((row) => [String(row.entity_slug), row as PageRow]),
        ),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <AdminPageHeader
        eyebrow="SEO"
        title="Static pages"
        description="Home, About, Work, Services, Pricing, Blog and Contact. These have no content table, so their SEO overrides live only in seo_meta."
      />

      {error ? (
        <p className="mt-6 border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {rows === null ? (
        <div className="mt-8 h-64 animate-pulse border border-line bg-surface" aria-busy />
      ) : (
        <ul className="mt-8 divide-y divide-line border border-line bg-paper">
          {staticPages.map((page) => {
            const row = rows[page.slug];
            const title = row?.meta_title ?? '';
            const description = row?.meta_description ?? '';

            return (
              <li key={page.slug}>
                <Link
                  href={`/admin/seo/pages/${page.slug}`}
                  className="flex flex-wrap items-start gap-x-4 gap-y-2 px-4 py-4 transition-colors hover:bg-subtle"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-ink">{page.label}</span>
                      <span className="font-mono text-xs text-faint">
                        {page.path || '/'}
                      </span>
                      {row?.noindex ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-danger px-2 py-0.5 text-[11px] font-medium text-danger">
                          <AlertTriangle size={11} aria-hidden />
                          Hidden from search
                        </span>
                      ) : null}
                    </div>

                    {/* A blank override is not a gap — it means the page is
                        emitting the template from `src/data/seo.ts`, which is
                        a complete and deliberate title. Saying so is the
                        difference between "unset" and "missing". */}
                    <p className="mt-1 truncate text-xs text-muted">
                      {title || 'Using the generated title'}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-faint">
                      {description || 'Using the generated description'}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
