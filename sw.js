const CACHE = "bernstein-coach-v7-cache-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function(event) {
  event.waitUntil((async function() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", function(event) {
  event.waitUntil((async function() {
    const keys = await caches.keys();
    await Promise.all(
      keys.map(function(k) {
        return (k !== CACHE) ? caches.delete(k) : Promise.resolve();
      })
    );
    self.clients.claim();
  })());
});

self.addEventListener("fetch", function(event) {
  const req = event.request;

  event.respondWith((async function() {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });

    if (cached) return cached;

    try {
      const fresh = await fetch(req);
      if (req.method === "GET" && new URL(req.url).origin === location.origin) {
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (e) {
      return cache.match("./index.html");
    }
  })());
});
