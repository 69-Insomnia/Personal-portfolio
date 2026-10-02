import type { MetadataRoute } from 'next';
import { site } from '@/data/seo';

/**
 * AI answer engines are allowed in explicitly.
 *
 * The wildcard rule already permits them, so this changes no behaviour today.
 * It exists so the intent is auditable: the single most common way a site
 * disappears from AI answers is a later "block all bots" edit to the wildcard,
 * which silently takes the AI crawlers with it. Naming them means that edit
 * has to be deliberate.
 *
 * `Google-Extended` is the one that governs whether content can ground Gemini
 * and AI Overviews. `Applebot-Extended` does the same for Apple Intelligence.
 * Neither affects normal Google Search ranking.
 *
 * `/admin` stays disallowed for every agent.
 */
const AI_AGENTS = [
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
        userAgent: AI_AGENTS,
        allow: '/',
        disallow: ['/admin', '/admin/'],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
