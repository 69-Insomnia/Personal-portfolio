-- SEO layer: seo_meta, redirects, site_settings, media
-- Paste ALL of this into Supabase Dashboard > SQL Editor and click Run.
-- Safe to run more than once. Does not touch admin users.
--
-- NOTE: this script is superseded by the migrations in supabase/migrations/,
-- which are the canonical record and are also mirrored into combined.sql. It is
-- kept only as a standalone paste for a database that has not had them applied.
-- Prefer combined.sql, which now includes this layer and everything after it.

-- seo_meta was once created here with a partial column set (og_image_url,
-- canonical_url, json_ld, …) that the admin panel never sends, so every save
-- failed. The old fix was `drop table if exists public.seo_meta cascade;`
-- followed by a clean rebuild — reasonable while the table was empty, and
-- destructive now. It would delete every override in the database, and every
-- column added since, including the ones in
-- `20261010001000_seo_geo_layer.sql`.
--
-- The repair is additive instead. Stale columns are dropped by name, the
-- columns the application actually reads are added if they are missing, and no
-- row is ever touched. Every statement carries `if exists` or `if not exists`,
-- which is what makes this safe against a database in any of three states:
-- freshly created by this file, left over from the old broken version, or
-- already fully migrated.
alter table public.seo_meta drop column if exists og_image_url;
alter table public.seo_meta drop column if exists canonical_url;
alter table public.seo_meta drop column if exists json_ld;

-- permanent redirects, logged automatically when a slug changes
create table if not exists public.redirects (
  id          uuid primary key default gen_random_uuid(),
  from_path   text not null unique
              check (from_path like '/%' and from_path = lower(from_path)
                     and from_path <> '/' and from_path !~ '/$'),
  to_path     text not null
              check (to_path = lower(to_path) and (to_path = '/' or to_path !~ '/$')),
  status_code smallint not null default 308 check (status_code in (301, 308)),
  hit_count   integer not null default 0,  -- bumped by the app; still 0 long after a rename = safe to delete
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- singleton row for the global SEO panel; check(id) makes a second row impossible
create table if not exists public.site_settings (
  id                       boolean primary key default true check (id),
  title_suffix             text not null default '',
  default_meta_title       text,               -- standalone title for routes that set none
  default_meta_description text not null default '',
  default_og_image         text not null default '/og-image.png',
  person_job_title         text,
  person_knows_about       text[] not null default '{}',
  social_links             jsonb not null default '{}'::jsonb,  -- keyed by platform: {"github": "https://..."}
  custom_json_ld           jsonb,              -- raw JSON-LD merged into the page graph
  ga4_measurement_id       text,
  gtm_container_id         text,
  meta_pixel_id            text,
  google_site_verification text,
  bing_site_verification   text,
  robots_txt               text,               -- NULL = render the generated default
  updated_at               timestamptz not null default now()
);

insert into public.site_settings (id) values (true) on conflict (id) do nothing;

-- per-entity metadata; an absent row means "inherit the template in src/data/seo.ts"
create table if not exists public.seo_meta (
  id                  uuid primary key default gen_random_uuid(),
  entity_type         text not null
                      check (entity_type in ('project', 'post', 'service', 'page')),
  entity_slug         text not null
                      check (entity_slug = lower(entity_slug)
                             and entity_slug !~ '^/' and entity_slug !~ '/$'),
  meta_title          text,
  meta_description    text,
  focus_keyword       text,
  keywords            text[] not null default '{}',
  og_title            text,
  og_description      text,
  og_image            text,
  twitter_title       text,
  twitter_description text,
  twitter_image       text,
  canonical_override  text check (canonical_override is null or canonical_override ~ '^https?://'),
  noindex             boolean not null default false,
  nofollow            boolean not null default false,
  custom_json_ld      jsonb check (custom_json_ld is null or jsonb_typeof(custom_json_ld) in ('object', 'array')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (entity_type, entity_slug)
);

-- Additive repair for a seo_meta table that already existed.
--
-- `create table if not exists` above is a no-op when the table is present, so
-- it cannot add a column to it. These statements are what actually upgrade an
-- existing installation — see the note at the top of this file. Everything here
-- mirrors `20261006001000_seo_admin.sql` and
-- `20261010001000_seo_geo_layer.sql`.
alter table public.seo_meta
  add column if not exists custom_json_ld jsonb
  constraint seo_meta_custom_json_ld_shape
  check (custom_json_ld is null or jsonb_typeof(custom_json_ld) in ('object', 'array'));

alter table public.seo_meta add column if not exists ai_answer text;
alter table public.seo_meta add column if not exists keyword_cluster text[];

alter table public.seo_meta
  add column if not exists stats jsonb
  constraint seo_meta_stats_shape
  check (stats is null or jsonb_typeof(stats) = 'array');

alter table public.seo_meta
  add column if not exists faqs jsonb
  constraint seo_meta_faqs_shape
  check (faqs is null or jsonb_typeof(faqs) = 'array');

alter table public.seo_meta
  add column if not exists entity_signals jsonb
  constraint seo_meta_entity_signals_shape
  check (entity_signals is null or jsonb_typeof(entity_signals) = 'object');

alter table public.seo_meta add column if not exists llm_summary text;

-- comparison-table content, on the row it describes
alter table public.services add column if not exists deliverables text[];
alter table public.services add column if not exists timeline text;
alter table public.services add column if not exists best_for text;
alter table public.services
  add column if not exists from_npr integer
  constraint services_from_npr_non_negative check (from_npr is null or from_npr >= 0);

-- slug must be lowercase everywhere, no leading or trailing slash
alter table public.projects drop constraint if exists projects_slug_lowercase;
alter table public.projects add constraint projects_slug_lowercase
  check (slug = lower(slug) and slug !~ '^/' and slug !~ '/$');
alter table public.posts drop constraint if exists posts_slug_lowercase;
alter table public.posts add constraint posts_slug_lowercase
  check (slug = lower(slug) and slug !~ '^/' and slug !~ '/$');
alter table public.services drop constraint if exists services_slug_lowercase;
alter table public.services add constraint services_slug_lowercase
  check (slug = lower(slug) and slug !~ '^/' and slug !~ '/$');

-- slug change hook: log the redirect, collapse redirect chains, keep seo_meta attached
create or replace function public.on_slug_change() returns trigger
language plpgsql as $$
declare
  entity   text := tg_argv[0];
  prefix   text := tg_argv[1];
  old_path text;
  new_path text;
begin
  if new.slug is not distinct from old.slug then
    return new;
  end if;

  old_path := case when prefix = '' then '/' || old.slug
                   else '/' || prefix || '/' || old.slug end;
  new_path := case when prefix = '' then '/' || new.slug
                   else '/' || prefix || '/' || new.slug end;

  delete from public.redirects where from_path = new_path and to_path = old_path;

  update public.redirects
     set to_path = new_path, updated_at = now()
   where to_path = old_path;

  insert into public.redirects (from_path, to_path)
  values (old_path, new_path)
  on conflict (from_path) do update
    set to_path = excluded.to_path, updated_at = now();

  delete from public.seo_meta
   where entity_type = entity and entity_slug = new.slug;

  update public.seo_meta
     set entity_slug = new.slug, updated_at = now()
   where entity_type = entity and entity_slug = old.slug;

  return new;
end;
$$;

drop trigger if exists slug_change on public.projects;
create trigger slug_change before update of slug on public.projects
  for each row execute function public.on_slug_change('project', 'work');
drop trigger if exists slug_change on public.posts;
create trigger slug_change before update of slug on public.posts
  for each row execute function public.on_slug_change('post', 'blog');
drop trigger if exists slug_change on public.services;
create trigger slug_change before update of slug on public.services
  for each row execute function public.on_slug_change('service', 'services');

-- delete cleanup: a deleted entity's old URL redirects to its section index instead of 404
create or replace function public.on_entity_delete() returns trigger
language plpgsql as $$
declare
  entity text := tg_argv[0];
  prefix text := tg_argv[1];
  leaf   text := tg_argv[2];
  path   text;
begin
  path := case when prefix = '' then '/' || old.slug
               else '/' || prefix || '/' || old.slug end;

  insert into public.redirects (from_path, to_path)
  values (path, leaf)
  on conflict (from_path) do update
    set to_path = excluded.to_path, updated_at = now();

  delete from public.seo_meta where entity_type = entity and entity_slug = old.slug;
  return old;
end;
$$;

drop trigger if exists entity_delete on public.projects;
create trigger entity_delete after delete on public.projects
  for each row execute function public.on_entity_delete('project', 'work', '/work');
drop trigger if exists entity_delete on public.posts;
create trigger entity_delete after delete on public.posts
  for each row execute function public.on_entity_delete('post', 'blog', '/blog');
drop trigger if exists entity_delete on public.services;
create trigger entity_delete after delete on public.services
  for each row execute function public.on_entity_delete('service', 'services', '/services');

-- rls: public read, authenticated write
alter table public.seo_meta      enable row level security;
alter table public.redirects     enable row level security;
alter table public.site_settings enable row level security;
grant all on public.seo_meta, public.redirects, public.site_settings to anon, authenticated;

drop policy if exists "Public read seo_meta" on public.seo_meta;
create policy "Public read seo_meta" on public.seo_meta for select using (true);
drop policy if exists "Authenticated write seo_meta" on public.seo_meta;
create policy "Authenticated write seo_meta" on public.seo_meta for all to authenticated using (true) with check (true);

drop policy if exists "Public read redirects" on public.redirects;
create policy "Public read redirects" on public.redirects for select using (true);
drop policy if exists "Authenticated write redirects" on public.redirects;
create policy "Authenticated write redirects" on public.redirects for all to authenticated using (true) with check (true);

drop policy if exists "Public read site_settings" on public.site_settings;
create policy "Public read site_settings" on public.site_settings for select using (true);
drop policy if exists "Authenticated write site_settings" on public.site_settings;
create policy "Authenticated write site_settings" on public.site_settings for all to authenticated using (true) with check (true);

-- updated_at touch (reuses touch_updated_at from the init migration)
drop trigger if exists touch_seo_meta on public.seo_meta;
create trigger touch_seo_meta before update on public.seo_meta
  for each row execute function public.touch_updated_at();
drop trigger if exists touch_redirects on public.redirects;
create trigger touch_redirects before update on public.redirects
  for each row execute function public.touch_updated_at();
drop trigger if exists touch_site_settings on public.site_settings;
create trigger touch_site_settings before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- media: uploads; alt text is required by the database on every write path
create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  src         text not null unique check (length(btrim(src)) > 0),  -- path in the media bucket, or an absolute URL
  alt         text not null check (length(btrim(alt)) > 0),        -- mandatory alt text
  width       integer check (width is null or width > 0),
  height      integer check (height is null or height > 0),
  mime_type   text,
  bytes       bigint check (bytes is null or bytes >= 0),
  entity_type text check (entity_type in ('project', 'post', 'service', 'page', 'site')),
  entity_slug text,
  uploaded_by uuid references auth.users (id) on delete set null,
  constraint media_alt_not_filename
    check (alt <> regexp_replace(src, '^.*/|\.[a-z0-9]+$', '', 'gi'))  -- alt may not just repeat the filename
);

create index if not exists media_entity_idx on public.media (entity_type, entity_slug);
create index if not exists media_created_idx on public.media (created_at desc);

drop trigger if exists touch_media on public.media;
create trigger touch_media before update on public.media
  for each row execute function public.touch_updated_at();

alter table public.media enable row level security;
grant all on public.media to anon, authenticated;

drop policy if exists "Public read media" on public.media;
create policy "Public read media" on public.media for select using (true);
drop policy if exists "Authenticated write media" on public.media;
create policy "Authenticated write media" on public.media for all to authenticated using (true) with check (true);

-- storage bucket for media uploads (public: images are served to anonymous visitors)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media bucket public read" on storage.objects;
create policy "media bucket public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');
drop policy if exists "media bucket admin write" on storage.objects;
create policy "media bucket admin write" on storage.objects
  for all to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');

-- seed: published content + the 7 static pages, so the admin opens showing what the site says today
insert into public.seo_meta (entity_type, entity_slug, meta_title, meta_description, noindex)
select 'project', p.slug, p.title || ' Case Study | ' || p.category || ' in Nepal', left(p.description, 158), false
from public.projects p where p.published = true
on conflict (entity_type, entity_slug) do nothing;

insert into public.seo_meta (entity_type, entity_slug, meta_title, meta_description, noindex)
select 'post', b.slug, b.title || ' | Dipendra Guragain', left(b.excerpt, 158), false
from public.posts b where b.published = true
on conflict (entity_type, entity_slug) do nothing;

insert into public.seo_meta (entity_type, entity_slug, meta_title, meta_description, noindex)
select 'service', s.slug, s.title || ' in Nepal | Dipendra Guragain', left(s.short_description, 158), false
from public.services s where s.published = true
on conflict (entity_type, entity_slug) do nothing;

insert into public.seo_meta (entity_type, entity_slug, noindex) values
  ('page', 'home',     false),
  ('page', 'about',    false),
  ('page', 'work',     false),
  ('page', 'services', false),
  ('page', 'pricing',  false),
  ('page', 'blog',     false),
  ('page', 'contact',  false)
on conflict (entity_type, entity_slug) do nothing;

notify pgrst, 'reload schema';
