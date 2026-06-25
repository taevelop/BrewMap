import { createServer } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const port = Number(process.env.PORT || 4173);
const root = process.cwd();
const adminUser = process.env.BREWMAP_ADMIN_USER || 'admin';
const adminPassword = process.env.BREWMAP_ADMIN_PASSWORD || '';
const adminRealm = 'BrewMap Admin';
const types = {
  '.json': 'application/json; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function adminCredentials(request) {
  const header = request.headers.authorization || '';
  if (!header.startsWith('Basic ')) return null;

  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    if (separator < 0) return null;
    return { user: decoded.slice(0, separator), password: decoded.slice(separator + 1) };
  } catch {
    return null;
  }
}

function isAdminAuthorized(request) {
  if (!adminPassword) return false;
  const credentials = adminCredentials(request);
  return Boolean(credentials) && safeEqual(credentials.user, adminUser) && safeEqual(credentials.password, adminPassword);
}

function requireAdmin(request, response) {
  if (isAdminAuthorized(request)) return true;
  response.writeHead(401, {
    'content-type': 'application/json; charset=utf-8',
    'www-authenticate': 'Basic realm="' + adminRealm + '", charset="UTF-8"',
    'cache-control': 'no-store',
  });
  response.end(JSON.stringify({ error: 'admin_auth_required' }));
  return false;
}

function writeJson(response, status, payload) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://localhost:${port}`);
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;

  if (pathname === '/admin' || pathname === '/admin.html') {
    if (!requireAdmin(request, response)) return;
    const adminPath = normalize(join(root, 'admin.html'));
    try {
      const body = await readFile(adminPath);
      response.writeHead(200, { 'content-type': types['.html'], 'cache-control': 'no-store' });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
    return;
  }

  if (pathname.startsWith('/api/admin/')) {
    if (!requireAdmin(request, response)) return;
    if (pathname === '/api/admin/session' && request.method === 'GET') {
      writeJson(response, 200, { role: 'admin', user: adminUser });
      return;
    }
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      writeJson(response, 202, { ok: true, guarded: true });
      return;
    }
    writeJson(response, 404, { error: 'not_found' });
    return;
  }

  const filePath = normalize(join(root, pathname));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, { 'content-type': types[extname(filePath)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
}).listen(port, '0.0.0.0', () => console.log(`BrewMap running at http://localhost:${port}`));
