const CACHE_NAME = 'ecotaarifa-v27';
const ASSETS_TO_CACHE = [
  './',
  'index.php',
  'css/styles.css',
  'js/app.js',
  'assets/logo.svg',
  'manifest.json',
  'assets/icon-192.png',
  'assets/icon-512-02.png',
  'assets/apple-touch-icon-180.png',
  'assets/favicon.svg',
  'assets/Success.json',
  'assets/Failed.json',
  'assets/Check Mark !.json',
  'assets/No internet connection.json',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
  'https://unpkg.com/lucide@latest/dist/umd/lucide.js',
  'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate Event
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

// Fetch Event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategy: Network First for PHP/dynamic content, Cache First for static assets
  if (url.pathname.endsWith('.php') || url.pathname === '/' || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => response)
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          
          // If the specific page is not in cache, fallback to the main login shell
          return caches.match('index.php') || caches.match('./');
        })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((response) => {
          if (response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
      })
    );
  }
});
