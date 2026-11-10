const V = 'oradores-v2';

const FILES = [
  './',
  'index.html',
  'manifest.json',
  'build.js',
  'core.js',
  'style.css',
  'ui.js',
  'template.html',
  'xlsx.full.min.js',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(V)
      .then(c => c.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== V).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      const network = fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(V).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || network;
    })
  );
});