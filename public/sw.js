const CACHE_NAME = "soh-consults-v4";

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

  // Never cache Next.js internals or API routes.
  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Always get pages directly from the network.
  // This prevents stale or broken PWA responses on dynamic routes.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          `
            <!doctype html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>S.O.H CONSULTS</title>
              </head>
              <body style="font-family:Arial,sans-serif;padding:40px;text-align:center">
                <h1>S.O.H CONSULTS</h1>
                <p>You appear to be offline.</p>
                <p>Please reconnect to the internet and refresh this page.</p>
              </body>
            </html>
          `,
          {
            status: 503,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
            },
          }
        );
      })
    );

    return;
  }

  // Static files can use network-first caching.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }

        const responseClone = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
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