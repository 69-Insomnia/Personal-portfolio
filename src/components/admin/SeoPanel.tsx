'use client';

import { useState } from 'react';
import { AlertTriangle, Check, Wand2 } from 'lucide-react';
import { inputClass } from './FieldControl';
import { isValidSlug, slugify } from '@/utils/slug';
import { cn } from '@/utils/cn';

/**
 * The Project-Level SEO panel.
 *
 * ## Why this edits two tables
 *
 * The slug lives on the content row (`projects.slug`, and it is that table's
 * primary key). Everything else lives in `seo_meta`, keyed by
 * `(entity_type, entity_slug)`. They are edited in one panel because they are
 * one decision — changing a slug without being able to set the canonical, the
 * OG image and the title in the same breath is how a page gets renamed and
 * loses its search presence in the same commit. `AdminForm` writes both.
 *
 * ## Why the slug does not follow the title on an existing row
 *
 * On a new row the slug tracks the title as you type, which is what "auto-
 * generated" should mean. On an existing row it does not, and that is
 * deliberate: `on_slug_change` in the migrations logs a 301 whenever a slug
 * changes, so silently rewriting `drillthru` to `drill-thru` because someone
 * fixed a typo in the title would create a permanent redirect for a live,
 * ranking URL. The lock is per-session, not stored — typing in the slug field
 * unlocks it either way.
 *
 * ## Character limits
 *
 * The title counter warns past 60 and the description past 155, which are the
 * widths Google actually truncates at. Below the minimum they go amber rather
 * than red: a short title wastes space but does not break anything, and
 * colouring it as an error would make the genuinely-too-long state less
 * visible. `clampDescription` in `src/utils/metadata.ts` trims at 158 on the
 * way out, so 155 is the warning line rather than the hard limit.
 */

export const TITLE_MIN = 30;
export const TITLE_MAX = 60;
export const DESC_MIN = 120;
export const DESC_MAX = 155;

export interface SeoFormValues {
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  keywords: string[];
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  canonical_override: string;
  noindex: boolean;
  nofollow: boolean;
  /**
   * Held as a string, not an object. A textarea edits text, and round-tripping
   * through `JSON.parse`/`JSON.stringify` on every keystroke would reformat
   * what the user is typing and move their cursor.
   */
  custom_json_ld: string;
}

export function emptySeoValues(): SeoFormValues {
  return {
    meta_title: '',
    meta_description: '',
    focus_keyword: '',
    keywords: [],
    og_title: '',
    og_description: '',
    og_image: '',
    twitter_title: '',
    twitter_description: '',
    twitter_image: '',
    canonical_override: '',
    noindex: false,
    nofollow: false,
    custom_json_ld: '',
  };
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

/** Hydrates the form from a `seo_meta` row, or from nothing for a new entity. */
export function seoValuesFromRow(row: Record<string, unknown> | null): SeoFormValues {
  if (!row) return emptySeoValues();
  const keywords = Array.isArray(row.keywords)
    ? row.keywords.filter((k): k is string => typeof k === 'string')
    : [];

  return {
    meta_title: str(row.meta_title),
    meta_description: str(row.meta_description),
    focus_keyword: str(row.focus_keyword),
    keywords,
    og_title: str(row.og_title),
    og_description: str(row.og_description),
    og_image: str(row.og_image),
    twitter_title: str(row.twitter_title),
    twitter_description: str(row.twitter_description),
    twitter_image: str(row.twitter_image),
    canonical_override: str(row.canonical_override),
    noindex: row.noindex === true,
    nofollow: row.nofollow === true,
    // Pretty-printed so a pasted blob is readable. Absent rather than `null`
    // in the textarea, because "no custom JSON-LD" and "the JSON null" should
    // not look the same to the person editing this.
    custom_json_ld: row.custom_json_ld
      ? JSON.stringify(row.custom_json_ld, null, 2)
      : '',
  };
}

/**
 * Converts the form back to a `seo_meta` row.
 *
 * Blank strings become `null`, not `''`. The merge in `src/data/seo.ts` treats
 * `undefined`/`null` as "inherit the template", and an empty string would
 * short-circuit that and emit an empty `<title>`. `getSeo` normalises blanks
 * on the way in for the same reason — this is the other half of that contract.
 */
export function seoRowFromValues(
  values: SeoFormValues,
  entityType: string,
  entitySlug: string,
): Record<string, unknown> {
  const nullable = (value: string) => {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  };

  return {
    entity_type: entityType,
    entity_slug: entitySlug,
    meta_title: nullable(values.meta_title),
    meta_description: nullable(values.meta_description),
    focus_keyword: nullable(values.focus_keyword),
    keywords: values.keywords.map((k) => k.trim()).filter(Boolean),
    og_title: nullable(values.og_title),
    og_description: nullable(values.og_description),
    og_image: nullable(values.og_image),
    twitter_title: nullable(values.twitter_title),
    twitter_description: nullable(values.twitter_description),
    twitter_image: nullable(values.twitter_image),
    canonical_override: nullable(values.canonical_override),
    noindex: values.noindex,
    nofollow: values.nofollow,
    custom_json_ld: parseCustomJsonLd(values.custom_json_ld).value,
  };
}

/**
 * Parses the custom JSON-LD field.
 *
 * Returns `{ value, error }` rather than throwing, because this runs on every
 * save and a thrown error inside a save handler is a blank screen rather than
 * a message beside the field. The column is `jsonb`, so the database would
 * reject malformed JSON too — but it would reject it as an opaque Postgres
 * error after the content row had already been written, leaving the two tables
 * disagreeing about whether the save succeeded.
 *
 * An array is accepted as well as an object, matching the check constraint.
 * Anything else (`"a string"`, `42`, `true`) is valid JSON and would corrupt
 * the `@graph`, so it is rejected here as well as in the database.
 */
export function parseCustomJsonLd(raw: string): {
  value: unknown;
  error?: string;
} {
  const trimmed = raw.trim();
  if (trimmed === '') return { value: null };

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (e) {
    return { value: null, error: e instanceof Error ? e.message : 'Invalid JSON' };
  }

  const ok =
    parsed !== null &&
    typeof parsed === 'object' &&
    !Array.isArray(parsed)
      ? true
      : Array.isArray(parsed) && parsed.every((n) => n !== null && typeof n === 'object');

  if (!ok) {
    return {
      value: null,
      error: 'Must be a JSON object, or an array of objects. A bare value cannot be a schema node.',
    };
  }

  return { value: parsed };
}

/** Validation for the whole panel. Returns a map of field name to message. */
export function seoErrors(
  values: SeoFormValues,
  slug: string,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!isValidSlug(slug)) {
    errors.slug =
      'Lowercase letters, numbers and hyphens only, no leading or trailing slash.';
  }
  if (values.meta_title.length > TITLE_MAX) {
    errors.meta_title = `${values.meta_title.length} characters — Google truncates past ${TITLE_MAX}.`;
  }
  if (values.meta_description.length > DESC_MAX) {
    errors.meta_description = `${values.meta_description.length} characters — Google truncates past ${DESC_MAX}.`;
  }
  if (
    values.canonical_override.trim() !== '' &&
    !/^https?:\/\//.test(values.canonical_override.trim())
  ) {
    errors.canonical_override =
      'Must be an absolute URL starting with http:// or https://. A relative value resolves against the current page and is worse than no canonical at all.';
  }

  const jsonLd = parseCustomJsonLd(values.custom_json_ld);
  if (jsonLd.error) errors.custom_json_ld = jsonLd.error;

  return errors;
}

// ------------------------------------------------------------- components ---

/**
 * A character counter that reads as a bar rather than a number.
 *
 * The bar is the point: "163 / 155" requires the reader to do the comparison,
 * and a bar shows it. The number is still there underneath for the cases where
 * the exact count matters.
 */
function CharMeter({
  value,
  min,
  max,
  id,
}: {
  value: string;
  min: number;
  max: number;
  id: string;
}) {
  const length = value.length;
  const state: 'empty' | 'short' | 'good' | 'long' =
    length === 0 ? 'empty' : length > max ? 'long' : length < min ? 'short' : 'good';

  const bar = {
    empty: 'bg-line',
    short: 'bg-info',
    good: 'bg-success',
    long: 'bg-danger',
  }[state];

  const text = {
    empty: 'text-muted',
    short: 'text-info',
    good: 'text-success',
    long: 'text-danger',
  }[state];

  const note = {
    empty: `Target ${min}–${max}`,
    short: `${min - length} short of the minimum`,
    good: 'Good length',
    long: `${length - max} over the limit`,
  }[state];

  const percent = Math.min(100, (length / max) * 100);

  return (
    <div className="mt-2">
      <div className="h-1 w-full overflow-hidden rounded-full bg-line" aria-hidden>
        <div
          className={cn('h-full transition-all duration-200', bar)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p id={id} className={cn('mt-1.5 flex items-center gap-1.5 text-xs', text)}>
        {state === 'long' ? (
          <AlertTriangle size={12} aria-hidden />
        ) : state === 'good' ? (
          <Check size={12} aria-hidden />
        ) : null}
        <span>
          {length} / {max} — {note}
        </span>
      </p>
    </div>
  );
}

/**
 * A Google result as it will actually be rendered.
 *
 * Deliberately truncated at the real limits rather than showing the full
 * string. The whole value of a preview is showing the person what is cut off,
 * and a preview that shows everything is a preview that hides the only problem
 * it exists to reveal.
 */
function SerpPreview({
  title,
  description,
  path,
  mobile,
}: {
  title: string;
  description: string;
  path: string;
  mobile?: boolean;
}) {
  const shownTitle = title.length > TITLE_MAX ? `${title.slice(0, TITLE_MAX - 1)}…` : title;
  const shownDescription =
    description.length > DESC_MAX ? `${description.slice(0, DESC_MAX - 1)}…` : description;

  return (
    <div
      className={cn(
        'rounded-card border border-line bg-paper p-4',
        mobile && 'max-w-[22rem]',
      )}
    >
      <div className="flex items-center gap-2">
        <span aria-hidden className="h-6 w-6 rounded-full bg-line" />
        <div className="min-w-0">
          <p className="truncate text-xs text-ink">Dipendra Guragain</p>
          <p className="truncate text-xs text-muted">{path}</p>
        </div>
      </div>
      <p className={cn('mt-2 text-[#1a0dab]', mobile ? 'text-base' : 'text-lg')}>
        {shownTitle || <span className="text-muted">No title set — the template will be used</span>}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        {shownDescription || 'No description set — the template will be used.'}
      </p>
    </div>
  );
}

/** The share card, which has different limits and a different job to the SERP. */
function SocialPreview({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <div className="rounded-card overflow-hidden border border-line bg-paper">
      <div className="flex h-40 items-center justify-center border-b border-line bg-subtle">
        {image ? (
          // A plain <img>, not next/image: this is an arbitrary admin-entered
          // URL that has not been added to next.config's remotePatterns, and
          // routing it through the optimiser would throw at runtime for any
          // host not on that list.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-muted">No image — the site default is used</span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs uppercase tracking-wide text-muted">dipendraguragain.tech</p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-ink">
          {title || 'No title set'}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
          {description || 'No description set'}
        </p>
      </div>
    </div>
  );
}

function Toggle({
  label,
  help,
  checked,
  onChange,
}: {
  label: string;
  help: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full border px-0.5 transition-colors duration-300',
          checked ? 'border-danger bg-danger' : 'border-line-strong bg-surface',
        )}
      >
        <span
          className={cn(
            'h-4.5 w-4.5 rounded-full bg-paper shadow-sm transition-transform duration-300',
            checked && 'translate-x-5',
          )}
        />
        <span className="sr-only">{label}</span>
      </button>
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{help}</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line pt-5">
      <h3 className="text-label font-medium uppercase text-muted">{title}</h3>
      <div className="mt-4 grid gap-4">{children}</div>
    </div>
  );
}

interface SeoPanelProps {
  values: SeoFormValues;
  onChange: (next: SeoFormValues) => void;
  slug: string;
  onSlugChange: (next: string) => void;
  /** The row's title, which seeds the slug generator and the previews. */
  titleSource: string;
  /** What the site would emit if the fields above were left blank. */
  fallbackTitle: string;
  fallbackDescription: string;
  /** e.g. `https://dipendraguragain.tech/work`. */
  canonicalBase: string;
  entityLabel: string;
  errors: Record<string, string>;
  disabled?: boolean;
}

export function SeoPanel({
  values,
  onChange,
  slug,
  onSlugChange,
  titleSource,
  fallbackTitle,
  fallbackDescription,
  canonicalBase,
  entityLabel,
  errors,
  disabled,
}: SeoPanelProps) {
  /**
   * Locked when the entity already has a slug. See the module note: following
   * the title here would rename a live URL and log a 301 for a typo fix.
   */
  const [slugLocked, setSlugLocked] = useState(slug !== '');

  const set = <K extends keyof SeoFormValues>(key: K, value: SeoFormValues[K]) =>
    onChange({ ...values, [key]: value });

  const onTitleSourceChange = (next: string) => {
    if (slugLocked || disabled) return;
    onSlugChange(slugify(next));
  };

  const effectiveTitle = values.meta_title || fallbackTitle;
  const effectiveDescription = values.meta_description || fallbackDescription;
  const effectivePath = `${canonicalBase}${slug ? `/${slug}` : ''}`;
  const canonicalPlaceholder = effectivePath;

  return (
    <div className="grid gap-6 border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{entityLabel} SEO settings</p>
          <p className="mt-0.5 text-xs text-muted">
            What Google and social platforms show for this page. Leave a field blank to
            use the generated default.
          </p>
        </div>
        {values.noindex ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-danger px-2.5 py-1 text-xs font-medium text-danger">
            <AlertTriangle size={12} aria-hidden />
            Hidden from search
          </span>
        ) : null}
      </div>

      {/* ---------------------------------------------------------- slug --- */}
      <Section title="URL">
        <div>
          <label
            htmlFor="seo-slug"
            className="text-label font-medium uppercase text-muted"
          >
            Custom URL slug
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="seo-slug"
              type="text"
              value={slug}
              disabled={disabled}
              onChange={(event) => {
                setSlugLocked(true);
                onSlugChange(event.target.value);
              }}
              className={cn(inputClass, 'font-mono', errors.slug && 'border-danger')}
            />
            <button
              type="button"
              disabled={disabled || titleSource.trim() === ''}
              onClick={() => {
                setSlugLocked(false);
                onSlugChange(slugify(titleSource));
              }}
              className="inline-flex shrink-0 items-center gap-1.5 border border-line px-3 text-xs font-medium text-muted transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
            >
              <Wand2 size={13} aria-hidden />
              From title
            </button>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            {canonicalBase}/{slug || '…'}
            {slugLocked
              ? ' — locked to the existing URL. Editing this logs a 301 redirect from the old address.'
              : ' — follows the title until you type here.'}
          </p>
          {errors.slug ? (
            <p className="mt-1.5 text-xs font-medium text-danger">{errors.slug}</p>
          ) : null}
        </div>
      </Section>

      {/* -------------------------------------------------------- search --- */}
      <Section title="Search result">
        <div>
          <label
            htmlFor="seo-meta-title"
            className="text-label font-medium uppercase text-muted"
          >
            Meta title
          </label>
          <input
            id="seo-meta-title"
            type="text"
            value={values.meta_title}
            disabled={disabled}
            placeholder={fallbackTitle}
            onChange={(event) => set('meta_title', event.target.value)}
            className={cn(
              'mt-2',
              inputClass,
              errors.meta_title && 'border-danger',
            )}
          />
          <CharMeter
            id="seo-meta-title-meter"
            value={values.meta_title}
            min={TITLE_MIN}
            max={TITLE_MAX}
          />
          {errors.meta_title ? (
            <p className="mt-1.5 text-xs font-medium text-danger">{errors.meta_title}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="seo-meta-description"
            className="text-label font-medium uppercase text-muted"
          >
            Meta description
          </label>
          <textarea
            id="seo-meta-description"
            rows={3}
            value={values.meta_description}
            disabled={disabled}
            placeholder={fallbackDescription}
            onChange={(event) => set('meta_description', event.target.value)}
            className={cn(
              'mt-2 resize-y',
              inputClass,
              errors.meta_description && 'border-danger',
            )}
          />
          <CharMeter
            id="seo-meta-description-meter"
            value={values.meta_description}
            min={DESC_MIN}
            max={DESC_MAX}
          />
          {errors.meta_description ? (
            <p className="mt-1.5 text-xs font-medium text-danger">
              {errors.meta_description}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium text-muted">Desktop</p>
            <SerpPreview
              title={effectiveTitle}
              description={effectiveDescription}
              path={effectivePath.replace(/^https?:\/\//, '')}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted">Mobile</p>
            <SerpPreview
              title={effectiveTitle}
              description={effectiveDescription}
              path={effectivePath.replace(/^https?:\/\//, '').replace(/^[^/]+/, '')}
              mobile
            />
          </div>
        </div>
      </Section>

      {/* -------------------------------------------------------- social --- */}
      <Section title="Social sharing">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-4">
            <div>
              <label
                htmlFor="seo-og-image"
                className="text-label font-medium uppercase text-muted"
              >
                OG image URL
              </label>
              <input
                id="seo-og-image"
                type="text"
                value={values.og_image}
                disabled={disabled}
                placeholder="/og-image.png or an absolute URL"
                onChange={(event) => set('og_image', event.target.value)}
                className={cn('mt-2', inputClass)}
              />
            </div>
            <div>
              <label
                htmlFor="seo-og-title"
                className="text-label font-medium uppercase text-muted"
              >
                OG title
              </label>
              <input
                id="seo-og-title"
                type="text"
                value={values.og_title}
                disabled={disabled}
                placeholder="Falls back to the meta title"
                onChange={(event) => set('og_title', event.target.value)}
                className={cn('mt-2', inputClass)}
              />
            </div>
            <div>
              <label
                htmlFor="seo-og-description"
                className="text-label font-medium uppercase text-muted"
              >
                OG description
              </label>
              <textarea
                id="seo-og-description"
                rows={2}
                value={values.og_description}
                disabled={disabled}
                placeholder="Falls back to the meta description"
                onChange={(event) => set('og_description', event.target.value)}
                className={cn('mt-2 resize-y', inputClass)}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted">Share preview</p>
            <SocialPreview
              title={values.og_title || effectiveTitle}
              description={values.og_description || effectiveDescription}
              image={values.og_image}
            />
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------- canonical --- */}
      <Section title="Canonical">
        <div>
          <label
            htmlFor="seo-canonical"
            className="text-label font-medium uppercase text-muted"
          >
            Canonical URL override
          </label>
          <input
            id="seo-canonical"
            type="text"
            value={values.canonical_override}
            disabled={disabled}
            placeholder={canonicalPlaceholder}
            onChange={(event) => set('canonical_override', event.target.value)}
            className={cn(
              'mt-2',
              inputClass,
              errors.canonical_override && 'border-danger',
            )}
          />
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            Only set this if the same work was published somewhere else first. Pointing it
            at another domain removes this page from the sitemap and hands the ranking to
            that URL.
          </p>
          {errors.canonical_override ? (
            <p className="mt-1.5 text-xs font-medium text-danger">
              {errors.canonical_override}
            </p>
          ) : null}
        </div>
      </Section>

      {/* ------------------------------------------------------- indexing --- */}
      <Section title="Indexing">
        <Toggle
          label="Hide from search engines"
          help="Adds noindex, nofollow. Use for drafts and placeholder content. The page is also removed from sitemap.xml."
          checked={values.noindex}
          onChange={(next) => onChange({ ...values, noindex: next, nofollow: next })}
        />
      </Section>

      {/* -------------------------------------------------------- json-ld --- */}
      <Section title="Custom JSON-LD">
        <div>
          <label
            htmlFor="seo-json-ld"
            className="text-label font-medium uppercase text-muted"
          >
            Additional structured data
          </label>
          <textarea
            id="seo-json-ld"
            rows={6}
            value={values.custom_json_ld}
            disabled={disabled}
            placeholder={'{\n  "@type": "CreativeWork",\n  "award": "…"\n}'}
            onChange={(event) => set('custom_json_ld', event.target.value)}
            className={cn(
              'mt-2 resize-y font-mono text-[13px]',
              inputClass,
              errors.custom_json_ld && 'border-danger',
            )}
          />
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            A JSON object, or an array of them. Merged into this page&rsquo;s
            <code className="mx-1 font-mono">@graph</code>
            alongside the generated nodes, which are kept as they are.
          </p>
          {errors.custom_json_ld ? (
            <p className="mt-1.5 text-xs font-medium text-danger">
              {errors.custom_json_ld}
            </p>
          ) : null}
        </div>
      </Section>
    </div>
  );
}
