/** @type {import('next').NextConfig} */
const nextConfig = {
  // Scope Turbopack to this repo. Without it, the parent folder's package.json
  // (outside this git repo) is picked up and Turbopack refuses to use it.
  turbopack: { root: import.meta.dirname },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
