const CACHE_NAME = 'bo-cache-v128';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => clients.claim())
  );
});
// Никакого fetch-кеширования, чтобы всегда тянуло свежие данные с сервера
