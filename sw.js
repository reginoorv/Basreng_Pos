// ===== SERVICE WORKER — BASRENG POS =====
const CACHE = 'basreng-pos-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/admin/index.html',
  '/kasir/index.html',
  '/css/style.css',
  '/js/config.js',
  '/js/db.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install — cache semua asset
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate — hapus cache lama
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first, fallback ke cache
self.addEventListener('fetch', e => {
  // Skip non-GET dan request ke Supabase (selalu online)
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase.co')) return;
  if (e.request.url.includes('cdn.jsdelivr.net')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Simpan ke cache kalau berhasil
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
