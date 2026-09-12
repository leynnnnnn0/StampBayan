const CACHE_NAME = 'stampbayan-pwa-v2';
const SHELL_URLS = [
    '/site.webmanifest',
    '/favicon.svg',
    '/web-app-manifest-192x192.png',
    '/web-app-manifest-512x512.png',
];
const STATIC_DESTINATIONS = new Set([
    'style',
    'script',
    'image',
    'font',
    'manifest',
]);

const offlineResponse = () =>
    new Response(
        `<!doctype html>
    <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>StampBayan is offline</title>
            <style>
                body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f8fafc; color: #0f172a; font-family: system-ui, sans-serif; }
                main { width: min(88vw, 28rem); text-align: center; }
                button { border: 0; border-radius: .75rem; background: #f6b733; color: #111827; cursor: pointer; font: inherit; font-weight: 700; padding: .8rem 1.2rem; }
                p { color: #475569; line-height: 1.6; }
            </style>
        </head>
        <body>
            <main>
                <h1>You're offline</h1>
                <p>Reconnect to the internet, then refresh StampBayan.</p>
                <button type="button" onclick="location.reload()">Refresh</button>
            </main>
        </body>
    </html>`,
        {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        },
    );

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(SHELL_URLS).catch(() => null)),
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
                    const url = new URL(request.url);

                    if (
                        response.ok &&
                        !response.redirected &&
                        url.origin === self.location.origin &&
                        url.pathname === '/customer/dashboard' &&
                        new URL(response.url).pathname === '/customer/dashboard'
                    ) {
                        const responseClone = response.clone();
                        caches
                            .open(CACHE_NAME)
                            .then((cache) =>
                                cache.put('/customer/dashboard', responseClone),
                            );
                    }

                    return response;
                })
                .catch(async () => {
                    const url = new URL(request.url);

                    if (url.pathname === '/customer/dashboard') {
                        const cachedDashboard = await caches.match(
                            '/customer/dashboard',
                        );
                        if (cachedDashboard) return cachedDashboard;
                    }

                    return offlineResponse();
                }),
        );
        return;
    }

    if (
        new URL(request.url).origin !== self.location.origin ||
        !STATIC_DESTINATIONS.has(request.destination)
    ) {
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
