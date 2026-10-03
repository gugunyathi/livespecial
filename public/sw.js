// AutoCom PWA Service Worker - Offline Resilience & Asset Caching
const CACHE_NAME = "autocom-cache-v1";

const PRECACHE_ASSETS = ["/", "/favicon.ico", "/manifest.webmanifest"];

// Install: precache critical shell resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn("[SW] Precache failed:", err);
      }),
  );
});

// Activate: purge stale cache buckets & claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch: Network-First with Cache Fallback for navigation, Cache-First for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignore non-GET and chrome-extension / non-http requests
  if (request.method !== "GET" || !request.url.startsWith("http")) {
    return;
  }

  // Navigation requests (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          // Fallback to cached page shell when offline
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallbackShell = await caches.match("/");
          return (
            fallbackShell ||
            new Response("Offline - AutoCom Cache Available", {
              status: 200,
              headers: { "Content-Type": "text/html" },
            })
          );
        }),
    );
    return;
  }

  // Static Assets (scripts, styles, fonts, images) -> Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    }),
  );
});
