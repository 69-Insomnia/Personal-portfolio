import Script from 'next/script';
import type { AnalyticsConfig } from '@/types';

/**
 * The measurement tags, rendered from whatever the admin has configured.
 *
 * ## GTM is the single loader
 *
 * When a container ID is set, Google Tag Manager is the **only** tag the site
 * loads. GA4 and the Meta Pixel fire as tags *inside* the container — their
 * IDs are pushed onto the `dataLayer` before `gtm.js` evaluates, so container
 * tags can read them as Data Layer Variables instead of hardcoding them twice.
 * Neither `gtag.js` nor `fbevents.js` is ever loaded directly by the site when
 * GTM is present, which is what guarantees nothing fires twice: there is one
 * loader, so a duplicate requires a duplicate *inside the container*, where an
 * operator can see it.
 *
 * The GTM snippet sets `j.async = true`, and is injected with Next's
 * `afterInteractive` strategy — it never blocks first paint.
 *
 * ## GA4 keeps a fallback while no container is configured
 *
 * The live site has always been tracked under the built-in GA4 ID (see
 * `src/data/analytics.ts`), and the `gtm_container_id` column is still blank
 * on this install. Dropping the direct GA4 loader unconditionally would
 * therefore silently delete working analytics on the next deploy. So when —
 * and only when — no valid container is set, the standalone `gtag.js` loader
 * runs instead. The two paths are mutually exclusive by construction, so the
 * fallback cannot double-count against GTM.
 *
 * The Meta Pixel has no fallback: it is pushed to the container's dataLayer
 * and fires from there. A blank container means no pixel, same as before —
 * the field has never been configured.
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
 *
 * The optional pushes run inside the same script, before `gtm.js` is created,
 * so container tags see the IDs on their very first event. Omitting an unset
 * ID keeps `undefined` off the dataLayer.
 */
function gtmSnippet(id: string, ga4?: string, pixel?: string): string {
  const idPushes = [
    ga4 ? `dl.push({ga4MeasurementId:${JSON.stringify(ga4)}});` : '',
    pixel ? `dl.push({metaPixelId:${JSON.stringify(pixel)}});` : '',
  ].join('');
  return `
    var dl=window.dataLayer=window.dataLayer||[];${idPushes}
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${id}');
  `;
}

/**
 * The standalone GA4 loader — the no-container fallback only. Never rendered
 * alongside GTM; see the mutual-exclusion note above.
 */
function gtagSnippet(id: string): string {
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}');
  `;
}

export function Analytics({ config }: { config: AnalyticsConfig }) {
  const ga4 = config.ga4MeasurementId;
  const gtm = config.gtmContainerId;
  const pixel = config.metaPixelId;

  const validGtm = gtm && ID_PATTERNS.gtm.test(gtm) ? gtm : undefined;
  const validGa4 = ga4 && ID_PATTERNS.ga4.test(ga4) ? ga4 : undefined;
  const validPixel = pixel && ID_PATTERNS.metaPixel.test(pixel) ? pixel : undefined;
  // Standalone GA4 runs only while no container is set — see the fallback note.
  const fallbackGa4 = !validGtm ? validGa4 : undefined;

  if (!validGtm && !fallbackGa4) return null;

  return (
    <>
      {validGtm ? (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {gtmSnippet(validGtm, validGa4, validPixel)}
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

      {fallbackGa4 ? (
        <>
          <Script
            id="ga4-loader"
            src={`https://www.googletagmanager.com/gtag/js?id=${fallbackGa4}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-config" strategy="afterInteractive">
            {gtagSnippet(fallbackGa4)}
          </Script>
        </>
      ) : null}
    </>
  );
}
