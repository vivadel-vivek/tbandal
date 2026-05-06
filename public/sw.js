// Two Buds and a Leaf — minimal service worker.
//
// Why this exists: Chrome only treats a site as "installable" if it has
// both a web app manifest AND a service worker that handles fetch
// events. So this file does the absolute minimum to qualify, plus a
// small offline-shell cache so a re-visit on the subway still loads the
// home page.
//
// Strategy:
//   - Precache: the app shell (home page, manifest, icons) on install.
//   - Runtime: network-first for HTML and JSON (so editorial updates
//     show immediately), cache-first for static assets (JS, CSS, fonts,
//     images, SVGs) since they're content-hashed by Next.js.
//   - Offline: when the network is down and the request is an HTML
//     navigation, fall back to the cached home page.
//
// We intentionally avoid Workbox / next-pwa to keep the surface tiny
// and auditable. ~80 lines, zero dependencies.

const VERSION = "v1";
const SHELL_CACHE = `tbal-shell-${VERSION}`;
const RUNTIME_CACHE = `tbal-runtime-${VERSION}`;

// Pre-cache the app shell. Keep this list small — anything heavier
// becomes opportunistic via the runtime handler below.
const SHELL_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/assets/mark.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only cache GET requests. POST / PUT / DELETE go straight to network.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Don't try to cache cross-origin requests — let them go straight
  // through (vendor outbound, fonts.googleapis, third-party analytics).
  if (url.origin !== self.location.origin) return;

  // Don't cache the Next.js HMR / dev pipeline or Server Actions.
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;
  if (url.pathname.startsWith("/api/")) return;

  // Navigation requests (HTML pages): network-first, fall back to cache.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Stash a fresh copy for offline.
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached ?? caches.match("/")),
        ),
    );
    return;
  }

  // Static assets: cache-first. Next.js content-hashes its bundles, so
  // cached entries are immutable per URL.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((res) => {
          if (!res || res.status !== 200 || res.type !== "basic") return res;
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => cached);
    }),
  );
});
