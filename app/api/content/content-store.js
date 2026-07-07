export const dynamic = 'force-dynamic';

const defaultBlocks = [
  {
    id: 'home-hero',
    pageId: 'home',
    blockKey: 'home-hero',
    blockType: 'hero',
    position: 1,
    isVisible: true,
    updatedAt: '2026-07-06T00:00:00.000Z',
    content: {
      headline: '마시고 싶은 커피가 있는 로컬 지도',
      body: '당신이 찾고 싶은 커피 지도',
      primaryCtaLabel: '부산 카페 찾기',
      primaryCtaHref: '#cafes',
    },
  },
  {
    id: 'home-notice',
    pageId: 'home',
    blockKey: 'home-notice',
    blockType: 'notice',
    position: 2,
    isVisible: true,
    updatedAt: '2026-07-06T00:00:00.000Z',
    content: {
      title: '부산 베타 데이터 보강 중',
      body: '전포, 해운대, 광안리 중심으로 커피 가능 여부와 최근 확인일을 계속 업데이트합니다.',
      severity: 'info',
    },
  },
  {
    id: 'home-curation-jeonpo',
    pageId: 'home',
    blockKey: 'home-curation-jeonpo',
    blockType: 'curation_card',
    position: 3,
    isVisible: true,
    updatedAt: '2026-07-06T00:00:00.000Z',
    content: {
      title: '부산 - 전포',
      body: '골목 에스프레소',
      imageUrl: '/assets/curation/jeonpo-local-espresso.png',
      linkedArea: '전포',
      linkedFilter: 'espresso_machine',
    },
  },
];

export const defaultContentPage = {
  id: 'home',
  slug: 'home',
  title: 'BrewMap Home',
  description: '브루맵 공개 홈 콘텐츠',
  seoTitle: '브루맵 | 부산에서 원하는 커피를 찾는 지도',
  seoDescription: '메뉴와 최근 확인 정보를 기준으로 부산에서 원하는 커피를 판매하는 카페를 찾아보세요.',
  status: 'published',
  publishedAt: '2026-07-06T00:00:00.000Z',
  updatedAt: '2026-07-06T00:00:00.000Z',
  blocks: defaultBlocks,
};

export class ContentApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function fallbackContentPage(slug = 'home') {
  if (slug !== 'home') return null;
  return clonePage(defaultContentPage);
}

export function clonePage(page) {
  return {
    ...page,
    blocks: (page.blocks || []).map((block) => ({
      ...block,
      content: { ...(block.content || {}) },
    })),
  };
}

function supabaseConfig({ admin = false } = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '');
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = admin ? serviceRoleKey : publishableKey;

  if (!url || !key) {
    throw new ContentApiError(503, admin
      ? 'Supabase URL and service role key are required for Admin content writes.'
      : 'Supabase URL and publishable key are required for content reads.');
  }

  return { url, key };
}

export function encodeFilter(value) {
  return encodeURIComponent(String(value));
}

export async function supabaseRest(path, { method = 'GET', admin = false, body, prefer = '' } = {}) {
  const { url, key } = supabaseConfig({ admin });
  const headers = {
    accept: 'application/json',
    apikey: key,
    authorization: `Bearer ${key}`,
  };

  if (body !== undefined) headers['content-type'] = 'application/json';
  if (prefer) headers.prefer = prefer;

  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new ContentApiError(response.status, `Supabase content request failed with ${response.status}: ${responseBody.slice(0, 240)}`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function mapBlock(row) {
  return {
    id: row.id,
    pageId: row.page_id,
    blockKey: row.block_key,
    blockType: row.block_type,
    position: row.position,
    content: row.content || {},
    isVisible: row.is_visible,
    updatedAt: row.updated_at,
  };
}

function mapPage(row, blocks = []) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || '',
    seoTitle: row.seo_title || '',
    seoDescription: row.seo_description || '',
    status: row.status,
    publishedAt: row.published_at || '',
    updatedAt: row.updated_at || '',
    blocks: blocks.map(mapBlock).sort((a, b) => a.position - b.position),
  };
}

function pageRow(page) {
  const row = {};
  if (page.slug !== undefined) row.slug = String(page.slug).trim();
  if (page.title !== undefined) row.title = String(page.title).trim();
  if (page.description !== undefined) row.description = String(page.description || '').trim();
  if (page.seoTitle !== undefined) row.seo_title = String(page.seoTitle || '').trim();
  if (page.seoDescription !== undefined) row.seo_description = String(page.seoDescription || '').trim();
  if (page.status !== undefined) row.status = page.status;
  return row;
}

function blockRow(pageId, block) {
  return {
    page_id: pageId,
    block_key: String(block.blockKey || block.block_key || '').trim(),
    block_type: block.blockType || block.block_type || 'text',
    position: Number(block.position || 0),
    content: block.content || {},
    is_visible: block.isVisible !== false,
  };
}

export function validatePagePayload(payload) {
  const slug = String(payload.slug || '').trim();
  const title = String(payload.title || '').trim();
  const status = payload.status || 'draft';

  if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(slug)) {
    throw new ContentApiError(400, 'A valid slug is required.');
  }

  if (!title) {
    throw new ContentApiError(400, 'A title is required.');
  }

  if (!['draft', 'published', 'archived'].includes(status)) {
    throw new ContentApiError(400, 'A valid status is required.');
  }

  return {
    slug,
    title,
    description: String(payload.description || '').trim(),
    seoTitle: String(payload.seoTitle || '').trim(),
    seoDescription: String(payload.seoDescription || '').trim(),
    status,
    blocks: Array.isArray(payload.blocks) ? payload.blocks.map(validateBlockPayload) : [],
  };
}

export function validateBlockPayload(payload) {
  const blockKey = String(payload.blockKey || payload.block_key || '').trim();
  const blockType = payload.blockType || payload.block_type || 'text';
  const position = Number(payload.position || 0);

  if (!/^[a-z0-9][a-z0-9-]{1,120}$/.test(blockKey)) {
    throw new ContentApiError(400, 'A valid blockKey is required.');
  }

  if (!['hero', 'notice', 'curation_card', 'text', 'cta'].includes(blockType)) {
    throw new ContentApiError(400, 'A valid blockType is required.');
  }

  if (!Number.isInteger(position) || position < 0 || position > 999) {
    throw new ContentApiError(400, 'A valid block position is required.');
  }

  return {
    blockKey,
    blockType,
    position,
    isVisible: payload.isVisible !== false,
    content: payload.content && typeof payload.content === 'object' ? payload.content : {},
  };
}

export async function readPublicContentPage(slug) {
  const pageRows = await supabaseRest(`site_pages?select=id,slug,title,description,seo_title,seo_description,status,published_at,updated_at&slug=eq.${encodeFilter(slug)}&status=eq.published&limit=1`);
  const page = pageRows?.[0];
  if (!page) throw new ContentApiError(404, 'Published content page not found.');

  const blockRows = await supabaseRest(`content_blocks?select=id,page_id,block_key,block_type,position,content,is_visible,updated_at&page_id=eq.${encodeFilter(page.id)}&is_visible=eq.true&order=position.asc`);
  return mapPage(page, blockRows || []);
}

export async function readAdminContentPages() {
  const pageRows = await supabaseRest('site_pages?select=id,slug,title,description,seo_title,seo_description,status,published_at,updated_at&order=updated_at.desc', { admin: true });
  const blockRows = await supabaseRest('content_blocks?select=id,page_id,block_key,block_type,position,content,is_visible,updated_at&order=position.asc', { admin: true });
  const blocksByPage = new Map();

  (blockRows || []).forEach((block) => {
    const blocks = blocksByPage.get(block.page_id) || [];
    blocks.push(block);
    blocksByPage.set(block.page_id, blocks);
  });

  return (pageRows || []).map((page) => mapPage(page, blocksByPage.get(page.id) || []));
}

export async function createAdminContentPage(payload) {
  const page = validatePagePayload(payload);
  const rows = await supabaseRest('site_pages?select=id,slug,title,description,seo_title,seo_description,status,published_at,updated_at', {
    method: 'POST',
    admin: true,
    body: [pageRow(page)],
    prefer: 'return=representation',
  });
  const created = rows?.[0];
  if (!created?.id) throw new ContentApiError(502, 'Could not create content page.');
  const blocks = await upsertAdminContentBlocks(created.id, page.blocks);
  return mapPage(created, blocks);
}

export async function updateAdminContentPage(pageId, payload) {
  const page = validatePagePayload(payload);
  const rows = await supabaseRest(`site_pages?id=eq.${encodeFilter(pageId)}&select=id,slug,title,description,seo_title,seo_description,status,published_at,updated_at`, {
    method: 'PATCH',
    admin: true,
    body: pageRow(page),
    prefer: 'return=representation',
  });
  const updated = rows?.[0];
  if (!updated?.id) throw new ContentApiError(404, 'Content page not found.');
  const blocks = await upsertAdminContentBlocks(updated.id, page.blocks);
  return mapPage(updated, blocks);
}

export async function archiveAdminContentPage(pageId) {
  const rows = await supabaseRest(`site_pages?id=eq.${encodeFilter(pageId)}&select=id,slug,title,description,seo_title,seo_description,status,published_at,updated_at`, {
    method: 'PATCH',
    admin: true,
    body: { status: 'archived' },
    prefer: 'return=representation',
  });
  const archived = rows?.[0];
  if (!archived?.id) throw new ContentApiError(404, 'Content page not found.');
  return mapPage(archived, []);
}

export async function upsertAdminContentBlocks(pageId, blocks) {
  if (!blocks?.length) {
    return supabaseRest(`content_blocks?select=id,page_id,block_key,block_type,position,content,is_visible,updated_at&page_id=eq.${encodeFilter(pageId)}&order=position.asc`, { admin: true });
  }

  return supabaseRest('content_blocks?on_conflict=page_id,block_key&select=id,page_id,block_key,block_type,position,content,is_visible,updated_at', {
    method: 'POST',
    admin: true,
    body: blocks.map((block) => blockRow(pageId, block)),
    prefer: 'resolution=merge-duplicates,return=representation',
  });
}

export async function publishAdminContentPage(pageId, changeNote = 'Published from BrewMap Admin') {
  const pages = await readAdminContentPages();
  const current = pages.find((page) => page.id === pageId);
  if (!current) throw new ContentApiError(404, 'Content page not found.');

  const publishedAt = new Date().toISOString();
  const rows = await supabaseRest(`site_pages?id=eq.${encodeFilter(pageId)}&select=id,slug,title,description,seo_title,seo_description,status,published_at,updated_at`, {
    method: 'PATCH',
    admin: true,
    body: { status: 'published', published_at: publishedAt },
    prefer: 'return=representation',
  });
  const published = rows?.[0];
  if (!published?.id) throw new ContentApiError(404, 'Content page not found.');

  await supabaseRest('content_revisions', {
    method: 'POST',
    admin: true,
    body: [{
      page_id: pageId,
      snapshot: current,
      change_note: changeNote,
    }],
    prefer: 'return=minimal',
  });

  return mapPage(published, current.blocks.map((block) => ({
    id: block.id,
    page_id: block.pageId,
    block_key: block.blockKey,
    block_type: block.blockType,
    position: block.position,
    content: block.content,
    is_visible: block.isVisible,
    updated_at: block.updatedAt,
  })));
}

function parseBasicAuthorization(header) {
  if (!header?.startsWith('Basic ')) return null;

  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    if (separator < 0) return null;
    return {
      user: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

export function isAdminRequestAuthorized(request) {
  const adminPassword = process.env.BREWMAP_ADMIN_PASSWORD || '';
  if (!adminPassword) return false;
  const adminUser = process.env.BREWMAP_ADMIN_USER || 'admin';
  const credentials = parseBasicAuthorization(request.headers.get('authorization'));
  return credentials?.user === adminUser && credentials.password === adminPassword;
}

export function adminUnauthorizedResponse() {
  return Response.json(
    { error: 'admin_auth_required' },
    {
      status: 401,
      headers: {
        'cache-control': 'no-store',
        'www-authenticate': 'Basic realm="BrewMap Admin", charset="UTF-8"',
      },
    },
  );
}

export function contentErrorResponse(error) {
  const status = error instanceof ContentApiError ? error.status : 500;
  return Response.json(
    { error: 'content_request_failed', message: error.message },
    { status, headers: { 'cache-control': 'no-store' } },
  );
}
