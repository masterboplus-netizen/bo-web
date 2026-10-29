const CACHE_NAME = 'bo-cache-v115';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => { if (key !== CACHE_NAME) return caches.delete(key); }));
    }).then(() => clients.claim())
  );
});
