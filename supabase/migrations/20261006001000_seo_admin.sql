-- Additive schema for the SEO admin panels.
--
-- Runs after `20261005001000_seo_layer.sql`, which created `seo_meta`,
-- `redirects` and `site_settings`. Everything here is `if not exists` or
-- `add column if not exists`, so re-running is safe.
--
-- Four things, one per admin module that needed storage it did not have:
--
--  1. `site_settings.social_links`  — the global panel's social handles.
--  2. `*.custom_json_ld`            — the JSON-LD panel's raw injection.
--  3. `site_settings.default_meta_title` — the global title fallback.
--  4. `public.media`                — uploads, with alt text the DATABASE
--                                     refuses to store blank.

-- ------------------------------------------------------- global SEO panel ---

-- Social handles move out of `src/data/profile.ts` so the admin can add a
-- YouTube channel or a new profile without a deploy.
--
-- Stored as an object keyed by platform (`{"github": "https://…"}`) rather
-- than an array of URLs, because the key is what lets the panel render a
-- labelled field per platform and what lets `sameAs` stay ordered. An array
-- would lose which URL is which, and `sameAs` order feeds entity resolution.
--
-- `not null default '{}'` and not `null`: an empty object is the honest
-- representation of "no handles set", and it means the reader never has to
-- distinguish null from empty.
alter table public.site_settings
  add column if not exists social_links jsonb not null default '{}'::jsonb;

-- Raw JSON-LD the admin pastes in, merged into the page's graph.
--
-- `jsonb` rather than `text` so the database rejects malformed JSON at write
-- time rather than the page throwing at render time. That is the difference
-- between a save that fails visibly in the admin and a page that 500s for
-- every visitor until someone notices.
--
-- Valid JSON is not the same as *sensible* schema, so the panel additionally
-- checks the shape before saving. The column is the floor, not the ceiling.
alter table public.site_settings
  add column if not exists custom_json_ld jsonb;

-- The site-wide title fallback, used when a page has no title of its own.
-- `title_suffix` (which already exists) is the appended brand string; this is
-- the standalone title for routes that do not set one.
alter table public.site_settings
  add column if not exists default_meta_title text;

-- ------------------------------------------------------------ JSON-LD ------

-- Per-entity JSON-LD, for the cases the generated nodes cannot cover: a
-- `CreativeWork` with custom `award` or `citation`, a `Person` with
-- `alumniOf`, an `Event` for a talk.
--
-- Constrained to an object or array of objects, never a scalar. `'42'::jsonb`
-- is valid JSON and would be merged into an `@graph` as a bare number, which
-- produces a graph no validator can make sense of. Rejecting it here is
-- cheaper than explaining it later.
alter table public.seo_meta
  add column if not exists custom_json_ld jsonb
  constraint seo_meta_custom_json_ld_shape
  check (custom_json_ld is null or jsonb_typeof(custom_json_ld) in ('object', 'array'));

-- ---------------------------------------------------------------- media ----

-- Uploads, with alt text enforced by the database.
--
-- ## Why `alt` is NOT NULL with a check
--
-- The requirement was that alt text be mandatory before an image can be
-- saved. Enforcing that in the form alone would be a suggestion — it holds
-- only for uploads that go through the form, and this project already has two
-- other writers (`scripts/sync-content.ts` and the Supabase table editor).
-- A `not null` plus `length(btrim(alt)) > 0` holds for every writer there
-- will ever be, and it is the only version of this rule that cannot be
-- bypassed by adding a new code path later.
--
-- `btrim` matters: `'   '` passes a bare `<> ''` check and is exactly the
-- value a hurried upload produces.
--
-- ## Why a separate table rather than `image_alt` columns
--
-- `src/utils/images.ts` documents why alt text was a code-side lookup keyed
-- by slug: a column would be null for every row that existed at the time.
-- That reasoning was right then and is still right for those rows. This table
-- is additive — the reader prefers a `media` row when one exists and falls
-- back to that same lookup when it does not, so nothing that renders today
-- changes and every new upload has to carry real alt text.
create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Path inside the `media` storage bucket, or an absolute URL for assets
  -- that live elsewhere (the existing `/images/*` files in `public/`).
  src         text not null unique check (length(btrim(src)) > 0),

  -- The whole point of the table. See the note above.
  alt         text not null check (length(btrim(alt)) > 0),

  -- Intrinsic dimensions, so the admin can warn about a missing size before
  -- it becomes a CLS problem on the public site. Nullable because an
  -- absolute URL to someone else's asset cannot be measured at insert time.
  width       integer check (width is null or width > 0),
  height      integer check (height is null or height > 0),
  mime_type   text,
  bytes       bigint check (bytes is null or bytes >= 0),

  -- Optional attribution. `site` covers the default OG image and favicons,
  -- which belong to no single entity.
  entity_type text check (entity_type in ('project', 'post', 'service', 'page', 'site')),
  entity_slug text,

  uploaded_by uuid references auth.users (id) on delete set null,

  -- An `alt` that merely restates the filename is the most common way to
  -- satisfy a mandatory-alt rule without writing useful alt text. Rejecting
  -- an exact match with the filename stem is a cheap nudge that costs nothing
  -- legitimate — a real description is never identical to `hero-final-v2`.
  constraint media_alt_not_filename
    check (alt <> regexp_replace(src, '^.*/|\.[a-z0-9]+$', '', 'gi'))
);

create index if not exists media_entity_idx on public.media (entity_type, entity_slug);
create index if not exists media_created_idx on public.media (created_at desc);

drop trigger if exists touch_media on public.media;
create trigger touch_media before update on public.media
  for each row execute function public.touch_updated_at();

alter table public.media enable row level security;

-- Public read: the site serves these images to anonymous visitors, and alt
-- text is read on the server through the same anon key as every other reader.
grant all on public.media to anon, authenticated;

drop policy if exists "media public read" on public.media;
create policy "media public read" on public.media
  for select to anon, authenticated using (true);

drop policy if exists "media admin write" on public.media;
create policy "media admin write" on public.media
  for all to authenticated using (true) with check (true);

-- -------------------------------------------------------- storage bucket ---

-- The bucket uploads land in. Public because these are portfolio images
-- served to anonymous visitors; a private bucket would mean signing every URL
-- and giving up caching.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Storage has its own RLS, on `storage.objects`, separate from the table
-- policies above. Without these two the upload fails and the row insert
-- succeeds, which produces a media record pointing at a file that was never
-- written — so they are required, not optional.
drop policy if exists "media bucket public read" on storage.objects;
create policy "media bucket public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

drop policy if exists "media bucket admin write" on storage.objects;
create policy "media bucket admin write" on storage.objects
  for all to authenticated
  using (bucket_id = 'media') with check (bucket_id = 'media');
