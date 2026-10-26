const CACHE_NAME = "soh-consults-v7";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  // IMPORTANT:
  // Never intercept page navigation.
  if (request.mode === "navigate") {
    return;
  }

  // Never interfere with Next.js internals or API requests.
  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Route data can contain authenticated editor content, even when it is not
  // a navigation. Cache only asset files; never admin pages or RSC responses.
  if (
    url.pathname === "/admin" || url.pathname.startsWith("/admin/") ||
    request.headers.get("RSC") === "1" || url.searchParams.has("_rsc") ||
    !/\.(?:avif|gif|ico|jpe?g|png|svg|webp|woff2?|ttf|otf|css|js|webmanifest)$/i.test(url.pathname)
  ) {
    return;
  }

  // Only cache ordinary same-origin static resources.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200 || /(?:^|,)\s*(?:private|no-store)\b/i.test(response.headers.get("Cache-Control") || "") || /text\/html|text\/x-component/i.test(response.headers.get("Content-Type") || "")) {
          return response;
        }

        const copy = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, copy);
        });

        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
          return cachedResponse;
        }

        return new Response("", {
          status: 503,
          statusText: "Service Unavailable",
        });
      })
  );
});