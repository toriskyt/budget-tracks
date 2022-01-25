const STATIC_CACHE = "static-cache-v1"
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/styles.css",
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