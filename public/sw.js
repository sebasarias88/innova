/*
 * INNOVA service worker.
 * - Pages: network first; a copy is kept so a page already visited opens
 *   without internet; with no copy, the /offline page is shown.
 * - Hashed build files (/_next/static): cache first (their names change on every deploy).
 * - Never touches /admin, /api, /pago, POST requests or other sites.
 * Bump VERSION on every change to this file.
 */
const VERSION = "v1";
const PAGES = `pages-${VERSION}`;
const STATIC = `static-${VERSION}`;
const PRECACHE = ["/offline", "/brand/logo-white.svg", "/brand/icon-192.png"];
const MAX_PAGES = 40;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== PAGES && k !== STATIC).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const skip = (url) =>
  url.pathname.startsWith("/admin") || url.pathname.startsWith("/api") || url.pathname.startsWith("/pago") || url.pathname === "/mantenimiento";

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - max))) await cache.delete(key);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || skip(url)) return;

  // Full page loads (typing the address, refresh, links opened in a new tab).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic" && !response.redirected) {
            const copy = response.clone();
            caches.open(PAGES).then((cache) => cache.put(request, copy).then(() => trim(PAGES, MAX_PAGES)));
          }
          return response;
        })
        .catch(async () => (await caches.match(request, { ignoreVary: true })) ?? (await caches.match("/offline")) ?? Response.error()),
    );
    return;
  }

  // Build files and brand assets: they never change under the same name.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/brand/") || url.pathname.startsWith("/fonts/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
