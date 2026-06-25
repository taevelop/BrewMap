export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(
    {
      role: 'admin',
      user: process.env.BREWMAP_ADMIN_USER || 'admin',
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}
