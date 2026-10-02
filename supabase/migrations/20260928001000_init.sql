-- Initial schema for the portfolio backend: contact inbox + CMS collections.
-- Applied via the Supabase Management API (project db host is IPv6-only).

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- tables ---

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company text,
  service text,
  budget text,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'read', 'replied', 'archived')),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  slug text primary key,
  title text not null,
  category text not null,
  secondary_categories text[] not null default '{}',
  description text not null,
  image text not null,
  images text[] not null default '{}',
  technologies text[] not null default '{}',
  year text,
  overview text,
  challenge text,
  approach text,
  development text,
  marketing text,
  results jsonb not null default '[]'::jsonb,
  link text,
  is_placeholder boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id text primary key,
  name text not null,
  role text not null,
  company text,
  content text not null,
  avatar text,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  slug text primary key,
  title text not null,
  excerpt text not null,
  category text not null,
  date text not null,
  reading_time text not null,
  image text not null,
  content text[] not null default '{}',
  tags text[] not null default '{}',
  is_placeholder boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experience (
  id text primary key,
  period text not null,
  role text not null,
  company text not null,
  description text not null,
  technologies text[] not null default '{}',
  is_placeholder boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  slug text primary key,
  service_index text not null default '01',
  title text not null,
  short_description text not null,
  description text not null,
  -- Long-form page body: [{ heading, paragraphs[] }]. Code-managed, not
  -- exposed in the admin editor, so admin saves never overwrite it.
  body jsonb not null default '[]'::jsonb,
  capabilities text[] not null default '{}',
  icon text not null default 'code',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists messages_created_at_idx on public.messages (created_at desc);
create index if not exists projects_sort_idx on public.projects (sort_order, created_at desc);
create index if not exists posts_sort_idx on public.posts (sort_order, date desc);
create index if not exists experience_sort_idx on public.experience (sort_order);
create index if not exists services_sort_idx on public.services (sort_order);
create index if not exists testimonials_sort_idx on public.testimonials (sort_order);

-- ------------------------------------------------------------- updated_at ---

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['messages', 'projects', 'testimonials', 'posts', 'experience', 'services']
  loop
    execute format(
      'drop trigger if exists touch_%I on public.%I; '
      'create trigger touch_%I before update on public.%I '
      'for each row execute function public.touch_updated_at()',
      t, t, t, t
    );
  end loop;
end;
$$;

-- -------------------------------------------------------------------- rls ---

alter table public.messages enable row level security;
alter table public.projects enable row level security;
alter table public.testimonials enable row level security;
alter table public.posts enable row level security;
alter table public.experience enable row level security;
alter table public.services enable row level security;

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;

do $$
declare t text;
begin
  -- messages: anyone may submit; only the signed-in admin reads/changes rows.
  drop policy if exists "messages insert" on public.messages;
  create policy "messages insert" on public.messages
    for insert to anon, authenticated with check (true);

  drop policy if exists "messages select" on public.messages;
  create policy "messages select" on public.messages
    for select to authenticated using (true);
  drop policy if exists "messages update" on public.messages;
  create policy "messages update" on public.messages
    for update to authenticated using (true) with check (true);
  drop policy if exists "messages delete" on public.messages;
  create policy "messages delete" on public.messages
    for delete to authenticated using (true);

  -- content collections: world-readable (the public site renders them),
  -- writable only by the signed-in admin.
  foreach t in array array['projects', 'testimonials', 'posts', 'experience', 'services']
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

-- ------------------------------------------------------------- admin user ---

-- One Supabase Auth email/password user for /admin. Password comes from the
-- migration parameter embedded below (matches ADMIN_PASSWORD in .env.local).
delete from auth.identities
  where provider = 'email'
    and provider_id in (select id::text from auth.users where email = 'guragaidipendra6@gmail.com');
delete from auth.users where email = 'guragaidipendra6@gmail.com';

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  -- GoTrue scans these token columns into plain Go strings. Inserting a row
  -- without them leaves NULL behind, and the scan fails at login with
  -- "Database error querying schema" (500) before the password is checked.
  -- They must be empty strings, not NULL.
  confirmation_token, recovery_token, email_change,
  email_change_token_new, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token,
  created_at, updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'guragaidipendra6@gmail.com',
  extensions.crypt('tylbdL5n2JSahvwqm0ue', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "Dipendra Guragain"}'::jsonb,
  '', '', '', '', '', '', '', '',
  now(),
  now()
);

insert into auth.identities (
  id, user_id, provider, provider_id, identity_data,
  last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), u.id, 'email', u.id::text,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true,
    'full_name', 'Dipendra Guragain'
  ),
  now(), now(), now()
from auth.users u
where u.email = 'guragaidipendra6@gmail.com';
