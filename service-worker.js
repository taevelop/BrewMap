const CACHE_NAME = 'brewmap-pwa-v12';
const ASSET_VERSION = '20260618-8';
const APP_SHELL = [
  './',
  './index.html',
  './favicon.ico',
  './favicon.svg',
  './favicon-16x16.png',
  './favicon-32x32.png',
  './apple-touch-icon.png',
  './android-chrome-192x192.png',
  './android-chrome-512x512.png',
  './assets/brewmap-brand-icon.svg',
  './assets/brewmap-cafe-marker.svg',
  './assets/brewmap-cafe-marker-selected.svg',
  './manifest.webmanifest',
  `./src/styles.css?v=${ASSET_VERSION}`,
  `./src/retro-desktop.css?v=${ASSET_VERSION}`,
  `./src/main.js?v=${ASSET_VERSION}`,
  './src/retro-desktop.js',
  './src/map-services.js',
  './data/seed-cafes.csv',
];

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

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './index.html'));
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
