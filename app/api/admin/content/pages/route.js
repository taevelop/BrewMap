import {
  adminUnauthorizedResponse,
  clonePage,
  contentErrorResponse,
  createAdminContentPage,
  defaultContentPage,
  isAdminRequestAuthorized,
  readAdminContentPages,
} from '../../../content/content-store';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!isAdminRequestAuthorized(request)) return adminUnauthorizedResponse();

  try {
    const pages = await readAdminContentPages();
    return Response.json(
      { source: 'supabase', pages },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return Response.json(
      { source: 'fallback', readOnly: true, pages: [clonePage(defaultContentPage)], warning: error.message },
      { headers: { 'cache-control': 'no-store' } },
    );
  }
}

export async function POST(request) {
  if (!isAdminRequestAuthorized(request)) return adminUnauthorizedResponse();

  try {
    const page = await createAdminContentPage(await request.json());
    return Response.json(
      { source: 'supabase', page },
      { status: 201, headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return contentErrorResponse(error);
  }
}
