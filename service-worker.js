
/* =========================================
   CATATANKU - SERVICE WORKER
   PWA + OFFLINE SUPPORT
========================================= */

// Versi cache aplikasi
const CACHE_NAME = "catatanku-v2";

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

  console.log("CatatanKu: Service Worker installing...");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(APP_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );

});

// =========================================
// 2. ACTIVATE
// =========================================

self.addEventListener("activate", event => {

  console.log("CatatanKu: Service Worker activated");

  event.waitUntil(
    caches.keys().then(cacheNames => {

      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );

    }).then(() => {
      return self.clients.claim();
    })
  );

});

// =========================================
// 3. FETCH
// =========================================

self.addEventListener("fetch", event => {

  const request = event.request;

  // Hanya menangani GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Hanya file dari website sendiri
  if (url.origin !== self.location.origin) return;

  event.respondWith(

    fetch(request)
      .then(response => {

        // Simpan respons yang berhasil
        if (response.ok && response.type === "basic") {

          const responseCopy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseCopy);
          });

        }

        return response;

      })

      .catch(async () => {

        // Ambil file dari cache jika offline
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
          return cachedResponse;
        }

        // Fallback halaman utama
        if (request.mode === "navigate") {

          const homepage = await caches.match("./index.html");

          if (homepage) {
            return homepage;
          }

        }

        // Jika file tidak ditemukan
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

console.log("CatatanKu Service Worker siap!");
