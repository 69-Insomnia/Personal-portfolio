'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { getSupabase } from '@/lib/supabase-browser';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { inputClass } from '@/components/admin/FieldControl';
import { cn } from '@/utils/cn';

/**
 * The 301 redirect table.
 *
 * Most rows here are written by `on_slug_change`, which fires when a slug is
 * edited in the projects, posts or services form. This page is for the ones
 * the trigger cannot know about: a page that moved between sections, an old
 * URL from a previous version of the site, a link someone else published that
 * was wrong.
 *
 * ## Why paths are normalised on the way in
 *
 * The `redirects` table has check constraints requiring a leading slash,
 * lowercase, and no trailing slash on `from_path`. Those constraints are the
 * right place for the rule — they hold for every writer — but a raw Postgres
 * violation is a poor way to learn you typed `About/`. So the form normalises
 * and shows what it is going to store before it stores it.
 *
 * ## Why there is no "test this redirect" button
 *
 * There is no API route to call. The admin talks to Supabase directly and the
 * site reads redirects through `permanentRedirect()` in the page components,
 * so verifying a redirect means loading the old URL on the live site. A button
 * that fetched the path from the browser would be blocked by CORS on the
 * production origin, and would prove nothing about the deployed build anyway.
 */

interface RedirectRow {
  id: string;
  from_path: string;
  to_path: string;
  status_code: number;
  hit_count: number;
  created_at: string;
}

/**
 * Brings a hand-typed path into the shape the database will accept.
 *
 * Deliberately mirrors the check constraints rather than replacing them: this
 * is the friendly path, the constraints are the guarantee. A pasted full URL
 * is reduced to its path, because that is what someone means when they paste
 * `https://dipendraguragain.tech/work/old-project` into a field labelled
 * "old path".
 */
function normalizePath(input: string): string {
  let value = input.trim();
  if (value === '') return '';

  // A pasted absolute URL: keep the path, drop scheme, host, query and hash.
  if (/^https?:\/\//i.test(value)) {
    try {
      value = new URL(value).pathname;
    } catch {
      // Unparseable but scheme-prefixed — fall through and let the strip
      // below do what it can rather than throwing on a paste.
    }
  }

  value = value.split('?')[0].split('#')[0];
  value = value.toLowerCase().replace(/\s+/g, '-');
  if (!value.startsWith('/')) value = `/${value}`;
  // `/` is a legitimate destination and must survive the trailing-slash strip.
  if (value.length > 1) value = value.replace(/\/+$/, '');
  return value;
}

function pathProblem(value: string, { allowRoot }: { allowRoot: boolean }): string | null {
  if (value === '') return 'Required.';
  if (value === '/') {
    return allowRoot ? null : 'The old path cannot be the homepage.';
  }
  if (!value.startsWith('/')) return 'Must start with /.';
  if (value !== value.toLowerCase()) return 'Must be lowercase.';
  if (value.endsWith('/')) return 'No trailing slash.';
  return null;
}

export function RedirectsManager() {
  const [rows, setRows] = useState<RedirectRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState(308);
  const [formError, setFormError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data, error: err } = await getSupabase()
        .from('redirects')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) {
        setError(err.message);
        setRows([]);
        return;
      }
      setRows((data as RedirectRow[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const normalizedFrom = normalizePath(from);
  const normalizedTo = normalizePath(to);

  const add = async () => {
    const fromProblem = pathProblem(normalizedFrom, { allowRoot: false });
    const toProblem = pathProblem(normalizedTo, { allowRoot: true });

    /**
     * A redirect from a path to itself is the one entry that is worse than
     * useless — the browser is sent to the address it already asked for and
     * reports `ERR_TOO_MANY_REDIRECTS`. Catching it here is cheaper than
     * finding it in a browser.
     */
    const loop = normalizedFrom === normalizedTo ? 'A path cannot redirect to itself.' : null;

    const problem = fromProblem ?? toProblem ?? loop;
    if (problem) {
      setFormError(problem);
      return;
    }

    setAdding(true);
    setFormError(null);
    const { error: err } = await getSupabase().from('redirects').insert({
      from_path: normalizedFrom,
      to_path: normalizedTo,
      status_code: status,
    });
    setAdding(false);

    if (err) {
      setFormError(
        err.code === '23505'
          ? `There is already a redirect from ${normalizedFrom}. Delete it first, or edit that row.`
          : err.message,
      );
      return;
    }

    setFrom('');
    setTo('');
    await load();
  };

  const remove = async (row: RedirectRow) => {
    if (
      !window.confirm(
        `Delete the redirect from ${row.from_path}?\n\nAnyone following that link will get a 404 instead.`,
      )
    ) {
      return;
    }
    setBusy(row.id);
    const { error: err } = await getSupabase().from('redirects').delete().eq('id', row.id);
    setBusy(null);
    if (err) {
      setError(err.message);
      return;
    }
    setRows((prev) => (prev ? prev.filter((r) => r.id !== row.id) : prev));
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="seo"
        title="Redirects"
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="border border-line px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-ink hover:text-ink"
          >
            Refresh
          </button>
        }
      />

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        Renaming a project, post or service slug adds its redirect here
        automatically. Add rows by hand for pages that moved between sections or
        for old URLs from a previous version of the site.
      </p>

      {error ? (
        <p className="mt-6 border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {/* ------------------------------------------------------------ add --- */}
      <div className="mt-8 border border-line bg-surface p-4">
        <h2 className="text-label font-medium uppercase text-muted">Add a redirect</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
          <div>
            <label htmlFor="redirect-from" className="sr-only">
              Old path
            </label>
            <input
              id="redirect-from"
              type="text"
              value={from}
              placeholder="/work/old-project"
              onChange={(event) => setFrom(event.target.value)}
              className={cn(inputClass, 'font-mono')}
            />
          </div>
          <div>
            <label htmlFor="redirect-to" className="sr-only">
              New path
            </label>
            <input
              id="redirect-to"
              type="text"
              value={to}
              placeholder="/work/new-project"
              onChange={(event) => setTo(event.target.value)}
              className={cn(inputClass, 'font-mono')}
            />
          </div>
          <div>
            <label htmlFor="redirect-status" className="sr-only">
              Status code
            </label>
            <select
              id="redirect-status"
              value={status}
              onChange={(event) => setStatus(Number(event.target.value))}
              className={inputClass}
            >
              <option value={308}>308 (permanent)</option>
              <option value={301}>301 (permanent)</option>
            </select>
          </div>
          <button
            type="button"
            disabled={adding}
            onClick={() => void add()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {adding ? (
              <LoaderCircle size={15} className="animate-spin" aria-hidden />
            ) : (
              <Plus size={15} aria-hidden />
            )}
            Add
          </button>
        </div>

        {(normalizedFrom || normalizedTo) && !formError ? (
          <p className="mt-3 text-xs text-muted">
            Will store:{' '}
            <code className="font-mono text-ink">{normalizedFrom || '—'}</code> →{' '}
            <code className="font-mono text-ink">{normalizedTo || '—'}</code>
          </p>
        ) : null}

        {formError ? (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-danger">
            <AlertTriangle size={12} aria-hidden />
            {formError}
          </p>
        ) : null}

        <p className="mt-3 text-xs leading-relaxed text-muted">
          Both permanent codes pass ranking signals the same way. 308 is what the
          site emits itself; 301 is accepted for rows carried over from elsewhere.
        </p>
      </div>

      {/* --------------------------------------------------------- table --- */}
      {rows === null ? (
        <div className="mt-8 space-y-3" aria-busy>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse border border-line bg-surface" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-10 text-sm text-muted">
          No redirects yet. Rename a slug in Projects, Posts or Services and one will
          appear here automatically.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-line">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface">
                <th className="px-4 py-3 text-label font-medium uppercase text-muted">From</th>
                <th className="px-4 py-3 text-label font-medium uppercase text-muted">To</th>
                <th className="px-4 py-3 text-label font-medium uppercase text-muted">Code</th>
                <th className="px-4 py-3 text-label font-medium uppercase text-muted">Hits</th>
                <th className="px-4 py-3 text-label font-medium uppercase text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{row.from_path}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.to_path}</td>
                  <td className="px-4 py-3 text-xs text-muted">{row.status_code}</td>
                  <td className="px-4 py-3 text-xs text-muted">{row.hit_count}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busy === row.id}
                      onClick={() => void remove(row)}
                      aria-label={`Delete redirect from ${row.from_path}`}
                      className="inline-flex items-center justify-center border border-line p-1.5 text-muted transition-colors hover:border-danger hover:text-danger"
                    >
                      <Trash2 size={13} aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
