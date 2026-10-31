-- ============================================================================
-- 01-bug-fixes.sql  —  PROPOSED, NOT APPLIED
-- ============================================================================
--
-- Task 1's eight items, split by whether they can be written without reading
-- the database first.
--
--   WRITTEN BELOW      item 1 (GEO post @id), item 3 (title whitespace),
--                      item 4 (stray "16" in the stats label)
--   WRITTEN IN 02      item 5 (truncated descriptions), item 7 (keyword
--                      overlap, partly)
--   BLOCKED            item 2 (routing — needs the redirects table),
--                      item 6 (price conflicts — needs the schema blobs and
--                      the FAQ text), item 8 (columns do not exist — see below)
--
-- Every statement here is idempotent and every one is scoped by a WHERE clause
-- that matches on a pattern rather than on an assumed literal, so a statement
-- that has already run changes nothing and a value that differs from what the
-- brief described is left alone rather than mangled.
-- ============================================================================

begin;

-- =============================================================== item 1 =====
-- The GEO post's custom_json_ld points at /blog/geo-vs-seo-ai-search, which is
-- not this post's URL. The real slug is
-- geo-vs-seo-how-to-get-your-website-cited-by-ai-search.
--
-- Its own canonical_override is presumably already correct, so the structured
-- data and the canonical disagree about where the page lives — which is the
-- exact contradiction the sitemap's `excluded()` guard exists to avoid.
--
-- This rewrites every occurrence of the wrong path inside the jsonb, at any
-- depth, rather than patching `@id` and `url` by key. The node is a nested
-- object and a key-by-key fix would miss any second reference (a `mainEntityOfPage`,
-- a nested `@id`) — and the failure would be silent.
update public.seo_meta
set custom_json_ld = replace(
      custom_json_ld::text,
      '/blog/geo-vs-seo-ai-search',
      '/blog/geo-vs-seo-how-to-get-your-website-cited-by-ai-search'
    )::jsonb
where entity_type = 'post'
  and entity_slug = 'geo-vs-seo-how-to-get-your-website-cited-by-ai-search'
  and custom_json_ld is not null
  and custom_json_ld::text like '%/blog/geo-vs-seo-ai-search%';

-- TODO(verify): the post's own `canonical_override` is NOT touched by the
-- statement above. Confirm it equals
-- https://dipendraguragain.tech/blog/geo-vs-seo-how-to-get-your-website-cited-by-ai-search
-- and if it does not, that is a separate fix.

-- =============================================================== item 3 =====
-- Titles carrying a double space, and digital-marketing missing "in" before
-- "Kathmandu".
--
-- Matched by pattern rather than by an exact old string, because I have not
-- seen the rows and an exact-string UPDATE against a value that turns out to be
-- slightly different is a no-op that looks like a success.
--
-- Order matters: fix the phrase first (it contains the double space), then
-- collapse whatever whitespace is left.

-- 3a. "Specialist  Kathmandu" -> "Specialist in Kathmandu".
--     Scoped to titles, and to the exact two-word junction, so a legitimately
--     different title is not rewritten.
update public.services
set title = replace(title, 'Specialist  Kathmandu', 'Specialist in Kathmandu')
where title like '%Specialist  Kathmandu%';

-- 3b. The same junction with a single space — "Specialist Kathmandu" is also
--     missing its preposition and reads as a typo in a page title.
update public.services
set title = replace(title, 'Specialist Kathmandu', 'Specialist in Kathmandu')
where title like '%Specialist Kathmandu%'
  and title not like '%Specialist in Kathmandu%';

-- 3c. Collapse any remaining run of whitespace in a service title to one space,
--     and trim the ends. This is the general guard for the whitespace half of
--     the item and is a no-op on titles that are already clean.
update public.services
set title = btrim(regexp_replace(title, '\s+', ' ', 'g'))
where title <> btrim(regexp_replace(title, '\s+', ' ', 'g'));

-- 3d. Trailing whitespace inside custom_json_ld "name" fields.
--     Same reasoning as item 1: rewrite through the text form so a `name` at
--     any depth is covered, because the brief does not say which nodes are
--     affected.
--
--     This only trims the ends of the whole jsonb text, which is NOT the same
--     as trimming every string value. Doing that properly needs a recursive
--     walk, which is not worth a stored-procedure-shaped UPDATE for a cosmetic
--     issue.
-- TODO(verify): if the trailing spaces are inside string VALUES rather than
-- around the document, send me one affected row and this becomes a targeted
-- jsonb_set instead of a guess.

-- =============================================================== item 4 =====
-- The web-development stats entry reads "internet users in Nepal, October
-- 202516". The "16" is a stray — most likely a year that was edited from 2016
-- and left a digit behind.
--
-- Rewritten by walking the jsonb array and repairing the matching label, with
-- `order by ordinality` so the entries keep their order. `jsonb_agg` over an
-- empty set returns NULL, so the GROUP BY only reaches rows that have a stats
-- array containing the bad label — the WHERE EXISTS guard makes that explicit
-- rather than relying on aggregate behaviour.
update public.seo_meta
set stats = fixed.rebuilt
from (
  select
    m.id,
    jsonb_agg(
      case
        when element ->> 'label' like '%October 202516%'
          then jsonb_set(
                 element,
                 '{label}',
                 to_jsonb(replace(element ->> 'label', 'October 202516', 'October 2025'))
               )
        else element
      end
      order by position
    ) as rebuilt
  from public.seo_meta m
  cross join lateral jsonb_array_elements(m.stats) with ordinality as t(element, position)
  where m.entity_type = 'service'
    and m.entity_slug = 'web-development'
    and m.stats is not null
  group by m.id
) as fixed
where public.seo_meta.id = fixed.id
  and exists (
    select 1
    from jsonb_array_elements(public.seo_meta.stats) as e
    where e ->> 'label' like '%October 202516%'
  );

-- ==================================================== item 8 — DOES NOT APPLY =
-- Task 1 item 8 asks to "Fill services.price_from / price_currency from the
-- confirmed prices (NULL where blank)".
--
-- Neither column exists. The schema — supabase/migrations/20261010001000_seo_geo_layer.sql
-- and every generated copy of it — adds exactly one pricing column:
--
--     alter table public.services
--       add column if not exists from_npr integer
--       constraint services_from_npr_non_negative check (from_npr is null or from_npr >= 0);
--
-- There is no `price_currency`, and the currency is not stored at all: NPR is
-- implied by the column name and by `formatNpr` in src/data/pricing.ts, which
-- is the only place the value is formatted.
--
-- So the statement you want is this, and it cannot run until you supply the
-- figures. `from_npr` is NULL by default, which already renders "Contact for a
-- quote", so doing nothing is a valid state and a wrong number is not:
--
-- update public.services set from_npr = <figure> where slug = 'web-development';
-- update public.services set from_npr = <figure> where slug = 'seo-services';
-- update public.services set from_npr = <figure> where slug = 'ai-search';
-- update public.services set from_npr = <figure> where slug = 'meta-ads';
-- update public.services set from_npr = <figure> where slug = 'google-ads';
-- update public.services set from_npr = <figure> where slug = 'ecommerce-growth';
-- update public.services set from_npr = <figure> where slug = 'digital-marketing';
--
-- NOTE the slug in the second line. See item 2.
--
-- Setting these also changes two other surfaces without further edits, because
-- both read the same resolver (`serviceStartingPrice`):
--   - the comparison table on /services
--   - `priceSpecification.minPrice` in each service page's Offer JSON-LD
-- and the second one is why a wrong figure matters more than a missing one.

-- ==================================================== item 6 — THE BLANK PATH ==
-- All seven service prices and the audit price are blank in your brief, and
-- blank means "no number anywhere". So the required change is not to substitute
-- a corrected figure — it is to REMOVE the figures that are there and replace
-- the FAQ sentences that quote them.
--
-- That is writable without reading the rows, because removing a key needs no
-- knowledge of where it sits. The clip below walks a jsonb document of any
-- shape and drops every occurrence of a named key, at any depth.
--
-- ## Why a helper function, when the brief asked for UPDATE statements
--
-- This is the one place in this file that is not a plain UPDATE, and it is
-- worth flagging rather than slipping in. `jsonb` has no "remove this key
-- wherever it appears" operator — `#-` takes a fixed path, and the path is
-- exactly what I have not seen. The alternatives were:
--
--   (a) guess the path (`{offers,priceSpecification}`) and be wrong silently
--   (b) delete the whole custom_json_ld on every service row, losing the
--       @id/url/isPartOf structure that makes the node worth having
--   (c) this
--
-- (c) is additive and reversible: dropping the function at the end of the file
-- leaves the database as it was. If you would rather not add a function, the
-- equivalent by hand is to read one affected `custom_json_ld`, find the key,
-- and write a `#-` path — which is what I would do with the backup in hand.
--
-- **UNTESTED.** I could not run this. Review the shape before executing.

create or replace function public.seo_strip_key(doc jsonb, target text)
returns jsonb
language sql
immutable
as $$
  select case jsonb_typeof(doc)
    when 'object' then coalesce((
      select jsonb_object_agg(key, public.seo_strip_key(value, target))
      from jsonb_each(doc) as entry(key, value)
      where key <> target
    ), '{}'::jsonb)
    when 'array' then coalesce((
      select jsonb_agg(public.seo_strip_key(element, target))
      from jsonb_array_elements(doc) as element
    ), '[]'::jsonb)
    else doc
  end;
$$;

-- 6a. Drop the price block from every service's structured data.
--
-- `priceSpecification` is the schema.org wrapper the brief's minPrice values sit
-- inside. `minPrice` is stripped as well, so an Offer carrying the number
-- directly rather than through a specification is covered too. Stripping a key
-- that is not present is a no-op, so running both is safe and neither needs the
-- other to have matched.
update public.seo_meta
set custom_json_ld = public.seo_strip_key(custom_json_ld, 'priceSpecification')
where entity_type = 'service'
  and custom_json_ld is not null
  and custom_json_ld::text like '%priceSpecification%';

update public.seo_meta
set custom_json_ld = public.seo_strip_key(custom_json_ld, 'minPrice')
where entity_type = 'service'
  and custom_json_ld is not null
  and custom_json_ld::text like '%minPrice%';

-- 6b. Replace any FAQ sentence that quotes a price.
--
-- `faqs` has a known shape — `[{"question","answer"}]` — so this needs no
-- helper. The pattern matches one sentence containing NPR or Rs. followed by
-- digits, and `[^.]*` cannot cross a full stop, so it replaces the price
-- sentence rather than swallowing the ones around it.
--
-- The replacement is your own wording from the brief:
--   "Pricing depends on scope. Send a short brief for a quote."
update public.seo_meta
set faqs = fixed.rebuilt
from (
  select
    m.id,
    jsonb_agg(
      case
        when faq.value ->> 'answer' ~* '(from\s+NPR|NPR\s*[\d,]+|Rs\.?\s*[\d,]+)'
          then jsonb_set(
                 faq.value,
                 '{answer}',
                 to_jsonb(regexp_replace(
                   faq.value ->> 'answer',
                   '[^.]*(from\s+NPR|NPR\s*[\d,]+|Rs\.?\s*[\d,]+)[^.]*\.',
                   'Pricing depends on scope. Send a short brief for a quote.',
                   'gi'
                 ))
               )
        else faq.value
      end
      order by position
    ) as rebuilt
  from public.seo_meta m
  cross join lateral jsonb_array_elements(m.faqs) with ordinality as faq(value, position)
  where m.faqs is not null
  group by m.id
) as fixed
where public.seo_meta.id = fixed.id
  and exists (
    select 1
    from jsonb_array_elements(public.seo_meta.faqs) as f
    where f ->> 'answer' ~* '(from\s+NPR|NPR\s*[\d,]+|Rs\.?\s*[\d,]+)'
  );

-- 6c. The same figures can appear in a service row's own copy, which is
--     file-owned and therefore NOT correctable from here.
--
--     `services.description`, `services.body` and `services.short_description`
--     are all rewritten by scripts/sync-content.ts on every run, so a statement
--     here would be reverted. If a price appears in any of them, it has to be
--     removed in src/data/services.ts and synced. See 04-file-content.md.
--
-- TODO(verify): once the backup exists, grep services.description and
-- services.body for NPR/Rs. figures and report them rather than editing them.

-- Optionally remove the helper once the two statements above have run:
-- drop function if exists public.seo_strip_key(jsonb, text);

-- ====================== item 6, second half — STILL BLOCKED ==================
-- The blank path above is written. What is still missing is the **audit table**
-- you asked for: every price found, where it lives, its old value, and its new
-- value. Producing that means reading each figure out of the `custom_json_ld`
-- and `faqs` blobs, and I have not seen either.
--
-- The figures your brief already gave me, recorded here so the reconciliation
-- has somewhere to start:
--
--   ai-search          45000
--   digital-marketing   5000
--   ecommerce-growth   45000
--   google-ads          2000
--   meta-ads            1000
--   seo-services       45000
--   web-development    45000
--
-- and the contradiction: the ai-search FAQ says "from NPR 10,000" while its
-- schema figure is 45,000. Statement 6b above resolves that specific case by
-- removing the sentence entirely — but only if "from NPR 10,000" sits in a
-- `faqs` entry. If it sits in `services.description` or `services.body` instead,
-- it is file-owned and 6b cannot reach it. See 6c.
--
-- The table itself comes with the backup.

-- =============================================== item 2 — BLOCKED, but read this =
-- The /services/seo vs /services/seo-services question. I cannot read the
-- `redirects` table, so I cannot tell you which URL resolves today. But the
-- mechanism is already in the code and it is worth knowing exactly what it does
-- before you decide what to change.
--
-- src/app/services/[slug]/page.tsx resolves in this order:
--
--     const live = await getService(slug);              // database
--     const service = live ?? getServiceBySlug(slug);   // static fallback
--     if (!service) { redirect lookup; notFound(); }    // nothing anywhere
--     if (!live)    { redirect lookup; permanentRedirect(target); }  // static only
--
-- So for slug = 'seo':
--   - `live` is undefined, because the database row is 'seo-services'
--   - `service` resolves anyway, from src/data/services.ts, which still carries
--     the old slug
--   - the second guard fires and consults `redirects` for /services/seo
--
-- Which means one of two things is true right now, and only the redirects table
-- says which:
--
--   (a) a redirect row exists for /services/seo -> /services/seo-services,
--       and the URL 308s correctly. The page is fine; the static file is stale.
--   (b) no row exists, and /services/seo serves a 200 with the STATIC file's
--       content while /services/seo-services serves 200 with the DATABASE's.
--       Two live URLs, different content, each canonicalising to itself.
--
-- The page's own comment describes (b) happening in production, and names the
-- cause: "the static fallback then shadowed it". `generateStaticParams` makes it
-- worse by pre-rendering BOTH slugs, taking the union of the file and the table.
--
-- The root cause is not the redirect. It is that src/data/services.ts still
-- lists the service as `seo` while the database says `seo-services`. Fixing the
-- file fixes the shadowing at source, and it is a code change, not SQL — it is
-- written up in 04-file-content.md, section 5.
--
-- DO NOT write a redirect until you have read the redirects table. Adding a
-- second row for a URL that already redirects is how a chain gets built, and
-- the table has chain-collapsing triggers precisely because that happens.

commit;

-- ============================================================================
-- AFTER THE BACKUP LANDS
-- ============================================================================
-- item 2  read `redirects` for /services/seo, and report which of (a)/(b) holds
-- item 6  full price table: location, old value, new value, reason
-- item 7  reconcile the four keyword_cluster assignments in 02 against the
--         existing eleven rows
-- item 1  confirm the GEO post's canonical_override matches its real URL
-- item 4  confirm the stats label now reads "October 2025" and nothing else on
--         that row was disturbed
-- ============================================================================
