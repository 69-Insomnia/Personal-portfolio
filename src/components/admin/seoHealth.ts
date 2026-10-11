import { staticPages } from '@/data/static-pages';
import { DESC_MAX, DESC_MIN, TITLE_MAX, TITLE_MIN } from './SeoPanel';

/**
 * The checks behind `/admin/seo/health`.
 *
 * ## The rule this file follows
 *
 * **Every check restates a rule the code already enforces or a field the
 * renderer already depends on.** Nothing here is advice. If a check fires, it
 * is because something on the site will behave differently from how the person
 * reading this panel expects — a title that gets truncated in a result, a
 * service that renders no comparison row, a post with no statistic to quote.
 *
 * That constraint is the whole design. A dashboard that invents best practices
 * trains people to ignore it, because the first three items they check turn out
 * to be fine. There is no "add more keywords", no "post daily", and no score.
 *
 * ## Why the thresholds are imported rather than written here
 *
 * `TITLE_MAX` and `DESC_MAX` come from `SeoPanel`, which is where the admin's
 * character meters and its save-time validation get them. Restating 60 and 155
 * in this file would let the panel warn at one length and the health check
 * complain at another, and the person looking at a green meter while this page
 * lists an error has no way to tell which one is wrong.
 *
 * ## Why a missing `seo_meta` row is not a finding
 *
 * The commonest thing this panel could report is that most pages have no row.
 * That would be wrong. `src/data/seo.ts` generates a complete, deliberate title
 * and description for every route, and `withSeoMeta` layers the row on top —
 * so an absent row means "the template is in use", which is a valid and
 * intended state, not a gap. Flagging it would put every page on the list
 * permanently and hide the findings that matter.
 *
 * Only a field that is *set and wrong* is reported. A blank field never is.
 */

export type Severity = 'error' | 'warning' | 'info';

export interface Finding {
  severity: Severity;
  /** What the finding is about — a page title, or a collection name. */
  subject: string;
  /** Where to fix it, so every line is actionable. */
  href: string;
  message: string;
  /** Groups findings that share a cause, so the list can be read in blocks. */
  group: string;
}

/** The columns this file reads. Deliberately narrower than the full row types. */
export interface HealthEntity {
  kind: 'project' | 'post' | 'service' | 'page';
  slug: string;
  label: string;
  /** Path on the public site, for the "view" link. */
  path: string;
  /** Where to edit it in the admin. */
  adminHref: string;
}

export interface MetaRow {
  entity_type: string;
  entity_slug: string;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  canonical_override: string | null;
  noindex: boolean | null;
  ai_answer: string | null;
  stats: unknown;
  faqs: unknown;
}

export interface ServiceRow {
  slug: string;
  title: string;
  published: boolean;
  deliverables: unknown;
  timeline: string | null;
  best_for: string | null;
  from_npr: number | null;
}

export interface PostRow {
  slug: string;
  title: string;
  published: boolean;
}

/** A `seo_meta` row as the checks need it, or `undefined` when there is none. */
export interface HealthInput {
  entities: HealthEntity[];
  meta: MetaRow[];
  services: ServiceRow[];
  posts: PostRow[];
}

const length = (value: string | null | undefined): number =>
  typeof value === 'string' ? value.trim().length : 0;

const hasList = (value: unknown): boolean => Array.isArray(value) && value.length > 0;

/**
 * Everything the panel reports, most severe first.
 *
 * The ordering is by severity and then by whether the finding blocks something
 * from rendering, which is why a service with no comparison data outranks a
 * title that runs a few characters long: the first means a page is missing a
 * block entirely, the second means a result is slightly truncated.
 */
export function auditSeo({ entities, meta, services, posts }: HealthInput): Finding[] {
  const findings: Finding[] = [];
  const metaByKey = new Map(
    meta.map((row) => [`${row.entity_type}:${row.entity_slug}`, row]),
  );

  /* ------------------------------------------------- per-page overrides --- */

  for (const entity of entities) {
    const row = metaByKey.get(`${entity.kind}:${entity.slug}`);
    // No row means the generated template is in use — see the module note.
    if (!row) continue;

    const title = length(row.meta_title);
    if (title > TITLE_MAX) {
      findings.push({
        severity: 'error',
        group: 'Titles',
        subject: entity.label,
        href: entity.adminHref,
        message: `Meta title is ${title} characters. Google truncates past ${TITLE_MAX}, so the end is never shown.`,
      });
    } else if (title > 0 && title < TITLE_MIN) {
      findings.push({
        severity: 'info',
        group: 'Titles',
        subject: entity.label,
        href: entity.adminHref,
        message: `Meta title is ${title} characters, below the ${TITLE_MIN}–${TITLE_MAX} range the panel targets. Not an error — a short title wastes space rather than breaking.`,
      });
    }

    const description = length(row.meta_description);
    if (description > DESC_MAX) {
      findings.push({
        severity: 'error',
        group: 'Descriptions',
        subject: entity.label,
        href: entity.adminHref,
        message: `Meta description is ${description} characters. It is clamped at ${DESC_MAX} on the way out, so the tail is never read.`,
      });
    } else if (description > 0 && description < DESC_MIN) {
      findings.push({
        severity: 'info',
        group: 'Descriptions',
        subject: entity.label,
        href: entity.adminHref,
        message: `Meta description is ${description} characters, below the ${DESC_MIN}–${DESC_MAX} range.`,
      });
    }

    /**
     * A canonical override is reported even though it is usually deliberate.
     * It is the one field that removes a page from `sitemap.xml` and hands its
     * ranking to another URL, so seeing the list is worth five seconds — and
     * an override set by accident is invisible everywhere else in the admin.
     */
    if (row.canonical_override) {
      findings.push({
        severity: 'warning',
        group: 'Canonical overrides',
        subject: entity.label,
        href: entity.adminHref,
        message: `Canonical points at ${row.canonical_override}. This page is excluded from the sitemap and its ranking is attributed there.`,
      });
    }

    if (row.noindex) {
      findings.push({
        severity: 'warning',
        group: 'Hidden from search',
        subject: entity.label,
        href: entity.adminHref,
        message:
          'Marked noindex, nofollow — excluded from search and from sitemap.xml. Correct for a draft, a problem for anything else.',
      });
    }

    // The GEO fields. These are the audit's two named citability gaps, so a
    // page that has been configured at all but has neither is worth saying.
    const configured = Boolean(row.meta_title || row.meta_description);
    if (configured && !hasList(row.stats)) {
      findings.push({
        severity: 'info',
        group: 'No sourced statistics',
        subject: entity.label,
        href: entity.adminHref,
        message:
          'No statistics with sources. The audit names this the single biggest reason a page gets passed over for AI citation.',
      });
    }

    if (configured && !row.ai_answer) {
      findings.push({
        severity: 'info',
        group: 'No answer passage',
        subject: entity.label,
        href: entity.adminHref,
        message:
          'No answer passage written. This is the block that has somewhere to go as a quotable, self-contained answer.',
      });
    }
  }

  /* ---------------------------------------------------------- services --- */

  for (const service of services) {
    if (!service.published) continue;
    const href = `/admin/services/${service.slug}`;

    /**
     * A service missing any of the four comparison columns renders no row in
     * the `/services` table — `hasComparisonData` in `ComparisonTable.tsx` is
     * what decides that. So this is not a style suggestion; it is the reason a
     * service is absent from a table the page claims to be showing.
     */
    const hasComparison =
      hasList(service.deliverables) ||
      Boolean(service.timeline) ||
      Boolean(service.best_for) ||
      service.from_npr !== null;

    if (!hasComparison) {
      findings.push({
        severity: 'error',
        group: 'Missing from the comparison table',
        subject: service.title,
        href,
        message:
          'No deliverables, timeline, price or "best for" set, so this service renders no row in the comparison table on /services.',
      });
    }

    if (service.from_npr === null) {
      findings.push({
        severity: 'info',
        group: 'No published price',
        subject: service.title,
        href,
        message:
          'No starting price. Renders as "Contact for a quote", which is honest — but the audit found pricing is a ranking theme in this market, and every competitor page ranking for it publishes a figure.',
      });
    }
  }

  /* ------------------------------------------------------------- posts --- */

  for (const post of posts) {
    if (!post.published) continue;
    const row = metaByKey.get(`post:${post.slug}`);

    // Only reported for posts already configured, for the same reason as the
    // per-page checks above — an untouched post is not a finding.
    if (!row || (!row.meta_title && !row.meta_description)) continue;

    if (!hasList(row.stats)) {
      findings.push({
        severity: 'info',
        group: 'No sourced statistics',
        subject: post.title,
        href: `/admin/posts/${post.slug}`,
        message:
          'No statistics with sources. The audit measured zero figures across every post and called it the biggest citability gap on the site.',
      });
    }
  }

  const order: Record<Severity, number> = { error: 0, warning: 1, info: 2 };
  return findings.sort(
    (a, b) => order[a.severity] - order[b.severity] || a.group.localeCompare(b.group),
  );
}

/** Counts per severity, for the summary row at the top of the panel. */
export function summarise(findings: Finding[]): Record<Severity, number> {
  return findings.reduce(
    (totals, finding) => {
      totals[finding.severity] += 1;
      return totals;
    },
    { error: 0, warning: 0, info: 0 } as Record<Severity, number>,
  );
}

/**
 * Turns the loaded rows into the flat list of things that can have SEO
 * overrides.
 *
 * Built here rather than in the page so the panel and the checks cannot
 * disagree about which entities exist — a check that looks up a key the builder
 * never produces is a check that silently never fires.
 *
 * The static pages are included from `staticPages` rather than from the
 * database, for the same reason `/admin/seo/pages` lists them that way: reading
 * `seo_meta` alone would surface only the pages that already have a row and
 * hide the ones that do not.
 */
export function buildEntities({
  projects,
  posts,
  services,
}: {
  projects: Array<{ slug: string; title: string }>;
  posts: Array<{ slug: string; title: string }>;
  services: Array<{ slug: string; title: string }>;
}): HealthEntity[] {
  return [
    ...projects.map((project) => ({
      kind: 'project' as const,
      slug: project.slug,
      label: project.title,
      path: `/work/${project.slug}`,
      adminHref: `/admin/projects/${project.slug}`,
    })),
    ...posts.map((post) => ({
      kind: 'post' as const,
      slug: post.slug,
      label: post.title,
      path: `/blog/${post.slug}`,
      adminHref: `/admin/posts/${post.slug}`,
    })),
    ...services.map((service) => ({
      kind: 'service' as const,
      slug: service.slug,
      label: service.title,
      path: `/services/${service.slug}`,
      adminHref: `/admin/services/${service.slug}`,
    })),
    ...staticPages.map((page) => ({
      kind: 'page' as const,
      slug: page.slug,
      label: page.label,
      path: page.path || '/',
      adminHref: `/admin/seo/pages/${page.slug}`,
    })),
  ];
}
