-- Advanced SEO / GEO layer: comparison-table content + AI-answer fields.
--
-- Runs after `20261006001000_seo_admin.sql`. Everything here is
-- `add column if not exists`, so re-running is safe.
--
-- ## Why this migration exists
--
-- The site's own audit (`dipendraguragain.tech-audit/FULL-AUDIT-REPORT.md`) and
-- GEO analysis (`GEO-ANALYSIS.md`) name two gaps as the highest-value content
-- work outstanding:
--
--  - "No tables anywhere on the site. Comparative data … is exactly what gets
--    lifted into AI answers, and tables are the format it lifts most
--    readily."            — GEO-ANALYSIS.md §7
--  - "Zero statistics, zero cited sources … the single biggest reason pages
--    get passed over for AI citation."      — FULL-AUDIT-REPORT.md §3
--
-- Both recommendations are about pages carrying *structured, quotable* content.
-- This adds somewhere to put it.
--
-- ## The split: content columns vs `seo_meta`
--
-- Four of these columns go on `services`, and the rest go on `seo_meta`. The
-- dividing line is who reads them:
--
--  - `services.deliverables / timeline / best_for / from_npr` describe *this
--    service* and only make sense for a service. They are the columns of the
--    comparison table. They belong on the row they describe.
--
--  - `seo_meta.stats / faqs / ai_answer … ` are per-page additions that apply
--    to any entity — a service, a blog post, a project case study, or one of
--    the seven static pages. Putting them on `seo_meta` means all five entity
--    types get them from the overlay every page already loads (`getSeo` →
--    `withSeoMeta`), rather than the same four columns being copied onto four
--    tables and drifting apart.
--
-- ## Everything is nullable and additive
--
-- No default is set on any of these, and every reader treats an absent value as
-- "render exactly what the site renders today". A row written before this
-- migration, and a row whose owner has never opened the panel, are the same
-- thing. That is the contract the rest of the SEO layer already keeps — see
-- the note on `withSeoMeta` in `src/data/seo.ts`.

-- ------------------------------------------------- comparison table content ---

-- What the service actually delivers, as a short list. Distinct from
-- `services.capabilities`, which is the marketing grid ("Technical SEO",
-- "Schema") shown as chips under "What's Included". These are the table's rows
-- and read as deliverables ("A prioritised action list, sequenced by impact").
--
-- Nullable rather than `not null default '{}'`: an empty array would render an
-- empty table, which is worse than no table, and the reader needs to be able to
-- tell "not filled in yet" from "deliberately empty".
alter table public.services
  add column if not exists deliverables text[];

-- Typical duration, as prose ("Typically 3–8 weeks depending on scope").
--
-- Prose and not an interval: the honest answer for most of this work is a range
-- with a dependency attached, and a typed duration would have to be invented to
-- fit the column. `src/data/pricing.ts` already stores its `timeline` this way
-- for the same reason.
alter table public.services
  add column if not exists timeline text;

-- Who the service is for, in one phrase. This is the column that makes the
-- table useful rather than decorative — it is the one that answers "is this
-- me?", and it is the column a comparison table is read for.
alter table public.services
  add column if not exists best_for text;

-- Starting price in whole rupees, or NULL for "Contact for a quote".
--
-- ## Why a number and not a formatted string
--
-- The same figure has to reach three places: the comparison table on
-- `/services`, the `Offer` node in the page's JSON-LD, and eventually the
-- `/pricing` tiers. `priceSpecification.minPrice` in schema.org is a number,
-- and a stored "NPR 45,000" string would have to be parsed back out of its own
-- display formatting to become one. `formatNpr` in `src/data/pricing.ts` is the
-- single place that formatting happens, and it already handles the lakh/crore
-- grouping Nepal uses.
--
-- ## Why NULL is the default and not 0
--
-- `0` is a price. It would render "NPR 0" and, worse, publish a `minPrice` of
-- zero into structured data — telling a search engine this work is free. NULL
-- renders "Contact for a quote", which is what `src/data/pricing.ts` does today
-- and the reason every one of its `fromNpr` values is null.
--
-- ## The relationship to `src/data/pricing.ts`
--
-- That file remains the source for the `/pricing` page. This column is the
-- first link in the chain for the comparison table: the reader prefers a
-- database value and falls back to the matching pricing tier by `serviceSlug`,
-- which is the same DB-first / repo-fallback rule `readAll` in
-- `src/lib/content.ts` applies everywhere else. Pointing `/pricing` at the same
-- resolver is a follow-up; until then the two cannot silently disagree, because
-- one is defined as the fallback for the other.
alter table public.services
  add column if not exists from_npr integer
  constraint services_from_npr_non_negative check (from_npr is null or from_npr >= 0);

-- --------------------------------------------------- per-page GEO additions ---

-- The self-contained answer passage for this page.
--
-- Written to be quotable on its own, in roughly 134–167 words — the passage
-- length AI citations tend to extract, and which
-- `src/data/services.ts` already targets in its `description` field. This is a
-- separate column rather than a reuse of that one because the `description`
-- doubles as the meta description and the answer block under "Overview",
-- whereas this is written specifically to survive being lifted out of the page
-- with no surrounding context.
alter table public.seo_meta
  add column if not exists ai_answer text;

-- Target queries beyond `focus_keyword`, which holds only the one primary.
--
-- Kept as an array so the panel can render one keyword per line and the reader
-- can tell an empty cluster from an unset one. This is the field that makes a
-- page's targeting auditable — `focus_keyword` alone records what a page was
-- aimed at, and says nothing about what it is also expected to pick up.
alter table public.seo_meta
  add column if not exists keyword_cluster text[];

-- Sourced statistics: `[{"label", "value", "source", "url"}]`.
--
-- The audit's §3 finding is that the site publishes no numbers a reader could
-- check, anywhere, and calls that the single biggest reason a page gets passed
-- over for AI citation. A claim with a source attached is quotable; a claim
-- without one is not.
--
-- Constrained to an array, for the same reason `custom_json_ld` is constrained
-- to an object or array: any valid JSON can be stored in a `jsonb` column, and
-- the shape that reaches a renderer has to be one the renderer can walk. The
-- column is the floor rather than the ceiling — the admin panel validates the
-- per-entry keys before saving.
alter table public.seo_meta
  add column if not exists stats jsonb
  constraint seo_meta_stats_shape
  check (stats is null or jsonb_typeof(stats) = 'array');

-- Page-level questions and answers: `[{"question", "answer"}]`.
--
-- **Content only — this deliberately does not emit `FAQPage` schema.** Google
-- retired FAQ rich results for all sites on 2026-05-07, and
-- `src/lib/structured-data.ts` already documents why that node is absent from
-- the graph. What is left is genuinely useful: a question-shaped heading with a
-- self-contained answer underneath is the shape answer engines extract, whether
-- or not any rich result is attached to it. The site's own audit makes this
-- distinction explicitly — "Keep the Q&A *content*, drop the idea of the
-- schema."
alter table public.seo_meta
  add column if not exists faqs jsonb
  constraint seo_meta_faqs_shape
  check (faqs is null or jsonb_typeof(faqs) = 'array');

-- Entity signals: `{"definedTerms": [{"name", "description"}], "knowsAbout": []}`.
--
-- Two things that both widen how an entity is understood:
--
--  - `definedTerms` becomes `DefinedTerm` nodes. The audit recommends this
--    specifically for the AI-search vocabulary (AEO, GEO, LLMO, AIO), which are
--    genuinely ambiguous acronyms that different sources expand differently —
--    saying which one this page means is what lets an answer engine connect the
--    page to the right concept rather than the wrong expansion.
--  - `knowsAbout` adds per-page expertise claims on top of the site-wide list,
--    so a page about ecommerce SEO can say so without every other page claiming
--    it too.
--
-- An object rather than an array, because these are two named sub-lists rather
-- than one list that happens to contain two kinds of thing.
alter table public.seo_meta
  add column if not exists entity_signals jsonb
  constraint seo_meta_entity_signals_shape
  check (entity_signals is null or jsonb_typeof(entity_signals) = 'object');

-- One-line summary for `/llms.txt`, overriding the generated description.
--
-- `llms.txt` is built from the same data the pages render, so it needs no
-- separate copy for most pages. This exists for the pages where the two
-- audiences want different sentences: a meta description is written to earn a
-- click from a search result, and a summary for a language model is written to
-- be restated accurately. Where they differ, this is the one that wins in that
-- file only.
--
-- Standing guidance, unchanged: Google states `llms.txt` is not needed and does
-- not help or hurt Google Search. This is not a ranking lever.
alter table public.seo_meta
  add column if not exists llm_summary text;

notify pgrst, 'reload schema';
