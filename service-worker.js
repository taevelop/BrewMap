const CACHE_NAME = 'brewmap-pwa-v17';
const ASSET_VERSION = '20260627-curation-preview';
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
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
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

function cacheFreshResponse(request, response) {
  if (!response || !response.ok) return response;
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
    event.respondWith(networkFirst(request, '/'));
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
