import {
  adminUnauthorizedResponse,
  contentErrorResponse,
  isAdminRequestAuthorized,
  publishAdminContentPage,
} from '../../../../../content/content-store';

export const dynamic = 'force-dynamic';

export async function POST(request, context) {
  if (!isAdminRequestAuthorized(request)) return adminUnauthorizedResponse();

  try {
    const params = await context.params;
    const payload = await request.json().catch(() => ({}));
    const page = await publishAdminContentPage(params.id, payload.changeNote);

    return Response.json(
      { source: 'supabase', page },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return contentErrorResponse(error);
  }
}
