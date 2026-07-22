// Service Worker for PDF 超级分割工具 (小王子)
// Caches the app shell + any fetched asset at runtime so the tool works offline.
const CACHE = 'pdf-cutter-v2';
const APP_SHELL = ['./', './PDF-Grid-Cutter-Pro.html', './manifest.webmanifest', './tailwind.min.css'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(APP_SHELL).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(resp => {
        if (resp && (resp.ok || resp.type === 'opaque')) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        }
        return resp;
      }).catch(() => caches.match('./PDF-Grid-Cutter-Pro.html'))
    )
  );
});
