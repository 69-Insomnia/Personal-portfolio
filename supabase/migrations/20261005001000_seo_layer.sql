-- SEO layer: per-entity metadata, permanent redirects, and global settings.
--
-- This is the database half of moving SEO out of `src/data/seo.ts` and into
-- something the admin panel can edit. The code half is `getSeo`/`getSeoMap` in
-- `src/lib/content.ts`, which follow the same DB-first-with-static-fallback
-- discipline as every other reader there: with no `seo_meta` rows present the
-- site renders exactly the templates it renders today.
--
-- ## Why one side table instead of columns on each content table
--
-- Static pages (home, about, contact) have no row to hang columns on, and the
-- brief asks for SEO control over those too. One polymorphic table means one
-- editor component and one slug-change hook instead of four of each.
--
-- The cost is real and is paid deliberately: there is no foreign key from
-- `seo_meta` to the entity it describes, so cascade is handled by the triggers
-- below rather than by the database. `entity_slug` is kept in step by
-- `on_slug_change` and cleaned up by `on_entity_delete`.

-- ---------------------------------------------------------------- redirects ---

-- Permanent redirects, logged automatically when a slug changes.
--
-- Paths are stored normalised: leading slash, lowercase, no trailing slash.
-- That is enforced here rather than anywhere upstream because this table is
-- what the router reads, and a stored path that does not match the request
-- path is a redirect that silently never fires.

create table if not exists public.redirects (
  id          uuid primary key default gen_random_uuid(),
  from_path   text not null unique
              check (from_path like '/%' and from_path = lower(from_path)
                     and from_path <> '/' and from_path !~ '/$'),
  -- '/' is a legitimate destination — a dead page is often best sent to the
  -- homepage — so the trailing-slash rule has to exempt it explicitly. Without
  -- the exemption the check reads as "no path may end in a slash", which
  -- rejects the one path that is nothing but a slash.
  to_path     text not null
              check (to_path = lower(to_path) and (to_path = '/' or to_path !~ '/$')),
  -- 308 is what Next's `permanentRedirect()` emits and is the default the
  -- router relies on. 301 is accepted for rows added by hand.
  status_code smallint not null default 308 check (status_code in (301, 308)),
  -- Bumped by the app, not by the triggers. A redirect that still has 0 hits
  -- long after the rename is one you can safely delete.
  hit_count   integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------ site_settings ---

-- Singleton row for the global SEO panel.
--
-- `boolean primary key default true check (id)` is the standard singleton
-- guard: it makes a second settings row impossible rather than merely
-- discouraged. The `default true` means `insert into site_settings default
-- values` produces the one row, which is what the seed below relies on.

create table if not exists public.site_settings (
  id                       boolean primary key default true check (id),
  title_suffix             text not null default '',
  default_meta_description text not null default '',
  default_og_image         text not null default '/og-image.png',
  person_job_title         text,
  person_knows_about       text[] not null default '{}',
  -- Analytics and verification. Every one of these is served in the public
  -- HTML, so they are readable by anon and there is nothing here to protect.
  ga4_measurement_id       text,
  gtm_container_id         text,
  meta_pixel_id            text,
  google_site_verification text,
  bing_site_verification   text,
  -- Raw robots.txt body. NULL means "render the generated default" — see
  -- `defaultRobotsTxt` in src/lib/robots.ts. An empty string is treated the
  -- same way, because a blank file deindexes the whole site.
  robots_txt               text,
  updated_at               timestamptz not null default now()
);

insert into public.site_settings (id) values (true) on conflict (id) do nothing;

-- ----------------------------------------------------------------- seo_meta ---

-- Per-entity search and social metadata. An absent row means "inherit the
-- template in src/data/seo.ts", which is what keeps the static fallback and
-- every page that has never been touched in the admin rendering unchanged.

create table if not exists public.seo_meta (
  id                  uuid primary key default gen_random_uuid(),
  entity_type         text not null
                      check (entity_type in ('project', 'post', 'service', 'page')),
  -- For a static page this is a stable name rather than a URL fragment: the
  -- home page is stored as 'home', not ''. See STATIC_PAGE_SLUGS in
  -- src/app/sitemap.ts for the full mapping.
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

  -- Optional. Points at the original source when this was published elsewhere
  -- first. Constrained to absolute http(s) because a relative value here
  -- resolves against the *current* page and is therefore worse than no
  -- canonical at all — the same failure src/data/seo.ts documents at length
  -- for site.url.
  canonical_override  text check (canonical_override is null
                                  or canonical_override ~ '^https?://'),

  -- Drives the admin's "Hide from search engines" toggle. Only `index` and
  -- `follow` are stored; the rest of the layout's robots directives
  -- (max-image-preview, max-snippet) are left to be inherited, which is why
  -- buildMetadata omits the key entirely rather than passing a partial object.
  noindex             boolean not null default false,
  nofollow            boolean not null default false,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (entity_type, entity_slug)
);

-- The unique constraint above already provides the lookup index for both
-- `getSeo` (entity_type + entity_slug) and `getSeoMap` (full scan).

-- ------------------------------------------------------ slug lowercase guard ---

-- Automatic lowercase URLs, enforced where they cannot be bypassed. The admin
-- panel slugifies client-side too, but a constraint is the thing that makes
-- the guarantee true — including for rows written by scripts/sync-content.ts.
--
-- Trailing slashes are not handled here: `trailingSlash: false` is Next's
-- default and already 308-redirects /about/ to /about before a route runs.

alter table public.projects drop constraint if exists projects_slug_lowercase;
alter table public.projects add constraint projects_slug_lowercase
  check (slug = lower(slug) and slug !~ '^/' and slug !~ '/$');

alter table public.posts drop constraint if exists posts_slug_lowercase;
alter table public.posts add constraint posts_slug_lowercase
  check (slug = lower(slug) and slug !~ '^/' and slug !~ '/$');

alter table public.services drop constraint if exists services_slug_lowercase;
alter table public.services add constraint services_slug_lowercase
  check (slug = lower(slug) and slug !~ '^/' and slug !~ '/$');

-- --------------------------------------------------------- slug change hook ---

-- Fires on every content table whose slug is a URL segment. Three jobs: log
-- the redirect, collapse any redirect chain that already pointed here, and
-- keep seo_meta attached to the renamed entity.
--
-- Chain collapsing is the part that is easy to omit and expensive to skip. A
-- slug renamed twice produces A→B and B→C, so A→B→C is a two-hop redirect:
-- crawlers follow it, but it is a weaker signal and costs a round trip on
-- every old link. Rewriting any row that pointed at the OLD path to point at
-- the NEW path keeps every redirect one hop.
--
-- The reciprocal delete prevents a loop. Renaming B back to A when A→B already
-- exists would otherwise leave two rows pointing at each other.
--
-- tg_argv: [0] = entity_type, [1] = path prefix ('' for static pages)

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

  -- Clear any row already sitting on the new slug before moving this entity's
  -- over. Two entities of the same type cannot share a slug (it is the primary
  -- key), so such a row is necessarily orphaned — but it would still trip the
  -- `unique (entity_type, entity_slug)` constraint and abort the whole save
  -- with an error that says nothing about the slug that was actually renamed.
  delete from public.seo_meta
   where entity_type = entity and entity_slug = new.slug;

  update public.seo_meta
     set entity_slug = new.slug, updated_at = now()
   where entity_type = entity and entity_slug = old.slug;

  return new;
end;
$$;

-- `before update of slug` rather than `before update` so an ordinary edit that
-- does not touch the slug costs nothing.

drop trigger if exists slug_change on public.projects;
create trigger slug_change before update of slug on public.projects
  for each row execute function public.on_slug_change('project', 'work');

drop trigger if exists slug_change on public.posts;
create trigger slug_change before update of slug on public.posts
  for each row execute function public.on_slug_change('post', 'blog');

drop trigger if exists slug_change on public.services;
create trigger slug_change before update of slug on public.services
  for each row execute function public.on_slug_change('service', 'services');

-- ------------------------------------------------------- delete cleanup hook ---

-- A deleted project redirects to its section index instead of 404ing, which
-- keeps any accumulated link equity inside the site rather than dropping it.
-- Delete the row from /admin/redirects to turn this back into a 404.
--
-- tg_argv: [0] = entity_type, [1] = path prefix, [2] = fallback destination

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

-- --------------------------------------------------------------------- rls ---

alter table public.seo_meta      enable row level security;
alter table public.redirects     enable row level security;
alter table public.site_settings enable row level security;

-- Same shape as the init migration: `grant all` opens the door, RLS is the
-- gate. The init migration's `grant all on all tables in schema public` only
-- covered the tables that existed when it ran, so the new ones need their own.
grant all on public.seo_meta, public.redirects, public.site_settings
  to anon, authenticated;

-- Public read on all three. The site reads them with the anon key on the
-- server (see `db()` in src/lib/content.ts), none of the columns are secret,
-- and writes stay behind auth.
do $$
declare t text;
begin
  foreach t in array array['seo_meta', 'redirects', 'site_settings']
  loop
    execute format('drop policy if exists "%I public read" on public.%I', t, t);
    execute format(
      'create policy "%I public read" on public.%I for select to anon, authenticated using (true)',
      t, t
    );
    execute format('drop policy if exists "%I admin write" on public.%I', t, t);
    execute format(
      'create policy "%I admin write" on public.%I for all to authenticated using (true) with check (true)',
      t, t
    );
  end loop;
end;
$$;

-- ------------------------------------------------------------- updated_at ---

-- Reuses `touch_updated_at` from the init migration rather than redefining it,
-- so the four tables in this file cannot drift from the six in that one.

drop trigger if exists touch_seo_meta on public.seo_meta;
create trigger touch_seo_meta before update on public.seo_meta
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_redirects on public.redirects;
create trigger touch_redirects before update on public.redirects
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_site_settings on public.site_settings;
create trigger touch_site_settings before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------- seed rows ---

-- Seeded from the copy that is live today, so the admin panel opens showing
-- what the site actually says rather than blank fields.
--
-- Without this, the first save from a half-filled panel would replace a
-- template title with NULL and the page would fall back to a weaker default.
-- Seeding makes the panel's starting state and the live state the same thing.
--
-- `left(..., 158)` matches DESCRIPTION_LIMIT in src/utils/metadata.ts.

insert into public.seo_meta (entity_type, entity_slug, meta_title, meta_description, noindex)
select 'project', p.slug,
       p.title || ' Case Study | ' || p.category || ' in Nepal',
       left(p.description, 158),
       false
from public.projects p
where p.published = true
on conflict (entity_type, entity_slug) do nothing;

insert into public.seo_meta (entity_type, entity_slug, meta_title, meta_description, noindex)
select 'post', b.slug,
       b.title || ' | Dipendra Guragain',
       left(b.excerpt, 158),
       false
from public.posts b
where b.published = true
on conflict (entity_type, entity_slug) do nothing;

insert into public.seo_meta (entity_type, entity_slug, meta_title, meta_description, noindex)
select 'service', s.slug,
       s.title || ' in Nepal | Dipendra Guragain',
       left(s.short_description, 158),
       false
from public.services s
where s.published = true
on conflict (entity_type, entity_slug) do nothing;

-- Static pages have no table to select from, so they are listed literally.
-- These match STATIC_PAGE_SLUGS in src/app/sitemap.ts.
insert into public.seo_meta (entity_type, entity_slug, noindex) values
  ('page', 'home',     false),
  ('page', 'about',    false),
  ('page', 'work',     false),
  ('page', 'services', false),
  ('page', 'pricing',  false),
  ('page', 'blog',     false),
  ('page', 'contact',  false)
on conflict (entity_type, entity_slug) do nothing;
