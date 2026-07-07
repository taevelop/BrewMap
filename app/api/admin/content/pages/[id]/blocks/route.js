import {
  adminUnauthorizedResponse,
  contentErrorResponse,
  isAdminRequestAuthorized,
  upsertAdminContentBlocks,
  validateBlockPayload,
} from '../../../../../content/content-store';

export const dynamic = 'force-dynamic';

async function pageId(context) {
  const params = await context.params;
  return params.id;
}

async function upsertBlocks(request, context) {
  if (!isAdminRequestAuthorized(request)) return adminUnauthorizedResponse();

  try {
    const payload = await request.json();
    const blocks = Array.isArray(payload.blocks)
      ? payload.blocks.map(validateBlockPayload)
      : [validateBlockPayload(payload)];
    const rows = await upsertAdminContentBlocks(await pageId(context), blocks);

    return Response.json(
      { source: 'supabase', blocks: rows },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return contentErrorResponse(error);
  }
}

export function POST(request, context) {
  return upsertBlocks(request, context);
}

export function PATCH(request, context) {
  return upsertBlocks(request, context);
}
