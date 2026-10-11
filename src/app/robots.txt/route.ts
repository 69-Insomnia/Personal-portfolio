import { site } from '@/data/seo';
import { getSiteSettings } from '@/lib/content';

/**
 * `/robots.txt`, served as text rather than through `app/robots.ts`.
 *
 * ## Why this is a route handler and not a metadata file
 *
 * `app/robots.ts` returns a `MetadataRoute.Robots` object, and Next serialises
 * that into a robots.txt of its own construction. There is no field on that
 * type for raw text, which made the admin's "Raw robots.txt" field impossible
 * to honour: `/admin/seo` stored the value, warned the user that "filling this
 * in replaces the generated file entirely", and nothing ever read it. A route
 * handler is the only way to serve text the admin typed verbatim, so this
 * replaces `robots.ts` rather than sitting beside it — two files resolving to
 * the same path is a build error, not a merge.
 *
 * ## The generated default
 *
 * Used whenever the admin field is blank, which is the normal state. It is a
 * faithful copy of what `app/robots.ts` used to emit, including the two
 * separate concerns that file documented at length:
 *
 *  - the wildcard rule allows everything and disallows `/admin`;
 *  - every AI crawler is named explicitly, so that a later "block all bots"
 *    edit to the wildcard cannot silently take the AI agents with it. Naming
 *    an agent is what forces that edit to be deliberate.
 *
 * `Sitemap:` is generated from `site.url`, so it follows the configured origin
 * rather than restating it.
 *
 * Note that the wildcard rule alone already permits every crawler listed
 * below, so the named block changes no behaviour today. It is intent made
 * auditable, which is the whole point of writing it out.
 */

/**
 * Crawlers named explicitly, so a later wildcard edit cannot take them out.
 *
 * `Google-Extended` is the one that governs whether content can ground Gemini
 * and AI Overviews. `Applebot-Extended` does the same for Apple Intelligence.
 * Neither affects normal Google Search ranking.
 *
 * `Bingbot` is not an AI crawler — it is Bing's search index, and therefore
 * also the retrieval layer behind Bing Copilot. It is named here because Bing
 * matters for reasons beyond Bing's own share: Copilot, and ChatGPT's browsing
 * mode, both resolve a meaningful amount of the web through it. It is grouped
 * with the AI agents because the rule applied to it is identical, not because
 * it belongs in the same category.
 */
const NAMED_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
  'CCBot',
];

function generatedRobots(): string {
  return [
    `User-Agent: *`,
    `Allow: /`,
    // The admin panel is behind auth and sends `noindex` itself, but a
    // disallow keeps crawlers from requesting it at all.
    `Disallow: /admin`,
    `Disallow: /admin/`,
    ``,
    ...NAMED_CRAWLERS.map((agent) => `User-Agent: ${agent}`),
    `Allow: /`,
    `Disallow: /admin`,
    `Disallow: /admin/`,
    ``,
    `Sitemap: ${site.url}/sitemap.xml`,
    ``,
  ].join('\n');
}

/**
 * Revalidated on the same 5-minute window as every other database read on the
 * site — see the `revalidate: 300` in `src/lib/content.ts`. Long enough that a
 * crawler hit is not a database query, short enough that an edit in the admin
 * shows up without a deploy.
 */
export const revalidate = 300;

export async function GET() {
  const { robotsTxt } = await getSiteSettings();

  return new Response(robotsTxt ?? generatedRobots(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate',
    },
  });
}
