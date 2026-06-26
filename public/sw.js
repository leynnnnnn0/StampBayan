const CACHE_NAME = 'stampbayan-pwa-v1';
const SHELL_URLS = [
    '/',
    '/customer/dashboard',
    '/site.webmanifest',
    '/favicon.svg',
    '/web-app-manifest-192x192.png',
    '/web-app-manifest-512x512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS).catch(() => null)),
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== CACHE_NAME)
                        .map((key) => caches.delete(key)),
                ),
            ),
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const request = event.request;

    if (request.method !== 'GET') {
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                        if (new URL(request.url).pathname === '/customer/dashboard') {
                            cache.put('/customer/dashboard', response.clone());
                        }
                    });
                    return response;
                })
                .catch(async () => {
                    const cached = await caches.match(request);
                    return (
                        cached ||
                        (await caches.match('/customer/dashboard')) ||
                        (await caches.match('/')) ||
                        Response.error()
                    );
                }),
        );
        return;
    }

    event.respondWith(
        caches.match(request).then(
            (cached) =>
                cached ||
                fetch(request)
                    .then((response) => {
                        if (response.ok) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseClone);
                            });
                        }
                        return response;
                    })
                    .catch(() => cached),
        ),
    );
});
