/**
 * Response headers, applied to every route.
 *
 * These are not ranking factors. They are here because a site that sells
 * technical work should not be missing them, and because two of them have a
 * real failure mode rather than a theoretical one: without `nosniff` a browser
 * may guess a content type and execute something it should have downloaded, and
 * without `X-Frame-Options` any site can frame this one and overlay its own
 * controls on top of the contact form.
 *
 * **What is deliberately absent: `Content-Security-Policy`.** A restrictive CSP
 * is the one header on this list that can silently break the site, and a wrong
 * one breaks it in ways that do not reproduce locally. The pages here load
 * Google Fonts through the Next font pipeline, an inline JSON-LD block on every
 * route, inline `style` attributes from Framer Motion, and — once Search
 * Console is wired up — GA4, GTM and the Meta pixel. Each of those needs its
 * own `script-src`/`style-src`/`connect-src` allowance, and getting one wrong
 * either blocks analytics (silently losing data) or blocks hydration (visibly
 * losing the page). It is worth doing, but it is worth doing in Report-Only
 * mode first, which is a separate piece of work with its own testing.
 *
 * `Strict-Transport-Security` is set by Vercel already. It is repeated here so
 * the policy travels with the repo rather than living only in a dashboard, and
 * `preload` is omitted because submission to the preload list is effectively
 * irreversible for every subdomain and should be a deliberate decision.
 */
const securityHeaders = [
  // Stops a browser from re-interpreting a response as a type it was not served
  // as. The SVG logo pipeline (`dangerouslyAllowSVG` above) is the reason this
  // matters more here than on a typical site.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Sends the full URL to same-origin destinations and a bare origin
  // cross-origin, so a full URL with query parameters is not leaked to every
  // third party a page happens to reference.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // No legitimate reason for this site to be embedded in a frame.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // None of these APIs are used. Denying them costs nothing and removes the
  // permission prompts an injected script would otherwise be able to trigger.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

/**
 * The hostname `next/image` is allowed to optimise remote images from.
 *
 * ## Without this, every image uploaded through /admin is invisible
 *
 * The upload control on the post and project forms stores a Supabase Storage
 * URL — `https://<project-ref>.supabase.co/storage/v1/object/public/media/…` —
 * and `BlogCard`, `ProjectCard` and `ImageLightbox` all render that value
 * through `next/image`. Next **refuses any remote src whose hostname is not
 * listed here**, and it refuses loudly: `Invalid src prop … is not configured
 * under images`. The page throws rather than showing a broken image, and
 * nothing in the admin panel suggests why.
 *
 * Every other image on this site is a file committed to `public/`, which is
 * why no `remotePatterns` entry was ever needed. The comment in `SeoPanel`
 * about routing an arbitrary admin-entered URL through the optimiser having to
 * "throw for any host not on that list" describes this exact mechanism — the
 * list simply never existed, because until uploads were added nothing needed
 * it.
 *
 * ## Why the project host is resolved rather than wildcarded
 *
 * `NEXT_PUBLIC_SUPABASE_URL` names the one project whose storage this site
 * writes to, so the pattern can be exact. The `?? '*.supabase.co'` is a floor
 * for the case where the variable is not visible when this file is evaluated
 * — a missing pattern here is a broken page, which is a far worse failure than
 * a pattern that is one project too broad.
 *
 * ## The gap this does not close
 *
 * The image field is free text, so an image pasted from an unrelated host will
 * still throw. Anything that lands there from the upload control is covered;
 * an arbitrary external URL is not. See the note on `BlogCard` if that needs
 * handling.
 */
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').hostname || null;
  } catch {
    return null;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Scope Turbopack to this repo. Without it, the parent folder's package.json
  // (outside this git repo) is picked up and Turbopack refuses to use it.
  turbopack: { root: import.meta.dirname },

  // Removes the `X-Powered-By: Next.js` header. Worth nothing on its own — the
  // markup makes the framework obvious — but it is one less version-adjacent
  // detail handed to anything scanning for known CVEs.
  poweredByHeader: false,

  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHost ?? '*.supabase.co',
        // Scoped to public storage objects rather than the whole host, so this
        // cannot be used to proxy the Supabase API or a signed private URL.
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  async headers() {
    return [
      {
        // Every route, including the hashed asset paths — a header that covered
        // only the HTML would leave the JSON responses (`/llms.txt`,
        // `/sitemap.xml`, the RSC payloads) sniffable.
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
