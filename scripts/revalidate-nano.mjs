import { readFileSync } from 'node:fs';

const env = readFileSync('.env.local', 'utf8');
const get = (k) => {
  const v = env.match(new RegExp(`^${k}=(.*)$`, 'm'))?.[1]?.trim();
  return v ? v.replace(/^['"]|['"]$/g, '') : '';
};

const url = get('NEXT_PUBLIC_SUPABASE_URL');
const key = get('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
const email = get('ADMIN_EMAIL');
const password = get('ADMIN_PASSWORD');
if (!url || !key || !email || !password) throw new Error('missing env');

const authRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { apikey: key, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const auth = await authRes.json();
if (!authRes.ok) {
  console.error('auth failed:', authRes.status, JSON.stringify(auth).slice(0, 300));
  process.exit(1);
}

const paths = [
  '/',
  '/work',
  '/work/nano-store-ecommerce-seo',
  '/work/drillthru',
  '/work/trip-zone',
  '/work/starglobalvision',
  '/work/poms-penthouse',
  '/services/seo-services',
  '/services/ecommerce-growth',
  '/sitemap.xml',
];

const res = await fetch('https://dipendraguragain.tech/api/admin/revalidate', {
  method: 'POST',
  headers: { Authorization: `Bearer ${auth.access_token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ paths }),
});
console.log(res.status, await res.text());
