const V = 'oradores-44a818751de8562d';
const PREFIX = 'lista-oradores:' + self.registration.scope + ':';
const CACHE = PREFIX + V;
const FILES = ['./','index.html','manifest.json','xlsx.full.min.js','icone_app_192.png','icone_app_512.png','icone_app_512_maskable.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const assets = FILES.map(file => new URL(file, self.registration.scope).href);
  if (event.request.method !== 'GET' || !assets.includes(event.request.url)) return;
  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(event.request)) || fetch(event.request)));
});
