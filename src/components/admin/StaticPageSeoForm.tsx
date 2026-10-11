'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ExternalLink, LoaderCircle, Save } from 'lucide-react';
import { getSupabase } from '@/lib/supabase-browser';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  SeoPanel,
  emptySeoValues,
  seoErrors,
  seoRowFromValues,
  seoValuesFromRow,
  type SeoFormValues,
} from '@/components/admin/SeoPanel';
import {
  aboutSEO,
  blogSEO,
  contactSEO,
  homeSEO,
  pricingSEO,
  servicesSEO,
  site,
  workSEO,
} from '@/data/seo';
import type { StaticPage } from '@/data/static-pages';
import type { SEOData } from '@/types';

/**
 * The SEO panel for a page that has no content table.
 *
 * ## How this differs from `AdminForm`
 *
 * `AdminForm` edits a row and then a `seo_meta` row, in that order, and it
 * does so because the content row is the thing that exists — the SEO overrides
 * hang off it. A static page has no such row. Its content is a `page.tsx` file,
 * so this writes `seo_meta` and nothing else.
 *
 * The other difference is that the slug is not editable and not shown, for the
 * reason documented on `SeoPanel.hideSlug`: on these pages `entity_slug` is a
 * stable key rather than a URL, and editing it would orphan the row instead of
 * renaming a page.
 *
 * ## The empty slug
 *
 * `SeoPanel` builds its canonical preview as `canonicalBase` + `/${slug}`, so
 * the slug it is given is the segment appended to a base. A static page appends
 * nothing — its path *is* its address. So the slug passed here is empty and
 * `canonicalBase` is the complete URL, which makes the preview come out right:
 * `https://dipendraguragain.tech/pricing`, not `.../pricing/pricing`.
 *
 * That is also why `seoErrors` needs `skipSlug` here — the empty string is not
 * a valid slug and would otherwise fail validation on every save.
 *
 * ## The templates are the real ones
 *
 * `fallbackTitle` and `fallbackDescription` come from the exported `SEOData`
 * constants in `src/data/seo.ts`, which are exactly what these pages emit when
 * the fields are left blank. Restating them here would give the panel a preview
 * that drifts from the site — the same reasoning `SeoConfig.fallback` documents
 * for the collection panels.
 */
const TEMPLATES: Record<string, SEOData | undefined> = {
  home: homeSEO,
  about: aboutSEO,
  work: workSEO,
  services: servicesSEO,
  pricing: pricingSEO,
  blog: blogSEO,
  contact: contactSEO,
};

export function StaticPageSeoForm({ page }: { page: StaticPage }) {
  const [values, setValues] = useState<SeoFormValues | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: err } = await getSupabase()
        .from('seo_meta')
        .select('*')
        .eq('entity_type', 'page')
        .eq('entity_slug', page.slug)
        .maybeSingle();

      if (cancelled) return;
      // A missing row is the normal case for a page nobody has configured, not
      // a failure — `seoValuesFromRow(null)` returns the blank defaults, and
      // the panel then shows the generated template as its placeholder.
      if (err) {
        setError(err.message);
        setValues(emptySeoValues());
        return;
      }
      setValues(seoValuesFromRow((data as Record<string, unknown> | null) ?? null));
    })();
    return () => {
      cancelled = true;
    };
  }, [page.slug]);

  const template = TEMPLATES[page.slug];
  const canonical = `${site.url}${page.path}`;

  const save = async () => {
    if (!values) return;

    const nextErrors = seoErrors(values, '', { skipSlug: true });
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    const { error: err } = await getSupabase()
      .from('seo_meta')
      .upsert(seoRowFromValues(values, 'page', page.slug), {
        onConflict: 'entity_type,entity_slug',
      });

    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSaved(true);
  };

  if (!values) {
    return (
      <div>
        <AdminPageHeader eyebrow="Static pages" title={page.label} />
        <div className="mt-8 h-64 animate-pulse border border-line bg-surface" aria-busy />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        eyebrow="Static pages"
        title={page.label}
        description={page.path || '/'}
        actions={
          <Link
            href="/admin/seo/pages"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={14} aria-hidden />
            All pages
          </Link>
        }
      />

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        Leave a field blank to use the page&rsquo;s generated title and description.
        Clearing a field reverts your change rather than breaking anything.
      </p>

      {error ? (
        <p className="mt-6 border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="mt-6 flex items-center gap-2 border border-success bg-success/5 px-4 py-3 text-sm text-success">
          <Check size={15} aria-hidden />
          Saved. The page updates within a few minutes as the cache revalidates.
        </p>
      ) : null}

      <div className="mt-8">
        <SeoPanel
          values={values}
          onChange={setValues}
          slug=""
          onSlugChange={() => {}}
          hideSlug
          titleSource={page.label}
          fallbackTitle={template?.title ?? ''}
          fallbackDescription={template?.description ?? ''}
          canonicalBase={canonical}
          entityLabel={page.label}
          errors={fieldErrors}
          disabled={saving}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle size={15} className="animate-spin" aria-hidden />
          ) : (
            <Save size={15} aria-hidden />
          )}
          Save changes
        </button>
        <a
          href={page.path || '/'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
        >
          View page
          <ExternalLink size={13} aria-hidden />
        </a>
      </div>
    </div>
  );
}
