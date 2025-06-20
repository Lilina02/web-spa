// Push notification handler dengan try-catch
self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.warn('Push event data tidak valid JSON:', error);
    data = {};
  }

  const title = data.title || 'Notifikasi';
  const options = data.options || {
    body: 'Notifikasi baru dari Dicoding Story!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Cache name dan daftar file statis - DIPERBAIKI: hanya file yang pasti ada
const CACHE_NAME = 'app-cerita-cache-v6'; // Update versi cache lagi
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/styles.css',
  '/scripts/index.js',
  '/manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  // Icons ditambahkan jika ada
];

// Daftar CSS yang akan di-cache secara dinamis
const CSS_PATTERNS = [
  '/styles/',
  'home.css',
  'detail.css', 
  'add.css'
];

// Install service worker dan cache file statis - DIPERBAIKI: cache satu per satu
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell');
        // Cache satu per satu untuk debugging
        return Promise.all(
          urlsToCache.map(url => 
            cache.add(url).then(() => {
              console.log('✓ Cached:', url);
            }).catch(error => {
              console.warn('✗ Failed to cache:', url, error);
              // Don't fail the entire installation
            })
          )
        );
      })
      .then(() => {
        console.log('App shell cached (with possible warnings)');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Critical cache failure:', error);
      })
  );
});

// Activate service worker dan hapus cache lama
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      ))
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// PERBAIKAN UTAMA: Simplified fetch handler
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle CSS and static assets dengan prioritas tinggi
  if (
    request.destination === 'style' ||
    url.pathname.endsWith('.css') ||
    CSS_PATTERNS.some(pattern => url.pathname.includes(pattern)) ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    url.pathname.match(/\.(?:js|png|jpg|jpeg|gif|svg|webp)$/)
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(cachedResponse => {
          if (cachedResponse) {
            console.log('✓ Cache hit:', request.url);
            return cachedResponse;
          }

          console.log('⟳ Fetching:', request.url);
          return fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
              console.log('✓ Caching:', request.url);
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(error => {
            console.error('✗ Network error:', request.url, error);
            
            // Fallback untuk CSS - return minimal CSS
            if (request.destination === 'style' || url.pathname.endsWith('.css')) {
              return new Response('/* Offline - CSS not available */', {
                status: 200,
                headers: { 'Content-Type': 'text/css' }
              });
            }
            
            // Fallback untuk images
            if (request.destination === 'image') {
              return cache.match('/icon-192.png') || new Response();
            }
            
            throw error;
          });
        });
      })
    );
  }
  // API requests
  else if (url.pathname.includes('/v1/stories')) {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        }
        return response;
      }).catch(() => {
        return caches.match(request).then(cached => {
          return cached || new Response('{"error":"Offline"}', {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        });
      })
    );
  }
  // HTML documents
  else if (request.destination === 'document') {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        }
        return response;
      }).catch(() => {
        return caches.match(request).then(cached => {
          return cached || caches.match('/index.html') || caches.match('/');
        });
      })
    );
  }
});