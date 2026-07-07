-- BrewMap MVP schema for PostgreSQL / Supabase.
-- Cafe IDs are text because the seed CSV and UI use stable slugs.

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists cafes (
  id text primary key,
  name text not null,
  city text not null default 'busan' check (city in ('busan', 'seoul')),
  area text not null,
  address text not null,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  naver_map_url text,
  kakao_map_url text,
  google_map_url text,
  status text not null default 'active' check (status in ('active', 'closed', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists coffee_capabilities (
  id text primary key,
  label_ko text not null,
  group_name text not null,
  is_mvp_filter boolean not null default false
);

create table if not exists cafe_capabilities (
  cafe_id text references cafes(id) on delete cascade,
  capability_id text references coffee_capabilities(id),
  confidence text not null check (confidence in ('A', 'B', 'C', 'D', 'X')),
  verification_source text not null check (verification_source in ('owner_verified', 'admin_verified', 'user_report', 'menu_photo')),
  verified_at date,
  notes text,
  primary key (cafe_id, capability_id)
);

create table if not exists evidences (
  id uuid primary key default gen_random_uuid(),
  cafe_id text references cafes(id) on delete cascade,
  capability_id text references coffee_capabilities(id),
  evidence_type text not null check (evidence_type in ('owner_verified', 'admin_verified', 'user_report', 'menu_photo')),
  content text,
  image_url text,
  created_by uuid references users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists saved_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade default auth.uid(),
  name text not null default '가보고 싶은 곳',
  created_at timestamptz not null default now()
);

create table if not exists saved_cafes (
  list_id uuid references saved_lists(id) on delete cascade,
  cafe_id text references cafes(id) on delete cascade,
  memo text,
  created_at timestamptz not null default now(),
  primary key (list_id, cafe_id)
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  cafe_id text references cafes(id),
  report_type text not null check (report_type in ('add', 'update', 'delete', 'closed', 'menu_change')),
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_by uuid references users(id) default auth.uid(),
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references users(id) default auth.uid(),
  action text not null,
  target_table text not null,
  target_id text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
create table if not exists site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  seo_title text,
  seo_description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references site_pages(id) on delete cascade,
  block_key text not null,
  block_type text not null check (block_type in ('hero', 'notice', 'curation_card', 'text', 'cta')),
  position integer not null default 0 check (position >= 0),
  content jsonb not null default '{}'::jsonb,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, block_key)
);

create table if not exists content_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references site_pages(id) on delete cascade,
  snapshot jsonb not null,
  change_note text,
  created_by uuid references users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists cafes_status_area_idx on cafes(status, city, area);
create index if not exists cafe_capabilities_capability_idx on cafe_capabilities(capability_id);
create index if not exists reports_status_created_idx on reports(status, created_at desc);
create index if not exists saved_lists_user_idx on saved_lists(user_id);
create index if not exists site_pages_status_slug_idx on site_pages(status, slug);
create index if not exists content_blocks_page_position_idx on content_blocks(page_id, position);
create index if not exists content_revisions_page_created_idx on content_revisions(page_id, created_at desc);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cafes_set_updated_at on cafes;
create trigger cafes_set_updated_at
before update on cafes
for each row execute function set_updated_at();

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into users (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    'user'
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(users.display_name, excluded.display_name);
  return new;
end;
$$;

drop trigger if exists site_pages_set_updated_at on site_pages;
create trigger site_pages_set_updated_at
before update on site_pages
for each row execute function set_updated_at();

drop trigger if exists content_blocks_set_updated_at on content_blocks;
create trigger content_blocks_set_updated_at
before update on content_blocks
for each row execute function set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

create or replace function current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from users where id = auth.uid();
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(current_user_role() = 'admin', false);
$$;

alter table users enable row level security;
alter table cafes enable row level security;
alter table coffee_capabilities enable row level security;
alter table cafe_capabilities enable row level security;
alter table evidences enable row level security;
alter table saved_lists enable row level security;
alter table saved_cafes enable row level security;
alter table reports enable row level security;
alter table admin_logs enable row level security;
alter table site_pages enable row level security;
alter table content_blocks enable row level security;
alter table content_revisions enable row level security;

grant usage on schema public to anon, authenticated;

grant select on users to authenticated;
grant update (display_name) on users to authenticated;

grant select on cafes, coffee_capabilities, cafe_capabilities, evidences to anon, authenticated;
grant insert on reports to anon, authenticated;

grant insert, update, delete on cafes, coffee_capabilities, cafe_capabilities, evidences to authenticated;
grant select, update on reports to authenticated;
grant delete on reports to authenticated;
grant select, insert, update, delete on saved_lists, saved_cafes, admin_logs to authenticated;
grant select on site_pages, content_blocks to anon, authenticated;
grant select, insert, update, delete on site_pages, content_blocks, content_revisions to authenticated, service_role;

drop policy if exists "Users can read own profile and admins can read all" on users;
create policy "Users can read own profile and admins can read all"
on users for select to authenticated
using (id = auth.uid() or is_admin());

drop policy if exists "Users can update own display name" on users;
create policy "Users can update own display name"
on users for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Anyone can read active cafes" on cafes;
create policy "Anyone can read active cafes"
on cafes for select to anon, authenticated
using (status = 'active' or is_admin());

drop policy if exists "Admins manage cafes" on cafes;
create policy "Admins manage cafes"
on cafes for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists "Anyone can read coffee capabilities" on coffee_capabilities;
create policy "Anyone can read coffee capabilities"
on coffee_capabilities for select to anon, authenticated
using (true);

drop policy if exists "Admins manage coffee capabilities" on coffee_capabilities;
create policy "Admins manage coffee capabilities"
on coffee_capabilities for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists "Anyone can read active cafe capabilities" on cafe_capabilities;
create policy "Anyone can read active cafe capabilities"
on cafe_capabilities for select to anon, authenticated
using (
  is_admin()
  or exists (
    select 1 from cafes
    where cafes.id = cafe_capabilities.cafe_id
      and cafes.status = 'active'
  )
);

drop policy if exists "Admins manage cafe capabilities" on cafe_capabilities;
create policy "Admins manage cafe capabilities"
on cafe_capabilities for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists "Anyone can read active cafe evidences" on evidences;
create policy "Anyone can read active cafe evidences"
on evidences for select to anon, authenticated
using (
  is_admin()
  or exists (
    select 1 from cafes
    where cafes.id = evidences.cafe_id
      and cafes.status = 'active'
  )
);

drop policy if exists "Authenticated users can create evidences" on evidences;
create policy "Authenticated users can create evidences"
on evidences for insert to authenticated
with check (created_by = auth.uid());

drop policy if exists "Admins manage evidences" on evidences;
create policy "Admins manage evidences"
on evidences for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists "Users manage own saved lists" on saved_lists;
create policy "Users manage own saved lists"
on saved_lists for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users manage own saved cafes" on saved_cafes;
create policy "Users manage own saved cafes"
on saved_cafes for all to authenticated
using (
  exists (
    select 1 from saved_lists
    where saved_lists.id = saved_cafes.list_id
      and saved_lists.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from saved_lists
    where saved_lists.id = saved_cafes.list_id
      and saved_lists.user_id = auth.uid()
  )
);

drop policy if exists "Anyone can create reports" on reports;
create policy "Anyone can create reports"
on reports for insert to anon, authenticated
with check (submitted_by is null or submitted_by = auth.uid());

drop policy if exists "Users can read own reports and admins can read all" on reports;
create policy "Users can read own reports and admins can read all"
on reports for select to authenticated
using (submitted_by = auth.uid() or is_admin());

drop policy if exists "Admins manage reports" on reports;
create policy "Admins manage reports"
on reports for update to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists "Admins delete reports" on reports;
create policy "Admins delete reports"
on reports for delete to authenticated
using (is_admin());

drop policy if exists "Admins manage admin logs" on admin_logs;
create policy "Admins manage admin logs"
on admin_logs for all to authenticated
using (is_admin())
with check (is_admin());
drop policy if exists "Anyone can read published site pages" on site_pages;
create policy "Anyone can read published site pages"
on site_pages for select to anon, authenticated
using (status = 'published' or (select is_admin()));

drop policy if exists "Admins manage site pages" on site_pages;
create policy "Admins manage site pages"
on site_pages for all to authenticated
using ((select is_admin()))
with check ((select is_admin()));

drop policy if exists "Anyone can read visible content blocks" on content_blocks;
create policy "Anyone can read visible content blocks"
on content_blocks for select to anon, authenticated
using (
  (select is_admin())
  or (
    is_visible
    and exists (
      select 1 from site_pages
      where site_pages.id = content_blocks.page_id
        and site_pages.status = 'published'
    )
  )
);

drop policy if exists "Admins manage content blocks" on content_blocks;
create policy "Admins manage content blocks"
on content_blocks for all to authenticated
using ((select is_admin()))
with check ((select is_admin()));

drop policy if exists "Admins manage content revisions" on content_revisions;
create policy "Admins manage content revisions"
on content_revisions for all to authenticated
using ((select is_admin()))
with check ((select is_admin()));
