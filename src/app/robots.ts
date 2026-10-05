import type { MetadataRoute } from 'next';
import { site } from '@/data/seo';

/**
 * Crawlers named explicitly, so a later wildcard edit cannot take them out.
 *
 * The wildcard rule already permits all of these, so this changes no behaviour
 * today. It exists so the intent is auditable: the single most common way a
 * site disappears from AI answers is a later "block all bots" edit to the
 * wildcard, which silently takes everything unnamed with it. Naming an agent
 * means that edit has to be deliberate.
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
 *
 * `/admin` stays disallowed for every agent.
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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The admin panel is behind auth and sends `noindex` itself, but a
        // disallow keeps crawlers from requesting it at all.
        disallow: ['/admin', '/admin/'],
      },
      {
        userAgent: NAMED_CRAWLERS,
        allow: '/',
        disallow: ['/admin', '/admin/'],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
