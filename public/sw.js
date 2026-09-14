const CACHE = "soh-consults-v3";
const CORE = [
  "/",
  "/updates",
  "/opportunities",
  "/deadlines",
  "/guides",
  "/soh-logo.jpg",
  "/logo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("soh-consults-") && key !== CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Next build assets and API responses must always come from the network.
  // Caching these can make a new deployment load old JavaScript chunks.
  if (url.origin === self.location.origin && (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/api/"))) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        return new Response(
          "You appear to be offline. Please reconnect and try again.",
          {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          }
        );
      })
    );
    return;
  }

  // Cache only successful same-origin static resources.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
