import Script from 'next/script';
import type { AnalyticsConfig } from '@/types';

/**
 * The measurement tags, rendered from whatever the admin has configured.
 *
 * Previously the GA4 tag was hardcoded into `Footer.tsx`, so it was inseparable
 * from the footer markup and unchangeable without a deploy. The three
 * `site_settings` columns that were meant to control it — `ga4_measurement_id`,
 * `gtm_container_id`, `meta_pixel_id` — were written by the admin panel and
 * read by nothing. See `src/data/analytics.ts` for how the defaults resolve.
 *
 * ## GA4 and GTM are mutually exclusive, deliberately
 *
 * When a GTM container is configured, `gtag.js` is **not** loaded alongside it.
 * That is the convention the two tools assume: GTM is a container, and a GA4
 * configuration tag inside it is the normal way to run Analytics once GTM is
 * present. Loading both would fire `page_view` twice for every visit, and the
 * result — traffic that has silently doubled — is very hard to notice from the
 * dashboard and very easy to notice when someone acts on it.
 *
 * So GTM wins when it is set, and the Analytics panel says so next to the
 * field. The alternative, loading both and trusting the operator to know, puts
 * the mistake in the one place it cannot be detected.
 *
 * Meta Pixel is independent of both: it is a different vendor, and there is no
 * way to detect a pixel deployed through a GTM container from here. A site
 * running the pixel inside GTM should leave the field blank.
 *
 * ## Why the IDs are validated before they are interpolated
 *
 * These values come out of the database and are pasted into inline `<script>`
 * bodies. Only authenticated admins can write them, so this is not a live
 * attack surface — but an ID like `G-1'; alert(1); //` is a typo away from
 * being inserted as executable code on every page, and the failure would be
 * silent and sitewide. Each ID is matched against the format its vendor
 * actually issues, and anything else renders nothing rather than being trusted.
 * A rejected ID also means the tag simply does not appear, which is the same
 * outcome as leaving the field blank and is therefore safe by construction.
 */

const ID_PATTERNS = {
  /** GA4 measurement IDs: `G-` followed by alphanumerics. */
  ga4: /^G-[A-Z0-9]{4,20}$/i,
  /** Tag Manager container IDs: `GTM-` followed by alphanumerics. */
  gtm: /^GTM-[A-Z0-9]{4,20}$/i,
  /** Meta Pixel IDs are numeric. */
  metaPixel: /^[0-9]{10,20}$/,
} as const;

/**
 * The GTM container snippet. Trimmed to the parts that matter and formatted
 * across lines for legibility in view-source.
 */
function gtmSnippet(id: string): string {
  return `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${id}');
  `;
}

function gtagSnippet(id: string): string {
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}');
  `;
}

function metaPixelSnippet(id: string): string {
  return `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window,document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${id}');
    fbq('track', 'PageLoad');
  `;
}

export function Analytics({ config }: { config: AnalyticsConfig }) {
  const ga4 = config.ga4MeasurementId;
  const gtm = config.gtmContainerId;
  const pixel = config.metaPixelId;

  const validGtm = gtm && ID_PATTERNS.gtm.test(gtm) ? gtm : undefined;
  const validPixel =
    pixel && ID_PATTERNS.metaPixel.test(pixel) ? pixel : undefined;
  // Only consulted when GTM is absent — see the mutual-exclusion note above.
  const validGa4 =
    !validGtm && ga4 && ID_PATTERNS.ga4.test(ga4) ? ga4 : undefined;

  if (!validGtm && !validGa4 && !validPixel) return null;

  return (
    <>
      {validGtm ? (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {gtmSnippet(validGtm)}
          </Script>
          {/* The container's fallback for visitors without JavaScript. */}
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${validGtm}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      ) : null}

      {validGa4 ? (
        <>
          <Script
            id="ga4-loader"
            src={`https://www.googletagmanager.com/gtag/js?id=${validGa4}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-config" strategy="afterInteractive">
            {gtagSnippet(validGa4)}
          </Script>
        </>
      ) : null}

      {validPixel ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {metaPixelSnippet(validPixel)}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              alt=""
              src={`https://www.facebook.com/tr?id=${validPixel}&ev=PageLoad&noscript=1`}
            />
          </noscript>
        </>
      ) : null}
    </>
  );
}
