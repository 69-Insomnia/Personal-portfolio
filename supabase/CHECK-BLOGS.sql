-- ============================================================================
-- CHECK-BLOGS.sql  —  read-only. Changes nothing. Safe to run any time.
--
-- Supabase -> SQL Editor -> New query -> Ctrl+A, Delete -> paste -> Run.
--
-- Paste ALL FOUR result tables back. Each answers a different question about
-- why a written post is not appearing on /blog.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. Does the post exist at all, and is it published?
--
--    readAll in src/lib/content.ts filters on `published = true`. A row here
--    with published = false is invisible to the site with no error anywhere.
-- ---------------------------------------------------------------------------

select slug, title, published, date, sort_order, created_at
  from public.posts
 order by created_at desc;


-- ---------------------------------------------------------------------------
-- 2. What columns does the table actually have?
--
--    mapPost() reads slug, title, excerpt, category, date, reading_time,
--    image, content, tags, is_placeholder, updated_at. If ANY of those is
--    missing, the SELECT errors, readAll swallows it, and the site silently
--    falls back to the three static posts in src/data/blog.ts.
-- ---------------------------------------------------------------------------

select ordinal_position, column_name, data_type, is_nullable
  from information_schema.columns
 where table_schema = 'public' and table_name = 'posts'
 order by ordinal_position;


-- ---------------------------------------------------------------------------
-- 3. Are the read policies actually installed?
--
--    Expected: one row, `posts public read`, cmd = SELECT, roles includes anon.
--    Zero rows here means RLS is on with no read policy, so the anon key gets
--    an empty result — which also triggers the static fallback.
-- ---------------------------------------------------------------------------

select policyname, cmd, roles, qual
  from pg_policies
 where schemaname = 'public' and tablename = 'posts';


-- ---------------------------------------------------------------------------
-- 4. Is RLS even enabled, and does the anon role have table privileges?
-- ---------------------------------------------------------------------------

select relname, relrowsecurity as rls_enabled
  from pg_class
 where relnamespace = 'public'::regnamespace and relname = 'posts';


-- ===========================================================================
-- THE IMAGE UPLOAD PATH
--
-- The upload writes to Storage and then to `media`. Both have to exist. Given
-- that `seo_meta` turned out to be running an old schema, these are worth
-- checking in the same pass.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 5. Does the `media` table exist, with the columns the uploader writes?
--
--    The insert sends: src, alt, width, height, bytes, mime_type, entity_type,
--    entity_slug. Zero rows here means the table is missing entirely and every
--    upload will fail with "relation does not exist".
-- ---------------------------------------------------------------------------

select ordinal_position, column_name, data_type, is_nullable
  from information_schema.columns
 where table_schema = 'public' and table_name = 'media'
 order by ordinal_position;


-- ---------------------------------------------------------------------------
-- 6. Does the `media` storage bucket exist, and is it public?
--
--    Expected: one row, id = 'media', public = true. Zero rows means the upload
--    target does not exist.
-- ---------------------------------------------------------------------------

select id, name, public, file_size_limit, allowed_mime_types
  from storage.buckets
 where id = 'media';


-- ---------------------------------------------------------------------------
-- 7. Can anon read the bucket and can the admin write to it?
--
--    Expected: two rows — a SELECT policy for anon/authenticated, and an ALL
--    policy for authenticated. Missing write policy = uploads fail with 403
--    even though the bucket exists.
-- ---------------------------------------------------------------------------

select policyname, cmd, roles
  from pg_policies
 where schemaname = 'storage' and tablename = 'objects';


-- ---------------------------------------------------------------------------
-- 8. Is the media table's alt-text rule actually installed?
--
--    Expected: media_alt_not_filename and a not-null on alt. This is the rule
--    the upload form mirrors; if the constraint is missing the database will
--    accept an image with no description, which is worse than refusing it.
-- ---------------------------------------------------------------------------

select conname, pg_get_constraintdef(oid) as definition
  from pg_constraint
 where conrelid = 'public.media'::regclass;
