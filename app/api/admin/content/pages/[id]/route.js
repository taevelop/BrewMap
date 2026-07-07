import {
  adminUnauthorizedResponse,
  archiveAdminContentPage,
  contentErrorResponse,
  isAdminRequestAuthorized,
  readAdminContentPages,
  updateAdminContentPage,
} from '../../../../content/content-store';

export const dynamic = 'force-dynamic';

async function pageId(context) {
  const params = await context.params;
  return params.id;
}

export async function GET(request, context) {
  if (!isAdminRequestAuthorized(request)) return adminUnauthorizedResponse();

  try {
    const id = await pageId(context);
    const pages = await readAdminContentPages();
    const page = pages.find((item) => item.id === id || item.slug === id);
    if (!page) {
      return Response.json(
        { error: 'content_page_not_found' },
        { status: 404, headers: { 'cache-control': 'no-store' } },
      );
    }

    return Response.json(
      { source: 'supabase', page },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return contentErrorResponse(error);
  }
}

export async function PATCH(request, context) {
  if (!isAdminRequestAuthorized(request)) return adminUnauthorizedResponse();

  try {
    const page = await updateAdminContentPage(await pageId(context), await request.json());
    return Response.json(
      { source: 'supabase', page },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return contentErrorResponse(error);
  }
}

export async function DELETE(request, context) {
  if (!isAdminRequestAuthorized(request)) return adminUnauthorizedResponse();

  try {
    const page = await archiveAdminContentPage(await pageId(context));
    return Response.json(
      { source: 'supabase', page },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return contentErrorResponse(error);
  }
}
