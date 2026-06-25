import { NextResponse } from 'next/server';

const adminRealm = 'BrewMap Admin';

function unauthorized() {
  return new NextResponse(JSON.stringify({ error: 'admin_auth_required' }), {
    status: 401,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'www-authenticate': `Basic realm="${adminRealm}", charset="UTF-8"`,
    },
  });
}

function parseBasicAuthorization(header) {
  if (!header?.startsWith('Basic ')) return null;

  try {
    const decoded = atob(header.slice(6));
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

function isAdminAuthorized(request) {
  const adminPassword = process.env.BREWMAP_ADMIN_PASSWORD || '';
  if (!adminPassword) return false;

  const credentials = parseBasicAuthorization(request.headers.get('authorization'));
  const adminUser = process.env.BREWMAP_ADMIN_USER || 'admin';
  return credentials?.user === adminUser && credentials.password === adminPassword;
}

export function proxy(request) {
  if (!isAdminAuthorized(request)) return unauthorized();
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/admin.html', '/api/admin/:path*'],
};

