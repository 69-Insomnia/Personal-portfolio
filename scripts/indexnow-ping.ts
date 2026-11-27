/**
 * Submits every URL in the live sitemap to IndexNow (Bing, Yandex, Seznam,
 * Naver — and the AI products that read Bing's index), so changed pages are
 * recrawled within minutes instead of on the engine's own schedule.
 *
 * The key is public by design: IndexNow verifies ownership by fetching
 * `https://<host>/<key>.txt`, which is served from `public/`. That file must
 * be deployed before this script will succeed (a 403/422 means it is not live
 * yet).
 *
 * Run after a deploy that changed content:
 *   npx tsx scripts/indexnow-ping.ts
 */
const HOST = 'dipendraguragain.tech';
const KEY = '26448f621e88ef12d983e65933b14b26';

async function sitemapUrls(): Promise<string[]> {
  const res = await fetch(`https://${HOST}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function main() {
  const keyCheck = await fetch(`https://${HOST}/${KEY}.txt`);
  if (!keyCheck.ok || (await keyCheck.text()).trim() !== KEY) {
    throw new Error(
      `Key file https://${HOST}/${KEY}.txt is not live yet (status ${keyCheck.status}). Deploy first.`,
    );
  }

  const urlList = await sitemapUrls();
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList,
    }),
  });

  // 200 = accepted, 202 = accepted pending key verification.
  console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URLs`);
  if (res.status >= 300) {
    console.error(await res.text());
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
