-- BrewMap Admin content management.
-- Supabase CLI is not installed in this workspace, so this migration follows
-- the existing timestamped SQL file convention in supabase/migrations.

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

create index if not exists site_pages_status_slug_idx on site_pages(status, slug);
create index if not exists content_blocks_page_position_idx on content_blocks(page_id, position);
create index if not exists content_revisions_page_created_idx on content_revisions(page_id, created_at desc);

drop trigger if exists site_pages_set_updated_at on site_pages;
create trigger site_pages_set_updated_at
before update on site_pages
for each row execute function set_updated_at();

drop trigger if exists content_blocks_set_updated_at on content_blocks;
create trigger content_blocks_set_updated_at
before update on content_blocks
for each row execute function set_updated_at();

alter table site_pages enable row level security;
alter table content_blocks enable row level security;
alter table content_revisions enable row level security;

grant select on site_pages, content_blocks to anon, authenticated;
grant select, insert, update, delete on site_pages, content_blocks, content_revisions to authenticated, service_role;

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

with home_page as (
  insert into site_pages (slug, title, description, seo_title, seo_description, status, published_at)
  values (
    'home',
    'BrewMap Home',
    '브루맵 공개 홈 콘텐츠',
    '브루맵 | 부산에서 원하는 커피를 찾는 지도',
    '메뉴와 최근 확인 정보를 기준으로 부산에서 원하는 커피를 판매하는 카페를 찾아보세요.',
    'published',
    now()
  )
  on conflict (slug) do update
    set title = excluded.title,
        description = excluded.description,
        seo_title = excluded.seo_title,
        seo_description = excluded.seo_description,
        status = excluded.status,
        published_at = coalesce(site_pages.published_at, excluded.published_at)
  returning id
)
insert into content_blocks (page_id, block_key, block_type, position, content, is_visible)
select home_page.id, seed.block_key, seed.block_type, seed.position, seed.content::jsonb, true
from home_page
cross join (
  values
    (
      'home-hero',
      'hero',
      1,
      '{"headline":"마시고 싶은 커피가 있는 로컬 지도","body":"당신이 찾고 싶은 커피 지도","primaryCtaLabel":"부산 카페 찾기","primaryCtaHref":"#cafes"}'
    ),
    (
      'home-notice',
      'notice',
      2,
      '{"title":"부산 베타 데이터 보강 중","body":"전포, 해운대, 광안리 중심으로 커피 가능 여부와 최근 확인일을 계속 업데이트합니다.","severity":"info"}'
    ),
    (
      'home-curation-jeonpo',
      'curation_card',
      3,
      '{"title":"부산 - 전포","body":"골목 에스프레소","imageUrl":"/assets/curation/jeonpo-local-espresso.png","linkedArea":"전포","linkedFilter":"espresso_machine"}'
    )
) as seed(block_key, block_type, position, content)
on conflict (page_id, block_key) do update
  set block_type = excluded.block_type,
      position = excluded.position,
      content = excluded.content,
      is_visible = excluded.is_visible;
