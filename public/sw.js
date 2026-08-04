// Service Worker — Distribuidora El Remate
// v3 — cache versionado + offline robusto
const CACHE_VERSION = 'v3';
const CACHE_NAME = `elremate-cache-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/',
  '/catalogo',
  '/ofertas',
  '/manifest.json',
  '/logo.png',
  '/icon-512x512.png',
];

// ── INSTALL ───────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ── FETCH (Stale-While-Revalidate) ────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo manejar GETs. Ignorar APIs y Firestore.
  if (
    request.method !== 'GET' ||
    request.url.includes('/api/') ||
    request.url.includes('firestore.googleapis.com') ||
    request.url.includes('googleapis.com') ||
    request.url.startsWith('chrome-extension')
  ) {
    return;
  }

  // Para navegación HTML: Network-first, fallback a caché
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Guardar en caché si la respuesta es válida
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/catalogo')))
    );
    return;
  }

  // Para assets estáticos: Cache-first, actualizar en background
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
