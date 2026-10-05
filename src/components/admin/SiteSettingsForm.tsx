'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Check, LoaderCircle, Save } from 'lucide-react';
import { getSupabase } from '@/lib/supabase-browser';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { inputClass } from '@/components/admin/FieldControl';
import { cn } from '@/utils/cn';

/**
 * The Global SEO panel — the `site_settings` singleton.
 *
 * ## The one dangerous field on this page
 *
 * `robots_txt` is a raw text editor for a file that can remove the entire site
 * from Google. A single unscoped `Disallow: /` deindexes everything, and it
 * takes effect the next time a crawler reads the file — often within minutes,
 * and with no undo beyond restoring the text. So the field carries a live
 * warning that fires on exactly that pattern, and the save button asks for
 * confirmation when it is present. That is not ceremony: it is the one edit
 * here whose mistake is expensive and fast, and the person making it will be
 * typing into a textarea that looks like every other textarea.
 *
 * ## Why every field is allowed to be blank
 *
 * Blank means "inherit the repo value" — `defaultSEO.title`,
 * `DEFAULT_OG_IMAGE`, `profile.socialLinks`. Clearing a field here is
 * therefore a way to revert a change, not a way to break the site, which is
 * what makes this panel safe to experiment in.
 */

/** The platforms the site already declares in `SocialLinks`. */
const SOCIAL_PLATFORMS = [
  'linkedin',
  'github',
  'facebook',
  'instagram',
  'youtube',
  'x',
  'tiktok',
] as const;

interface SettingsRow {
  title_suffix: string;
  default_meta_title: string;
  default_meta_description: string;
  default_og_image: string;
  person_job_title: string;
  person_knows_about: string[];
  social_links: Record<string, string>;
  ga4_measurement_id: string;
  gtm_container_id: string;
  meta_pixel_id: string;
  google_site_verification: string;
  bing_site_verification: string;
  robots_txt: string;
}

const EMPTY: SettingsRow = {
  title_suffix: '',
  default_meta_title: '',
  default_meta_description: '',
  default_og_image: '',
  person_job_title: '',
  person_knows_about: [],
  social_links: {},
  ga4_measurement_id: '',
  gtm_container_id: '',
  meta_pixel_id: '',
  google_site_verification: '',
  bing_site_verification: '',
  robots_txt: '',
};

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

function fromRow(row: Record<string, unknown>): SettingsRow {
  const social = row.social_links;
  return {
    title_suffix: str(row.title_suffix),
    default_meta_title: str(row.default_meta_title),
    default_meta_description: str(row.default_meta_description),
    default_og_image: str(row.default_og_image),
    person_job_title: str(row.person_job_title),
    person_knows_about: Array.isArray(row.person_knows_about)
      ? row.person_knows_about.filter((k): k is string => typeof k === 'string')
      : [],
    social_links:
      social && typeof social === 'object' && !Array.isArray(social)
        ? Object.fromEntries(
            Object.entries(social as Record<string, unknown>)
              .filter((e): e is [string, string] => typeof e[1] === 'string')
              .map(([k, v]) => [k, v]),
          )
        : {},
    ga4_measurement_id: str(row.ga4_measurement_id),
    gtm_container_id: str(row.gtm_container_id),
    meta_pixel_id: str(row.meta_pixel_id),
    google_site_verification: str(row.google_site_verification),
    bing_site_verification: str(row.bing_site_verification),
    robots_txt: str(row.robots_txt),
  };
}

/**
 * Detects the robots.txt edit that would deindex the whole site.
 *
 * Matches a `Disallow: /` that is not the `/admin` variant, for any user-agent
 * block. It is a warning and not a block, because blocking it outright would
 * make a legitimate (if rare) full-site deindex — a staging setup, a
 * pre-launch lockdown — impossible to express.
 */
function robotsDanger(text: string): string | null {
  const lines = text.split('\n').map((l) => l.trim());
  const offenders = lines.filter((line) => /^disallow:\s*\/\s*$/i.test(line));
  if (offenders.length === 0) return null;

  const agent = lines.some((l) => l.toLowerCase() === 'user-agent: *');
  return agent
    ? 'This disallows every crawler from the entire site. Google will drop it from the index.'
    : 'A `Disallow: /` rule is present. Check which crawler it applies to.';
}

function Field({
  id,
  label,
  help,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-label font-medium uppercase text-muted">
        {label}
      </label>
      {children}
      {help ? <p className="mt-1.5 text-xs leading-relaxed text-muted">{help}</p> : null}
    </div>
  );
}

export function SiteSettingsForm() {
  const [values, setValues] = useState<SettingsRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data, error: err } = await getSupabase()
        .from('site_settings')
        .select('*')
        .eq('id', true)
        .maybeSingle();
      if (err) {
        setError(err.message);
        setValues(EMPTY);
        return;
      }
      setValues(data ? fromRow(data as Record<string, unknown>) : EMPTY);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load settings');
      setValues(EMPTY);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const set = <K extends keyof SettingsRow>(key: K, value: SettingsRow[K]) => {
    setValues((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  };

  const danger = values ? robotsDanger(values.robots_txt) : null;

  const save = async () => {
    if (!values) return;

    if (danger && !window.confirm(`${danger}\n\nSave anyway?`)) return;

    setSaving(true);
    setError(null);
    const { error: err } = await getSupabase()
      .from('site_settings')
      .upsert(
        {
          id: true,
          title_suffix: values.title_suffix,
          default_meta_title: values.default_meta_title,
          default_meta_description: values.default_meta_description,
          default_og_image: values.default_og_image,
          person_job_title: values.person_job_title,
          person_knows_about: values.person_knows_about,
          // Empty strings are dropped rather than stored, so a cleared field
          // falls back to the repo value instead of emitting an empty sameAs
          // entry — which is worse than omitting the property.
          social_links: Object.fromEntries(
            Object.entries(values.social_links)
              .map(([k, v]) => [k, v.trim()])
              .filter(([, v]) => v !== ''),
          ),
          ga4_measurement_id: values.ga4_measurement_id,
          gtm_container_id: values.gtm_container_id,
          meta_pixel_id: values.meta_pixel_id,
          google_site_verification: values.google_site_verification,
          bing_site_verification: values.bing_site_verification,
          robots_txt: values.robots_txt.trim() === '' ? null : values.robots_txt,
        },
        { onConflict: 'id' },
      );
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
        <AdminPageHeader eyebrow="seo" title="Global SEO settings" />
        <div className="mt-8 h-64 animate-pulse border border-line bg-surface" aria-busy />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        eyebrow="seo"
        title="Global SEO settings"
        actions={
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle size={15} className="animate-spin" aria-hidden />
            ) : (
              <Save size={15} aria-hidden />
            )}
            Save
          </button>
        }
      />

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        Site-wide defaults. Every field can be left blank — a blank field falls back to
        the value built into the site, so clearing one reverts your change rather than
        breaking anything.
      </p>

      {error ? (
        <p className="mt-6 border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="mt-6 flex items-center gap-2 border border-success bg-success/5 px-4 py-3 text-sm text-success">
          <Check size={15} aria-hidden />
          Saved. Changes appear within a few minutes as the cache revalidates.
        </p>
      ) : null}

      {/* --------------------------------------------------------- titles --- */}
      <h2 className="mt-10 text-label font-medium uppercase text-muted">Titles &amp; descriptions</h2>
      <div className="mt-4 grid gap-5 border border-line bg-surface p-5">
        <Field
          id="settings-default-title"
          label="Default site title"
          help="Used when a page sets no title of its own. Almost every page does, so this mainly covers the fallback."
        >
          <input
            id="settings-default-title"
            type="text"
            value={values.default_meta_title}
            onChange={(e) => set('default_meta_title', e.target.value)}
            className={cn('mt-2', inputClass)}
          />
        </Field>

        <Field
          id="settings-title-suffix"
          label="Title suffix"
          help="Usually leave this blank. Page titles on this site already end with the brand, so a suffix here produces “Title | Dipendra Guragain | Your Suffix”."
        >
          <input
            id="settings-title-suffix"
            type="text"
            value={values.title_suffix}
            placeholder=" | Junior Developer Portfolio"
            onChange={(e) => set('title_suffix', e.target.value)}
            className={cn('mt-2', inputClass)}
          />
        </Field>

        <Field id="settings-default-description" label="Global meta description">
          <textarea
            id="settings-default-description"
            rows={3}
            value={values.default_meta_description}
            onChange={(e) => set('default_meta_description', e.target.value)}
            className={cn('mt-2 resize-y', inputClass)}
          />
        </Field>
      </div>

      {/* ---------------------------------------------------------- image --- */}
      <h2 className="mt-10 text-label font-medium uppercase text-muted">Social sharing</h2>
      <div className="mt-4 grid gap-5 border border-line bg-surface p-5 md:grid-cols-2">
        <Field
          id="settings-og-image"
          label="Default OG image"
          help="1200×630. Used by any page that has no image of its own, including project pages."
        >
          <input
            id="settings-og-image"
            type="text"
            value={values.default_og_image}
            placeholder="/og-image.png"
            onChange={(e) => set('default_og_image', e.target.value)}
            className={cn('mt-2', inputClass)}
          />
        </Field>
        <div className="flex items-center justify-center border border-line bg-subtle p-3">
          {values.default_og_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={values.default_og_image}
              alt=""
              className="max-h-32 w-full object-contain"
            />
          ) : (
            <span className="text-xs text-muted">Using the built-in /og-image.png</span>
          )}
        </div>

        <div className="md:col-span-2">
          <p className="text-label font-medium uppercase text-muted">Social profiles</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            Published as <code className="font-mono">sameAs</code> on the Person schema,
            which is how search engines connect this site to your profiles elsewhere.
            Leave a platform blank to omit it.
          </p>
          <div className="mt-3 grid gap-3">
            {SOCIAL_PLATFORMS.map((platform) => (
              <div key={platform} className="grid items-center gap-3 sm:grid-cols-[7rem_1fr]">
                <label
                  htmlFor={`settings-social-${platform}`}
                  className="text-xs font-medium capitalize text-muted"
                >
                  {platform === 'x' ? 'X / Twitter' : platform}
                </label>
                <input
                  id={`settings-social-${platform}`}
                  type="text"
                  value={values.social_links[platform] ?? ''}
                  placeholder="https://…"
                  onChange={(e) =>
                    set('social_links', { ...values.social_links, [platform]: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- analytics --- */}
      <h2 className="mt-10 text-label font-medium uppercase text-muted">
        Analytics &amp; verification
      </h2>
      <div className="mt-4 grid gap-5 border border-line bg-surface p-5 md:grid-cols-2">
        <Field id="settings-ga4" label="GA4 measurement ID" help="Looks like G-XXXXXXXXXX.">
          <input
            id="settings-ga4"
            type="text"
            value={values.ga4_measurement_id}
            onChange={(e) => set('ga4_measurement_id', e.target.value)}
            className={cn('mt-2 font-mono', inputClass)}
          />
        </Field>
        <Field id="settings-gtm" label="Google Tag Manager ID" help="Looks like GTM-XXXXXXX.">
          <input
            id="settings-gtm"
            type="text"
            value={values.gtm_container_id}
            onChange={(e) => set('gtm_container_id', e.target.value)}
            className={cn('mt-2 font-mono', inputClass)}
          />
        </Field>
        <Field id="settings-pixel" label="Meta Pixel ID">
          <input
            id="settings-pixel"
            type="text"
            value={values.meta_pixel_id}
            onChange={(e) => set('meta_pixel_id', e.target.value)}
            className={cn('mt-2 font-mono', inputClass)}
          />
        </Field>
        <Field
          id="settings-google-verification"
          label="Google Search Console token"
          help="The content value only, from the HTML tag method."
        >
          <input
            id="settings-google-verification"
            type="text"
            value={values.google_site_verification}
            onChange={(e) => set('google_site_verification', e.target.value)}
            className={cn('mt-2 font-mono', inputClass)}
          />
        </Field>
        <Field id="settings-bing-verification" label="Bing Webmaster token">
          <input
            id="settings-bing-verification"
            type="text"
            value={values.bing_site_verification}
            onChange={(e) => set('bing_site_verification', e.target.value)}
            className={cn('mt-2 font-mono', inputClass)}
          />
        </Field>
      </div>

      {/* ---------------------------------------------------------- person --- */}
      <h2 className="mt-10 text-label font-medium uppercase text-muted">Person schema</h2>
      <div className="mt-4 grid gap-5 border border-line bg-surface p-5">
        <Field id="settings-job-title" label="Job title">
          <input
            id="settings-job-title"
            type="text"
            value={values.person_job_title}
            placeholder="Web Developer & SEO Specialist"
            onChange={(e) => set('person_job_title', e.target.value)}
            className={cn('mt-2', inputClass)}
          />
        </Field>
        <Field
          id="settings-knows-about"
          label="Knows about"
          help="One per line. Published as knowsAbout — a claim about expertise, so keep it to things the site can actually demonstrate."
        >
          <textarea
            id="settings-knows-about"
            rows={6}
            value={values.person_knows_about.join('\n')}
            onChange={(e) =>
              set(
                'person_knows_about',
                e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
              )
            }
            className={cn('mt-2 resize-y font-mono text-[13px]', inputClass)}
          />
        </Field>
      </div>

      {/* --------------------------------------------------------- robots --- */}
      <h2 className="mt-10 text-label font-medium uppercase text-muted">robots.txt</h2>
      <div className="mt-4 grid gap-4 border border-line bg-surface p-5">
        <Field
          id="settings-robots"
          label="Raw robots.txt"
          help="Leave blank to use the generated file, which allows every crawler and disallows /admin. Filling this in replaces it entirely."
        >
          <textarea
            id="settings-robots"
            rows={12}
            value={values.robots_txt}
            placeholder={'User-Agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: https://dipendraguragain.tech/sitemap.xml'}
            onChange={(e) => set('robots_txt', e.target.value)}
            className={cn('mt-2 resize-y font-mono text-[13px]', inputClass)}
          />
        </Field>

        {danger ? (
          <p className="flex items-start gap-2 border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">
            <AlertTriangle size={16} aria-hidden className="mt-0.5 shrink-0" />
            <span>{danger}</span>
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex items-center gap-3 border-t border-line pt-6">
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
          Save settings
        </button>
      </div>
    </div>
  );
}
