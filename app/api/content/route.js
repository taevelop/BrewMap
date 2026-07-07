import {
  contentErrorResponse,
  fallbackContentPage,
  readPublicContentPage,
} from './content-store';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'home';

  try {
    const page = await readPublicContentPage(slug);
    return Response.json(
      { source: 'supabase', page },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    const fallback = fallbackContentPage(slug);
    if (!fallback) return contentErrorResponse(error);

    return Response.json(
      { source: 'fallback', page: fallback, warning: error.message },
      { headers: { 'cache-control': 'no-store' } },
    );
  }
}
