import { formatNpr, serviceStartingPrice } from '@/data/pricing';
import { profile } from '@/data/profile';
import { site } from '@/data/seo';
import { getPosts, getProjects, getSeoMap, getServices, seoKey } from '@/lib/content';

/**
 * `/llms.txt` — a plain-text summary of the site for language models.
 *
 * Worth being straight about what this does: Google Search ignores it, and it
 * is not a ranking factor. It is a convenience for systems that choose to read
 * it, and the honest expectation is that it helps an assistant describe the
 * business accurately if it fetches the file, not that it wins citations on
 * its own. AI citations are driven far more by off-site mentions.
 *
 * Served from a route rather than `public/llms.txt` so the URLs are built from
 * `site.url` and the service and article lists come from the same data the
 * pages render, instead of being a second copy that quietly goes stale.
 *
 * **Two reads were wrong in that respect and are fixed here.** The service list
 * came from `src/data/services.ts` directly, while `/services` reads the
 * `services` table — so a service added or reworded in the admin appeared on the
 * site and not in this file. And `seo_meta.llm_summary`, the field the SEO panel
 * offers as "llms.txt summary", had no consumer at all: it saved and changed
 * nothing, which is the same defect this file's sibling changes were made to
 * fix elsewhere in the admin.
 */
export const dynamic = 'force-static';

/**
 * A pipe inside a cell ends that cell, so any the copy contains is escaped.
 * None of the current values have one, which is exactly why this is worth
 * doing now — the failure is silent, and it would appear as a mangled table
 * the first time someone wrote "SEO | Ads" in a deliverable.
 */
const cell = (value: string): string => value.replace(/\|/g, '\\|');

export async function GET() {
  const [services, projects, posts, seo] = await Promise.all([
    getServices(),
    getProjects(),
    getPosts(),
    getSeoMap(),
  ]);

  const abs = (path: string) => `${site.url}${path}`;

  /**
   * The admin's summary for one entity, or the site's own copy.
   *
   * `llmSummary` exists because the two audiences want different sentences: a
   * meta description is written to earn a click from a search result, and a
   * summary for a language model is written to be restated accurately. Where
   * they differ, the admin's version wins *in this file only* — the page itself
   * is untouched.
   */
  const summary = (
    kind: 'project' | 'post' | 'service',
    slug: string,
    fallback: string,
  ): string => seo.get(seoKey(kind, slug))?.llmSummary ?? fallback;

  /**
   * The same comparative data the service pages render as a `<table>`, in the
   * one format an LLM reads without having to parse HTML.
   *
   * Derived from the services rather than written out, so it cannot describe a
   * different set of services from the pages it summarises. A service with no
   * comparison data is left out entirely, and if none has any the table is
   * omitted — an empty table is a worse signal than no table.
   *
   * `null` price renders as "Contact for a quote", not as an em-dash, because
   * that is the published answer and not an absence of one. See
   * `serviceStartingPrice`.
   */
  const comparisonRows = services
    .filter(
      (s) =>
        s.deliverables?.length ||
        s.timeline ||
        s.bestFor ||
        s.fromNpr !== undefined,
    )
    .map((s) => {
      const price =
        formatNpr(serviceStartingPrice(s.slug, s.fromNpr)) ??
        'Contact for a quote';
      const deliverables = (s.deliverables ?? []).join('; ') || '—';

      return [
        `[${cell(s.title)}](${abs(`/services/${s.slug}`)})`,
        cell(deliverables),
        cell(s.timeline ?? '—'),
        cell(price),
        cell(s.bestFor ?? '—'),
      ].join(' | ');
    });

  const comparisonTable =
    comparisonRows.length > 0
      ? [
          '| Service | What it includes | Typical timeline | Starting price | Best for |',
          '| --- | --- | --- | --- | --- |',
          ...comparisonRows.map((row) => `| ${row} |`),
        ].join('\n')
      : 'Not published yet.';

  const body = `# ${profile.name}

> ${profile.title}. Based in ${profile.location}.

${profile.description}

Services are used together far more often than separately, which is the point
of the practice: most problems that arrive looking like four problems turn out
to be one.

## Contact

- Email: ${profile.email}
- WhatsApp: ${profile.whatsapp}
- Location: ${profile.location}
${profile.availability ? `- Availability: ${profile.availabilityText}\n` : ''}
## Services

${services.map((s) => `- [${s.title}](${abs(`/services/${s.slug}`)}): ${summary('service', s.slug, s.shortDescription)}`).join('\n')}

## Service comparison

${comparisonTable}

## Selected work

${projects.map((p) => `- [${p.title}](${abs(`/work/${p.slug}`)}): ${summary('project', p.slug, p.description)}`).join('\n')}

## Writing

${posts.map((p) => `- [${p.title}](${abs(`/blog/${p.slug}`)}): ${summary('post', p.slug, p.excerpt)}`).join('\n')}

## Pages

- [Home](${abs('/')})
- [About](${abs('/about')})
- [Work](${abs('/work')})
- [Services](${abs('/services')})
- [Pricing](${abs('/pricing')})
- [Insights](${abs('/blog')})
- [Contact](${abs('/contact')})

## Notes

- Services are available to businesses in Nepal and to international clients
  working remotely.
- Client project pages describe delivered work. Figures are only published
  where they can be stood behind; illustrative interface mockups are labelled
  as such.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate',
    },
  });
}
