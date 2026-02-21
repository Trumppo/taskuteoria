const CACHE_VERSION = "taskuteoria-v3";
const scope = new URL(self.registration.scope);
const basePath = scope.pathname.endsWith("/") ? scope.pathname : `${scope.pathname}/`;
const withBase = (path) => new URL(path, scope).pathname;
const OFFLINE_URL = withBase("offline.html");
const PRECACHE_URLS = [
  basePath,
  withBase("index.html"),
  withBase("harjoittele/"),
  withBase("polku/"),
  withBase("kortit/"),
  withBase("kuuntele/"),
  withBase("kirjasto/"),
  withBase("asetukset/"),
  withBase("valitsin/"),
  withBase("pikavisa/"),
  withBase("manifest.webmanifest"),
  withBase("icon.svg"),
  OFFLINE_URL,
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const request = event.request;
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, cloned));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match(OFFLINE_URL);
        }),
    );
    return;
  }

  if (isSameOrigin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            const cloned = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, cloned));
            return response;
          })
          .catch(() => caches.match(OFFLINE_URL));
      }),
    );
  }
});
