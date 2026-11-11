const V = 'oradores-76e3e54ed22c95e6';
const PREFIX = 'lista-oradores:' + self.registration.scope + ':';
const CACHE = PREFIX + V;
const FILES = ['./','index.html','manifest.json','xlsx.full.min.js','icon-192.png','icon-512.png','icon-maskable-512.png'];
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
