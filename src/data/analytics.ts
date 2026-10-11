import type { AnalyticsConfig } from '@/types';

/**
 * The analytics IDs the site ships with, and why they live in the repo.
 *
 * These three are editable in `/admin/seo` (`ga4_measurement_id`,
 * `gtm_container_id`, `meta_pixel_id`), and until now **none of them were read
 * by anything**. The GA4 tag was hardcoded in two places — once in
 * `src/components/navigation/Footer.tsx`, which is the copy that actually
 * shipped, and once in an orphaned `src/components/common/GoogleAnalytics.tsx`
 * that no file imported. The GTM and Meta Pixel columns had no consumer at all.
 *
 * So the admin panel offered three fields, stored whatever was typed into them,
 * and changed nothing on the site.
 *
 * ## Why the GA4 default is a real measurement ID
 *
 * The obvious fix — read the columns, render nothing when they are empty — is
 * wrong here, and would have been a regression rather than a repair. The live
 * site is currently tracked under `G-DVZRS8DRWT`, hardcoded. The database
 * column is `NULL`, because the seed never set it. A DB-only implementation
 * would therefore have deleted working analytics on the next deploy and given
 * no indication that it had.
 *
 * So the repo holds the current value as the default, and the database
 * overrides it when set. This is the same DB-first / repo-fallback rule the
 * rest of the site already uses — see `readAll` in `src/lib/content.ts` — and
 * it means an install that has never opened the analytics panel keeps tracking
 * exactly as it does today.
 *
 * GTM and Meta Pixel have no default because they have never been configured.
 * They are `undefined`, and an undefined ID renders nothing at all — which is
 * the correct behaviour for a tag that has never been installed.
 */
export const defaultAnalytics: AnalyticsConfig = {
  ga4MeasurementId: 'G-DVZRS8DRWT',
};

/**
 * Merges the admin's values over the repo's, treating blank as unset.
 *
 * `||` rather than `??` deliberately: the admin panel stores an empty string
 * when a field is cleared, and an empty `src` would produce a request to
 * `gtag/js?id=` rather than no tag at all. Blank means "use the default", same
 * as everywhere else in the SEO layer.
 */
export function resolveAnalytics(settings: {
  ga4MeasurementId?: string;
  gtmContainerId?: string;
  metaPixelId?: string;
}): AnalyticsConfig {
  return {
    ga4MeasurementId: settings.ga4MeasurementId || defaultAnalytics.ga4MeasurementId,
    gtmContainerId: settings.gtmContainerId || defaultAnalytics.gtmContainerId,
    metaPixelId: settings.metaPixelId || defaultAnalytics.metaPixelId,
  };
}
