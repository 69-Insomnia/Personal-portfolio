'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, AlertTriangle, Check, Info } from 'lucide-react';
import { getSupabase } from '@/lib/supabase-browser';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  auditSeo,
  buildEntities,
  summarise,
  type Finding,
  type MetaRow,
  type PostRow,
  type ServiceRow,
  type Severity,
} from '@/components/admin/seoHealth';
import { cn } from '@/utils/cn';

/**
 * Read-only SEO health across the whole site.
 *
 * Read-only is the point. Every check here restates a rule the code already
 * enforces — title and description limits from `SeoPanel`, the comparison-table
 * data `ComparisonTable` requires, the statistics the audit found missing — so
 * there is nothing to configure and nothing to decide. The panel's job is to
 * surface, in one place, the fields that are set wrong or not set at all, each
 * with a link straight to the editor that fixes it.
 *
 * It runs entirely client-side over the same `anon` key the rest of the admin
 * uses, which also means it degrades honestly: if the database is unreachable,
 * it says so rather than reporting a site with no SEO problems.
 *
 * **There is deliberately no score.** The site's own audit gave itself a
 * 66/100, and the number turned out to be the least useful part of it — the
 * actionable content was the list of specific things. A score also invites
 * optimising the score.
 */

const SEVERITY_STYLE: Record<
  Severity,
  { border: string; text: string; label: string }
> = {
  error: { border: 'border-danger', text: 'text-danger', label: 'Fix' },
  warning: { border: 'border-line', text: 'text-ink', label: 'Check' },
  info: { border: 'border-line', text: 'text-muted', label: 'Consider' },
};

function SeverityIcon({ severity }: { severity: Severity }) {
  if (severity === 'error') return <AlertTriangle size={14} aria-hidden />;
  if (severity === 'warning') return <AlertCircle size={14} aria-hidden />;
  return <Info size={14} aria-hidden />;
}

export default function SeoHealthPage() {
  const [meta, setMeta] = useState<MetaRow[] | null>(null);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [entities, setEntities] = useState<ReturnType<typeof buildEntities>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const supabase = getSupabase();
      try {
        const [metaRes, serviceRes, postRes, projectRes] = await Promise.all([
          supabase.from('seo_meta').select('*'),
          supabase
            .from('services')
            .select('slug, title, published, deliverables, timeline, best_for, from_npr'),
          supabase.from('posts').select('slug, title, published'),
          supabase.from('projects').select('slug, title'),
        ]);

        if (cancelled) return;

        // The first failure is the one reported. A partial panel would be worse
        // than none — it would report findings from half the site as though
        // they were findings from all of it.
        const failure = metaRes.error ?? serviceRes.error ?? postRes.error ?? projectRes.error;
        if (failure) {
          setError(failure.message);
          setMeta([]);
          return;
        }

        const serviceRows = (serviceRes.data ?? []) as ServiceRow[];
        const postRows = (postRes.data ?? []) as PostRow[];
        const projectRows = (projectRes.data ?? []) as Array<{ slug: string; title: string }>;

        setMeta((metaRes.data ?? []) as MetaRow[]);
        setServices(serviceRows);
        setPosts(postRows);
        setEntities(
          buildEntities({ projects: projectRows, posts: postRows, services: serviceRows }),
        );
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load');
          setMeta([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const findings = useMemo(
    () => (meta ? auditSeo({ entities, meta, services, posts }) : []),
    [meta, entities, services, posts],
  );

  const counts = useMemo(() => summarise(findings), [findings]);

  /**
   * Grouped by cause rather than listed flat, because the useful unit of work
   * here is "write statistics for these nine pages", not nine separate tasks.
   */
  const groups = useMemo(() => {
    const byGroup = new Map<string, Finding[]>();
    for (const finding of findings) {
      const list = byGroup.get(finding.group) ?? [];
      list.push(finding);
      byGroup.set(finding.group, list);
    }
    return [...byGroup.entries()];
  }, [findings]);

  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        eyebrow="SEO"
        title="Health"
        description="Everything set wrong or not set at all, across every page with SEO overrides. Read-only — each line links to the place it is fixed."
      />

      {error ? (
        <p className="mt-6 border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {meta === null ? (
        <div className="mt-8 h-64 animate-pulse border border-line bg-surface" aria-busy />
      ) : findings.length === 0 ? (
        <p className="mt-8 flex items-center gap-2 border border-success bg-success/5 px-4 py-3 text-sm text-success">
          <Check size={15} aria-hidden />
          Nothing to report. Every configured page is within the limits the panel
          enforces, and no service is missing its comparison data.
        </p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {(['error', 'warning', 'info'] as const).map((severity) => (
              <div key={severity} className="border border-line bg-paper p-4">
                <p
                  className={cn(
                    'flex items-center gap-1.5 text-label font-medium uppercase',
                    SEVERITY_STYLE[severity].text,
                  )}
                >
                  <SeverityIcon severity={severity} />
                  {SEVERITY_STYLE[severity].label}
                </p>
                <p className="mt-2 text-3xl font-medium tracking-tight">{counts[severity]}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-10">
            {groups.map(([group, items]) => (
              <section key={group}>
                <h2 className="text-label font-medium uppercase text-muted">
                  {group}
                  <span className="ml-2 text-faint">{items.length}</span>
                </h2>

                <ul className="mt-4 divide-y divide-line border border-line bg-paper">
                  {items.map((finding) => (
                    <li key={`${finding.group}-${finding.subject}`}>
                      <Link
                        href={finding.href}
                        className="block px-4 py-3 transition-colors hover:bg-subtle"
                      >
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 text-[11px] font-medium uppercase',
                              SEVERITY_STYLE[finding.severity].text,
                            )}
                          >
                            <SeverityIcon severity={finding.severity} />
                            {SEVERITY_STYLE[finding.severity].label}
                          </span>
                          <span className="text-sm font-medium text-ink">
                            {finding.subject}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted">
                          {finding.message}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
