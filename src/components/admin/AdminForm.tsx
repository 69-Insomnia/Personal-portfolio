'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';
import { getSupabase } from '@/lib/supabase-browser';
import { FieldControl } from './FieldControl';
import { AdminPageHeader } from './AdminPageHeader';
import {
  SeoPanel,
  emptySeoValues,
  seoErrors,
  seoRowFromValues,
  seoValuesFromRow,
  type SeoFormValues,
} from './SeoPanel';
import type { Collection } from './config';
import { site } from '@/data/seo';

type Values = Record<string, unknown>;
type Errors = Partial<Record<string, string>>;

export function AdminForm({ collection, id }: { collection: Collection; id: string | null }) {
  const router = useRouter();
  const isNew = id === null;
  const [values, setValues] = useState<Values>(() =>
    isNew ? { ...collection.defaults } : (null as unknown as Values),
  );

  /**
   * The primary key as it was when the row loaded — the update targets this,
   * not the current value.
   *
   * The pk is editable for the three collections with a `seo` config, because
   * that is how a slug gets renamed. `.eq(pk, editedValue)` would match no row,
   * and Supabase reports that as success with zero rows affected — so the admin
   * would see "saved", the page would not change, and the mistake would look
   * like a caching problem.
   */
  const [originalPk, setOriginalPk] = useState<string | null>(id);
  const [seoValues, setSeoValues] = useState<SeoFormValues>(emptySeoValues);
  const [seoFieldErrors, setSeoFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) {
      setValues({ ...collection.defaults });
      setSeoValues(emptySeoValues());
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from(collection.table)
        .select('*')
        .eq(collection.pk, id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setLoading(false);
        setNotFound(true);
        return;
      }

      // The SEO row is a second read, and its absence is the normal case for
      // an entity nobody has set SEO for — not an error, and not a reason to
      // fail the form. `seoValuesFromRow(null)` returns the blank defaults.
      let seoRow: Record<string, unknown> | null = null;
      if (collection.seo) {
        const { data: seo } = await supabase
          .from('seo_meta')
          .select('*')
          .eq('entity_type', collection.seo.entityType)
          .eq('entity_slug', id)
          .maybeSingle();
        seoRow = (seo as Record<string, unknown> | null) ?? null;
      }
      if (cancelled) return;

      setValues(data as Values);
      setSeoValues(seoValuesFromRow(seoRow));
      setOriginalPk(id);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [collection, id, isNew]);

  const set = (name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const save = async () => {
    const nextErrors: Errors = {};
    for (const field of collection.fields) {
      if (!field.required || field.type === 'seo') continue;
      const value = values[field.name];
      const empty =
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '');
      if (empty) nextErrors[field.name] = 'Required.';
    }
    setErrors(nextErrors);

    const slug = String(values[collection.pk] ?? '');
    const nextSeoErrors = collection.seo ? seoErrors(seoValues, slug) : {};
    setSeoFieldErrors(nextSeoErrors);

    /**
     * Everything is validated before anything is written.
     *
     * The content row and the `seo_meta` row are two tables. A validation
     * failure caught after the first write would leave them disagreeing about
     * whether the save happened — and for a slug change, the 301 would already
     * have been logged.
     */
    if (Object.keys(nextErrors).length > 0 || Object.keys(nextSeoErrors).length > 0) {
      return;
    }

    setSaving(true);
    setSaveError(null);

    const row: Values = {};
    for (const field of collection.fields) {
      if (field.type === 'seo') continue;
      const value = values[field.name];
      if (value === undefined) continue;
      if (typeof value === 'string' && field.type !== 'paragraphs') {
        row[field.name] = value.trim();
      } else {
        row[field.name] = value;
      }
    }

    try {
      const supabase = getSupabase();
      if (isNew) {
        const { error } = await supabase.from(collection.table).insert(row);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from(collection.table)
          .update(row)
          .eq(collection.pk, String(originalPk));
        if (error) throw new Error(error.message);
      }

      /**
       * The content row is written first, deliberately.
       *
       * When the slug changed, `on_slug_change` has already moved the existing
       * `seo_meta` row to the new slug and logged the 301 by the time this
       * runs — so this upsert updates that row rather than creating a second
       * one against a slug that no longer exists. Reversed, the insert would
       * land under the new slug first and the trigger would then find nothing
       * to move, orphaning the original row.
       */
      if (collection.seo) {
        const { error } = await supabase
          .from('seo_meta')
          .upsert(seoRowFromValues(seoValues, collection.seo.entityType, slug), {
            onConflict: 'entity_type,entity_slug',
          });
        if (error) throw new Error(error.message);
      }

      router.push(`/admin/${collection.key}`);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed');
      setSaving(false);
    }
  };

  if (notFound) {
    return (
      <div>
        <AdminPageHeader
          eyebrow={collection.label}
          title="Not found"
          actions={<BackLink collection={collection} />}
        />
        <p className="mt-6 text-sm text-muted">
          No {collection.singular.toLowerCase()} with id <code className="font-mono">{id}</code>.
        </p>
      </div>
    );
  }

  const slug = String(values?.[collection.pk] ?? '');
  const fallback = collection.seo ? collection.seo.fallback(values ?? {}) : null;

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        eyebrow={collection.label}
        title={
          isNew
            ? `New ${collection.singular.toLowerCase()}`
            : `Edit ${collection.singular.toLowerCase()}`
        }
        actions={<BackLink collection={collection} />}
      />

      {saveError ? (
        <p className="mt-6 border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">
          {saveError}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-8 h-64 animate-pulse border border-line bg-surface" aria-busy />
      ) : (
        <form
          className="mt-8 grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          {collection.fields.map((field) => {
            if (field.type === 'seo') {
              if (!collection.seo || !fallback) return null;
              return (
                <SeoPanel
                  key={field.name}
                  values={seoValues}
                  onChange={setSeoValues}
                  slug={slug}
                  onSlugChange={(next) => set(collection.pk, next)}
                  titleSource={String(values?.[collection.seo.titleField] ?? '')}
                  fallbackTitle={fallback.title}
                  fallbackDescription={fallback.description}
                  canonicalBase={`${site.url}/${collection.seo.pathPrefix}`}
                  entityLabel={collection.singular}
                  errors={seoFieldErrors}
                  disabled={saving}
                />
              );
            }

            /**
             * The SEO panel owns the slug, so the pk field is not rendered
             * separately — two inputs bound to one value is two places to look
             * and one of them is always stale.
             *
             * Only skipped when a `seo` config exists. For `experience` and
             * `testimonials` the pk is a plain id with no SEO panel and it must
             * keep rendering read-only while editing.
             */
            if (collection.seo && field.pk) return null;

            return (
              <FieldControl
                key={field.name}
                field={field}
                value={values?.[field.name]}
                error={errors[field.name]}
                disabled={saving || (field.pk === true && !isNew)}
                onChange={(value) => set(field.name, value)}
              />
            );
          })}

          <div className="mt-2 flex items-center gap-3 border-t border-line pt-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-60"
            >
              {saving ? <LoaderCircle size={15} className="animate-spin" aria-hidden /> : <Save size={15} aria-hidden />}
              {isNew ? 'Create' : 'Save changes'}
            </button>
            <Link
              href={`/admin/${collection.key}`}
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

function BackLink({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/admin/${collection.key}`}
      className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
    >
      <ArrowLeft size={14} aria-hidden />
      All {collection.label.toLowerCase()}
    </Link>
  );
}
