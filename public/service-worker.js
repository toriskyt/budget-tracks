const STATIC_CACHE = "static-cache-v1"
const RUNTIME_CACHE = "runtime-cache"
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/db.js"
]

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(FILES_TO_CACHE)
        })
            .then(() => {
                return self.skipWaiting()
            })
    )
})

self.addEventListener("activate", event => {
    const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
    event.waitUntil(
        caches
            .keys()
            .then(cacheNames => {
                // return array of cache names that are old to delete
                return cacheNames.filter(
                    cacheName => !currentCaches.includes(cacheName)
                );
            })
            .then(cachesToDelete => {
                return Promise.all(
                    cachesToDelete.map(cacheToDelete => {
                        return caches.delete(cacheToDelete);
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
        event.respondWith(fetch(event.request))
        return
    }

    if (event.request.url.includes("/api/transaction")) {
        event.respondWith(
            caches.open(RUNTIME_CACHE).then((cache) => {
                return fetch(event.request)
                    .then((response) => {
                        cache.put(event.request, response.clone())
                        return response
                    })
                    .catch(() => {
                        return caches.match(event.request)
                    })
            })
        )
        return
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse
            }

            return caches.open(RUNTIME_CACHE).then((cache)=> {
                return fetch(event.request).then((response)=> {
                    return cache.put(event.request, response.clone()).then(() => {
                        return response
                    })
                })
            })
        })
    )
}) 
