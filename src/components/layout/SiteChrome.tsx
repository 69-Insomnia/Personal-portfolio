import type { ReactNode } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { SiteJsonLd } from '@/components/common/JsonLd';

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
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      {/* JSON-LD is valid anywhere in the document; Google parses it from the
          body. It is scoped to the site rather than the root layout so the
          admin panel doesn't ship Person/WebSite structured data. */}
      <SiteJsonLd />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
