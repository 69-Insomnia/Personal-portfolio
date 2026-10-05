import type { Metadata } from 'next';
import type { SEOData, SiteSettings } from '@/types';
import { DEFAULT_OG_IMAGE, identity, site } from '@/data/seo';

/**
 * How long a description can run before a search result truncates it.
 *
 * Google's display limit is a pixel width rather than a character count, and
 * the old ~155-character rule of thumb still lands close enough to be useful.
 * Going over does not hurt ranking, but the tail is simply never read — and on
 * a project page the tail is where the sentence finishes, so the visible half
 * reads as though it was cut off mid-thought.
 */
const DESCRIPTION_LIMIT = 158;

/**
 * Trims to the limit on a word boundary and marks the cut.
 *
 * Clamping to a hard character count would slice words in half. Cutting at the
 * last space and appending an ellipsis keeps it readable — and the ellipsis is
 * honest about there being more, which a silent truncation is not.
 */
export function clampDescription(text: string, limit = DESCRIPTION_LIMIT): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;

  const cut = clean.slice(0, limit - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : cut.length).replace(/[,;:.—–-]+$/, '')}…`;
}

/**
 * Builds the `<head>` for one page from its `SEOData`.
 *
 * The values a page *cannot* know about itself are supplied here rather than
 * restated per route: the OG image falls back to the site default, and `robots`
 * is left undefined unless a page opts out — an undefined value inherits the
 * layout's `index, follow`, whereas passing `{ index: true }` on every page
 * would mean re-deciding that on every page.
 *
 * Article fields are only emitted when `ogType` is `article`, so a stray
 * `publishedTime` on a service page cannot claim it was published.
 */
export function buildMetadata(seo: SEOData, settings?: SiteSettings): Metadata {
  const {
    title,
    description,
    keywords,
    canonical,
    ogImage,
    ogType,
    robots,
    authors,
    publishedTime,
    modifiedTime,
    tags,
    ogTitle,
    ogDescription,
    twitterTitle,
    twitterDescription,
    twitterImage,
  } = seo;

  /**
   * The global title suffix, appended rather than replaced.
   *
   * This is off by default and should usually stay off: every title this site
   * generates already ends with the brand ("… | Dipendra Guragain"), so a
   * suffix set here lands after it and produces "… | Dipendra Guragain |
   * Junior Developer Portfolio". The field exists because it was asked for and
   * because it is genuinely useful on a site whose titles do *not* carry the
   * brand — say, after a rebrand where the page titles were rewritten. The
   * admin panel says so next to the field.
   */
  const suffixed = settings?.titleSuffix ? `${title}${settings.titleSuffix}` : title;

  const ogTitleValue = ogTitle ?? suffixed;
  const ogDescriptionValue = clampDescription(ogDescription ?? description);
  const twitterTitleValue = twitterTitle ?? ogTitleValue;
  const twitterDescriptionValue = clampDescription(
    twitterDescription ?? ogDescription ?? description,
  );

  /**
   * Page image, then the admin's site-wide default, then the repo constant.
   *
   * The middle step is why `settings` is threaded through at all. Without it
   * the global OG image field would be decorative: every page that calls
   * `buildMetadata` sets `openGraph.images` explicitly, which overrides the
   * root layout's value, so a default configured in the admin would never
   * reach a project page.
   */
  const ogImageValue = ogImage ?? settings?.defaultOgImage ?? DEFAULT_OG_IMAGE;
  const twitterImageValue = twitterImage ?? ogImageValue;

  const summary = clampDescription(description);
  const isArticle = ogType === 'article';
  const byline = authors && authors.length > 0 ? authors : [identity.name];

  return {
    title: suffixed,
    description: summary,
    keywords,
    /**
     * Spread in only when a page actually sets it, never as `robots: undefined`.
     *
     * Next merges a page's metadata over the layout's by key, and a key that is
     * *present but undefined* still overwrites — so every page that used
     * `buildMetadata` was silently discarding the root layout's robots
     * directives, including its `max-image-preview:large` and `max-snippet: -1`
     * `googleBot` block. The symptom was subtle: no `<meta name="robots">` at
     * all on indexable pages, which looks like the default and is therefore
     * easy to miss. Omitting the key lets the layout's value be inherited, and
     * this is the only field where that matters.
     */
    ...(robots ? { robots } : {}),
    authors: byline.map((name) => ({ name })),
    alternates: canonical ? { canonical } : undefined,
    /**
     * Verification from the admin when it is set, from the environment
     * otherwise.
     *
     * The env vars are build-time inlined, so changing one needs a redeploy;
     * the database value does not. Both are supported rather than the database
     * replacing the env var, because a DNS-verified property needs neither and
     * an existing deploy that already sets the env var should not silently
     * lose its token.
     */
    verification: settings
      ? {
          google: settings.googleSiteVerification ?? searchConsoleVerification?.google,
          other: settings.bingSiteVerification
            ? { 'msvalidate.01': settings.bingSiteVerification }
            : searchConsoleVerification?.other,
        }
      : undefined,
    openGraph: {
      title: ogTitleValue,
      description: ogDescriptionValue,
      url: canonical ?? undefined,
      siteName: site.name,
      locale: site.locale,
      type: ogType ?? 'website',
      // `alt` matters more than it looks. It is what a screen reader announces
      // in place of the preview card, and what a text-only consumer shows
      // instead of the image. Falling back to the title is honest here: the
      // card is a typographic treatment of that same title.
      images: [{ url: ogImageValue, width: 1200, height: 630, alt: ogTitleValue }],
      ...(isArticle ? { publishedTime, modifiedTime, authors: byline, tags } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitleValue,
      description: twitterDescriptionValue,
      images: [{ url: twitterImageValue, alt: twitterTitleValue }],
    },
  };
}

/**
 * Verification tokens for Google Search Console and Bing Webmaster Tools.
 *
 * Both are optional and both are omitted when unset, so the meta tag only
 * appears once a real token exists. A placeholder is worse than nothing:
 * Search Console reads a wrong token as a failed verification.
 *
 * They are `NEXT_PUBLIC_*` because Next inlines them at build time, so adding
 * one needs a redeploy rather than a restart. See `.env.example`.
 */
export const searchConsoleVerification: Metadata['verification'] = {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
    ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
    : undefined,
};
