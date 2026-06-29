const CACHE_NAME = 'brewmap-pwa-v18';
const ASSET_VERSION = '20260629-runtime-recovery';
const APP_SHELL = [
  '/',
  '/retro',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/assets/brewmap-brand-icon.svg',
  '/assets/brewmap-cafe-marker.svg',
  '/assets/brewmap-cafe-marker-selected.svg',
  '/assets/curation/jeonpo-local-espresso.png',
  '/assets/curation/haeundae-seaside-cafe.png',
  '/assets/curation/handdrip-detail-tools.png',
  '/manifest.webmanifest',
  '/data/seed-cafes.csv',
];

void ASSET_VERSION;

self.addEventListener('install', (event) => {
  event.waitUntil(
    precacheAppShell()
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function responseContentType(response) {
  return response.headers.get('content-type')?.toLowerCase() || '';
}

function isHtmlResponse(response) {
  return responseContentType(response).includes('text/html');
}

async function isVercelLoginResponse(response) {
  if (!isHtmlResponse(response)) return false;

  const body = await response.clone().text().catch(() => '');
  return /<title>\s*Login [–-] Vercel\s*<\/title>/i.test(body) || body.includes('data-dpl-id=');
}

async function shouldCacheResponse(request, response) {
  if (!response || !response.ok) return false;
  if (await isVercelLoginResponse(response)) return false;

  const requestUrl = new URL(request.url, self.location.origin);
  if (isHtmlResponse(response)) return ['/', '/retro'].includes(requestUrl.pathname);

  return true;
}

async function precacheAppShell() {
  const cache = await caches.open(CACHE_NAME);

  await Promise.all(APP_SHELL.map(async (url) => {
    try {
      const request = new Request(url, { cache: 'reload' });
      const response = await fetch(request);
      if (await shouldCacheResponse(request, response)) await cache.put(url, response.clone());
    } catch {
      // A protected or offline asset should not block service worker activation.
    }
  }));
}

async function cacheFreshResponse(request, response) {
  if (!(await shouldCacheResponse(request, response))) return response;
  const copy = response.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  return response;
}

function networkFirst(request, fallbackRequest = request) {
  return fetch(request)
    .then((response) => cacheFreshResponse(request, response))
    .catch(() => caches.match(request).then((cached) => cached || caches.match(fallbackRequest)));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

  if (requestUrl.pathname === '/admin' || requestUrl.pathname.startsWith('/admin/') || requestUrl.pathname === '/admin.html' || requestUrl.pathname.startsWith('/api/')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(request).then((cached) => cached || caches.match('/'))));
    return;
  }

  if (requestUrl.pathname.endsWith('/data/seed-cafes.csv')) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (['script', 'style', 'worker'].includes(request.destination)) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cached) => cached || fetch(request).then((response) => cacheFreshResponse(request, response))),
  );
});
