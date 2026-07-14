const CACHE_NAME = 'nafa-v1';
const APP_SHELL = [
    '/nafa/index.html',
    '/nafa/css/style.css',
    '/nafa/js/app.js',
    '/nafa/js/offline-manager.js',
    '/nafa/images/logo.png',
    '/nafa/images/nafa-icon.svg',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                APP_SHELL.map((url) =>
                    cache.add(url).catch((err) => {
                        console.warn('Failed to cache:', url, err);
                    })
                )
            );
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET') {
        return;
    }

    if (url.pathname.startsWith('/nafa/api/')) {
        event.respondWith(
            fetch(request).catch(() => {
                return new Response(
                    JSON.stringify({ success: false, message: 'Hors ligne' }),
                    { headers: { 'Content-Type': 'application/json' }, status: 503 }
                );
            })
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) {
                return cached;
            }

            return fetch(request).then((response) => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, clone);
                    });
                }
                return response;
            }).catch(() => {
                if (request.destination === 'document' || request.mode === 'navigate') {
                    return caches.match('/nafa/index.html');
                }
                return new Response('Offline', { status: 503 });
            });
        })
    );
});

self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-ventes') {
        event.waitUntil(syncOfflineData());
    }
});

async function syncOfflineData() {
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
        client.postMessage({ type: 'SYNC_REQUESTED' });
    });
}
