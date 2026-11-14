import type { AnalyticsConfig } from '@/types';

/**
 * The analytics IDs the site ships with, and why they live in the repo.
 *
 * These three are editable in `/admin/seo` (`ga4_measurement_id`,
 * `gtm_container_id`, `meta_pixel_id`) and resolved here DB-first: a value in
 * the database wins, a blank column falls back to the repo default. See
 * `src/components/common/Analytics.tsx` for how each ID is loaded.
 *
 * ## Why the GA4 default is a real measurement ID
 *
 * The live site has always been tracked under `G-DVZRS8DRWT`, while the
 * database column is blank on this install. A DB-only implementation would
 * therefore delete working analytics on the next deploy and give no indication
 * that it had. So the repo holds the current value as the default — the same
 * DB-first / repo-fallback rule the rest of the site follows (see `readAll`
 * in `src/lib/content.ts`), and an install that has never opened the
 * analytics panel keeps tracking exactly as it does today.
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
