-- BrewMap MVP schema draft for PostgreSQL / Supabase
create table users (
  id uuid primary key,
  email text unique,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table cafes (
  id uuid primary key,
  name text not null,
  area text not null check (area in ('seongsu', 'yeonnam')),
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

create table coffee_capabilities (
  id text primary key,
  label_ko text not null,
  group_name text not null,
  is_mvp_filter boolean not null default false
);

create table cafe_capabilities (
  cafe_id uuid references cafes(id) on delete cascade,
  capability_id text references coffee_capabilities(id),
  confidence text not null check (confidence in ('A', 'B', 'C', 'D', 'X')),
  verification_source text not null check (verification_source in ('owner_verified', 'admin_verified', 'user_report', 'menu_photo')),
  verified_at date,
  notes text,
  primary key (cafe_id, capability_id)
);

create table evidences (
  id uuid primary key,
  cafe_id uuid references cafes(id) on delete cascade,
  capability_id text references coffee_capabilities(id),
  evidence_type text not null check (evidence_type in ('owner_verified', 'admin_verified', 'user_report', 'menu_photo')),
  content text,
  image_url text,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table saved_lists (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  name text not null default '가보고 싶은 곳',
  created_at timestamptz not null default now()
);

create table saved_cafes (
  list_id uuid references saved_lists(id) on delete cascade,
  cafe_id uuid references cafes(id) on delete cascade,
  memo text,
  created_at timestamptz not null default now(),
  primary key (list_id, cafe_id)
);

create table reports (
  id uuid primary key,
  cafe_id uuid references cafes(id),
  report_type text not null check (report_type in ('add', 'update', 'delete', 'closed', 'menu_change')),
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_by uuid references users(id),
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table admin_logs (
  id uuid primary key,
  admin_id uuid references users(id),
  action text not null,
  target_table text not null,
  target_id text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
