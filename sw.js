// Lexia Service Worker — Android optimizado
const CACHE = 'lexia-v2';
const ASSETS = [
  '/', '/index.html', '/css/main.css',
  '/js/data.js', '/js/app.js', '/js/views/dashboard.js',
  '/manifest.json'
];

// Install: precachear todo
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: limpiar caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first para assets, network-first para API
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // API Anthropic y fonts: siempre red
  if (url.hostname.includes('anthropic.com') || url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) return;
  // Assets propios: cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
