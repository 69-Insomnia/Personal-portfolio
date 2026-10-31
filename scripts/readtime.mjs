import { readFileSync } from 'node:fs';
const src = readFileSync('src/data/blog.ts', 'utf8');
const start = src.indexOf("slug: 'meta-ads-whatsapp-chats-nepal'");
const end = src.indexOf("slug: 'technical-seo-foundations'");
const seg = src.slice(start, end);
// Extract string literals (single-quoted, apostrophes escaped as \u2019 so no raw ')
const strings = seg.match(/'((?:[^'\\]|\\u[0-9a-fA-F]{4})*)'/g) || [];
// Drop the slug/title/excerpt/etc by counting only content+faqs region is complex;
// instead count words in all string literals except obvious metadata ones.
const words = strings
  .map((s) => s.slice(1, -1))
  .filter((s) => s.length > 3 && !/^(Meta Ads|WhatsApp Marketing|Ecommerce|Nepal|Paid Social|meta-ads|30 October 2026|7 min read|\/og-image\.png)$/.test(s))
  .join(' ')
  .split(/\s+/)
  .filter(Boolean).length;
console.log('approx words:', words);
console.log('reading time (words/200, ceil):', Math.ceil(words / 200), 'min');
