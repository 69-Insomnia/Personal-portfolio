import type { Metadata } from 'next';
import { ProfileIntro } from '@/sections/Profile';
import { Experience } from '@/sections/Experience';
import { Education } from '@/sections/Education';
import { Philosophy } from '@/sections/Philosophy';
import { FAQ } from '@/sections/FAQ';
import { JsonLd } from '@/components/common/JsonLd';
import {
  aboutPageNode,
  customJsonLdNodes,
  personNode,
  professionalServiceNode,
} from '@/lib/structured-data';
import { buildMetadata, normalizeMetadataImage } from '@/utils/metadata';
import { aboutSEO, DEFAULT_OG_IMAGE, identity, withSeoMeta } from '@/data/seo';
import { profile } from '@/data/profile';
import { getExperience, getSeo, getSiteSettings } from '@/lib/content';

/**
 * The profile leads, then the background that supports it.
 *
 * `Expertise` used to sit here and was removed: it renders the same
 * `ServiceCard` grid over the same `services` data as the home page's Services
 * section, so the two pages were publishing one list twice. The capability
 * chips in the profile column cover the same ground for a reader who is here to
 * learn who this is rather than what is for sale.
 *
 * The page node is what tells a search engine this URL is *about* the person
 * defined at `#person`, rather than a page that merely mentions them. Without
 * it, entity resolution has to be inferred from prose.
 *
 * ## The invisible layer
 *
 * Everything below the two constants and the graph — the `<head>` values in
 * `generateMetadata`, the `@graph` above, and the `alt`/`title` attributes on
 * the images and links this page renders through its sections — is metadata.
 * None of it changes a word, a class or a layout on the page: the visible copy
 * is byte-for-byte what it was.
 */

/** Target queries for this route. Ignored by Google; see `buildMetadata`. */
const KEYWORDS = [
  'ecommerce expert in Nepal',
  'ecommerce expert in Kathmandu',
  'ecommerce growth specialist in Nepal',
  'ecommerce SEO Nepal',
  'Shopify expert Nepal',
  'Google Ads and Meta Ads for ecommerce Nepal',
];

/**
 * The alt text on the social preview image — what a screen reader announces,
 * and what a text-only consumer shows in place of the 1200×630 card. The name
 * leads because the card is portrait-led, then the positioning this page
 * targets, then the city the second half of that query pair asks for.
 */
const OG_IMAGE_ALT = `${profile.name} — ecommerce expert in Kathmandu, Nepal`;

/**
 * The `Person` description, and why it is not `profile.description`.
 *
 * `profile.description` is the one sentence reused across the site, the footer
 * and `/llms.txt`; it does not carry the query this page targets. This one
 * states the same facts — Kathmandu, Nepal and abroad, ecommerce SEO, product
 * visibility, conversion flow, Google Ads, Meta Ads — in the words a searcher
 * uses, and it is emitted on this page only. Every other property of the node
 * comes from `personNode()` unchanged, so the two `Person` nodes on the page
 * still resolve to one entity.
 */
const PERSON_DESCRIPTION =
  'Dipendra Guragain is an ecommerce expert in Nepal based in Kathmandu, working with clients in Nepal and abroad on ecommerce SEO, product visibility, conversion flow, Google Ads and Meta Ads.';

/**
 * The two affiliations this page claims.
 *
 * Both are facts the visible copy already states — the Experience section
 * names Nano Store, the Education section names the campus — so the markup
 * restates what a reader can see rather than adding a claim. No dates are
 * asserted: the copy says "1 year" and "currently", and turning either into a
 * `startDate` would invent a month the site never published.
 */
const NANO_STORE = {
  '@type': 'Organization',
  name: 'Nano Store',
  url: 'https://nanostore.com.np/',
} as const;

const CAMPUS = {
  '@type': 'EducationalOrganization',
  name: 'Ratna Rajyalaxmi Campus',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Kathmandu',
    addressCountry: 'NP',
  },
} as const;

/**
 * What the business sells, as `serviceType`.
 *
 * Seven entries, each one a published service page or a skill the site
 * demonstrates — not the keyword list from `KEYWORDS`. `serviceType` describes
 * the offer; a term the site has no page and no work behind would be the
 * cheapest kind of markup to write and the easiest to contradict.
 */
const SERVICE_TYPES = [
  'Ecommerce SEO',
  'Technical SEO',
  'Shopify SEO',
  'Conversion Optimization',
  'Google Ads',
  'Meta Ads',
  'Web Development',
];

export default async function AboutPage() {
  const [experience, settings, meta] = await Promise.all([
    getExperience(),
    getSiteSettings(),
    getSeo('page', 'about'),
  ]);

  const seo = withSeoMeta(aboutSEO, meta);

  /**
   * `sameAs` and `knowsAbout` are rebuilt the way `RootLayout` builds them for
   * the site-wide graph — same sort, same admin values — so the `Person` below
   * and the one `SiteJsonLd` emits describe the same profiles and the same
   * skills. Only `jobTitle` and `description` are allowed to differ, and they
   * differ because the copy on this page differs: the portrait card prints
   * `profile.title` ("Ecommerce Growth Expert") directly above the location,
   * and structured data that disagreed with the sentence beside it would be
   * describing a page that does not exist.
   */
  const socials = Object.entries(settings.socialLinks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, href]) => href);

  const person = {
    ...personNode({
      socials,
      jobTitle: 'Ecommerce Growth Expert',
      knowsAbout: settings.personKnowsAbout,
    }),
    description: PERSON_DESCRIPTION,
    worksFor: NANO_STORE,
    alumniOf: CAMPUS,
  };

  /**
   * The site-wide `#service` node, plus the two properties only this page
   * adds. Spread rather than re-declared so every shared value — name,
   * description, founder, address, `areaServed` — is byte-identical to the
   * node the rest of the site emits; the two then union into one entity
   * instead of reading as two businesses. `aggregateRating` is absent for the
   * same reason it is absent everywhere on this site: there are no collected
   * reviews behind one.
   */
  const service = {
    ...professionalServiceNode(),
    serviceType: SERVICE_TYPES,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'business inquiries',
      telephone: identity.telephone,
      email: identity.email,
      areaServed: [
        { '@type': 'Country', name: 'Nepal' },
        { '@type': 'City', name: 'Kathmandu' },
      ],
      availableLanguage: ['en', 'ne'],
    },
  };

  /**
   * One graph, one script.
   *
   * Two nodes this page deliberately does **not** carry here:
   *
   *  - `BreadcrumbList` is already emitted by the `Breadcrumb` component this
   *    page renders (Home > About), from the same prop list that draws the
   *    visible trail. A second one in this graph would duplicate it.
   *  - `FAQPage` is not emitted at all. The accordion renders every answer in
   *    the DOM but keeps the closed rows at `height: 0` / `opacity: 0`, so only
   *    the first answer is visible to a reader. Schema has to match visible
   *    content, and a node claiming questions the page appears not to show is
   *    the mismatch Google's own guidance warns about.
   */
  const graph = [
    aboutPageNode({
      name: seo.title,
      description: seo.description,
      aiAnswer: meta?.aiAnswer,
    }),
    person,
    service,
    ...customJsonLdNodes(meta?.customJsonLd),
  ];

  return (
    <>
      <JsonLd graph={graph} />
      <ProfileIntro />
      <Experience data={experience} />
      <Education />
      <Philosophy />
      <FAQ />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = withSeoMeta(aboutSEO, await getSeo('page', 'about'));
  const settings = await getSiteSettings();
  const base = buildMetadata(seo, settings);

  /**
   * `buildMetadata` always returns an object-shaped `openGraph` and a `twitter`
   * object, but both types are unions that include a bare string — hence the
   * narrowing before the spread below.
   */
  const openGraph =
    typeof base.openGraph === 'object' && base.openGraph !== null ? base.openGraph : {};

  /**
   * The image, resolved through the same fallback chain `buildMetadata` uses
   * (page → admin's site default → repo constant), rebuilt here rather than
   * mapped over: the image entry type is `string | URL | descriptor` and only
   * the descriptor carries `alt`, so an explicit literal is both simpler and
   * the one place the alt text can be set to something other than the title.
   */
  const ogImage = normalizeMetadataImage(
    seo.ogImage ?? settings.defaultOgImage ?? DEFAULT_OG_IMAGE,
  );

  /**
   * `index`/`follow` come from the resolved `SEOData` rather than being
   * hardcoded, so an admin `noindex` on this row still wins; the explicit
   * directives only make the site-wide default visible on the page instead of
   * inherited. `max-image-preview: large` is added to the generic tag because
   * the layout puts it on `googlebot` only, and the full-size preview card is
   * the thing it controls.
   */
  const robots =
    typeof seo.robots === 'object' && seo.robots !== null ? seo.robots : {};
  const index = robots.index ?? true;
  const follow = robots.follow ?? true;

  return {
    ...base,
    keywords: KEYWORDS,
    robots: {
      index,
      follow,
      'max-image-preview': 'large',
      googleBot: {
        index,
        follow,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    alternates: {
      canonical: seo.canonical,
      // The site serves one language at one URL, so both hreflang entries
      // point at the same page — an honest declaration of "this is the
      // English page, and it is the Nepali-market English page", rather than
      // a locale path that does not exist.
      languages: { 'en-NP': '/about', en: '/about' },
    },
    other: {
      'geo.region': 'NP-BA',
      'geo.placename': 'Kathmandu',
    },
    openGraph: {
      ...openGraph,
      locale: 'en_NP',
      images: [{ url: ogImage, width: 1200, height: 630, alt: OG_IMAGE_ALT }],
    },
    twitter: {
      ...base.twitter,
      images: [{ url: ogImage, alt: OG_IMAGE_ALT }],
    },
  };
}
