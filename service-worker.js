var dataCacheName = 'cesiumData-v1';
var cacheName = 'cesiumPWA-v1';
var filesToCache = [
    './',
    './index.html',
    './scripts/app.js',
    './styles/inline.css'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  var dataUrl = '//a.tile.openstreetmap.org';
  if (e.request.url.indexOf(dataUrl) > -1) {
    /*
     * When the request URL contains terrainUrl or imageryUrl, the app is asking for fresh
     * data. In this case, the service worker first goes to the cache and if nothing
     * is found it goes to the network and then caches the response. This is called the "Cache then
     * network" strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
     */
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        cache.match(e.request).then(function(response) {
          if(response){
            return response;
          }
        });
        
        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = e.request.clone();

        return fetch(fetchRequest).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});