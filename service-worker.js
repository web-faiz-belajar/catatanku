
/* =========================================
   CATATANKU - SERVICE WORKER
   PWA + OFFLINE SUPPORT
========================================= */

// Versi cache aplikasi
const CACHE_NAME = "catatanku-v3";

// File utama aplikasi
const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js"
];

// =========================================
// 1. INSTALL
// =========================================

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );

});

// =========================================
// 2. ACTIVATE
// =========================================

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(cacheNames => {

      return Promise.all(
        cacheNames
          .filter(name =>
            name.startsWith("catatanku-") &&
            name !== CACHE_NAME
          )
          .map(name => caches.delete(name))
      );

    }).then(() => self.clients.claim())

  );

});

// =========================================
// 3. FETCH
// =========================================

self.addEventListener("fetch", event => {

  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(

    fetch(request)
      .then(async response => {

        if (response.ok && response.type === "basic") {

          const cache = await caches.open(CACHE_NAME);

          await cache.put(request, response.clone());

        }

        return response;

      })

      .catch(async () => {

        const cached = await caches.match(request);

        if (cached) return cached;

        if (request.mode === "navigate") {

          const homepage = await caches.match("./index.html");

          if (homepage) return homepage;

        }

        return new Response(
          "Halaman tidak tersedia. Periksa koneksi internet.",
          {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8"
            }
          }
        );

      })

  );

});

console.log("CatatanKu Service Worker v3 aktif!");
