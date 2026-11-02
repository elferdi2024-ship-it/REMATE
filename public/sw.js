// Service Worker — Distribuidora El Remate
// v5 — cache versionado + limpieza forzada
const CACHE_VERSION = 'v5';
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
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        // Carga tolerante: Si un asset da error de red o 404, no rompe la instalación
        await Promise.allSettled(
          PRECACHE_ASSETS.map(async (url) => {
            try {
              const res = await fetch(url);
              if (res && res.status >= 200 && res.status < 300) {
                await cache.put(url, res);
              }
            } catch (err) {
              console.warn('[SW] No se pudo precachear:', url, err);
            }
          })
        );
      })
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
