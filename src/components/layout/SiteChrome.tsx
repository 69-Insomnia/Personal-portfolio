import type { ReactNode } from 'react';
import { Analytics } from '@/components/common/Analytics';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { SiteJsonLd } from '@/components/common/JsonLd';
import type { AnalyticsConfig } from '@/types';
import type { PersonOverrides } from '@/lib/structured-data';

/**
 * The public site's chrome, in one place.
 *
 * It lives here rather than in the root layout because `/admin` shares that
 * layout — when the Navbar and Footer were rendered there, every admin page
 * got the public navigation and footer wrapped around its own header. The
 * root layout is now a bare document shell and this is applied only by the
 * `(site)` route group.
 *
 * The 404 needs the same chrome, and it resolves at the root not-found
 * boundary rather than inside `(site)`, so it renders this directly.
 *
 * ## Why every admin value arrives as a prop
 *
 * This sits below `ConditionalChrome`, which is a client component, so nothing
 * here can await a database read. The root layout — the one server component
 * above the boundary — does the read and threads the values down. That is why
 * `socialLinks`, `analytics`, `person` and `customJsonLd` are all parameters
 * rather than lookups, and why each is optional: omitting one falls back to
 * the repo constant, so the site renders correctly even when the database is
 * unreachable.
 *
 * `Analytics` is mounted here rather than inside `Footer` because the GA4 tag
 * used to be hardcoded into the footer markup, which coupled measurement to a
 * layout component and made the tag impossible to change without a deploy.
 */
export function SiteChrome({
  children,
  socialLinks,
  analytics,
  person,
  customJsonLd,
}: {
  children: ReactNode;
  /** Admin-configured `sameAs` profiles. */
  socialLinks?: string[];
  /** Resolved measurement IDs — see `resolveAnalytics`. */
  analytics?: AnalyticsConfig;
  /** Admin overrides for the Person node's jobTitle and knowsAbout. */
  person?: Omit<PersonOverrides, 'socials'>;
  /** Site-wide custom JSON-LD, merged into the base graph. */
  customJsonLd?: unknown;
}) {
  return (
    <>
      {/* JSON-LD is valid anywhere in the document; Google parses it from the
          body. It is scoped to the site rather than the root layout so the
          admin panel doesn't ship Person/WebSite structured data. */}
      <SiteJsonLd
        socialLinks={socialLinks}
        person={person}
        customJsonLd={customJsonLd}
      />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      {analytics ? <Analytics config={analytics} /> : null}
    </>
  );
}
