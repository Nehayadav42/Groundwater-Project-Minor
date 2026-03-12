const CACHE_NAME = "dwlr-cache-v1";

// List of files to always cache
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
];

// Install event → pre-cache important assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event → cleanup old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
});

// Fetch event → cache-first for static files, network-first for others
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return; // don’t cache POST/PUT requests

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // serve from cache
      }

      return fetch(event.request)
        .then(networkResponse => {
          // Cache new files
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Offline fallback (optional)
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
