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
  var terrainUrl = '//assets.agi.com'; 
  var imageryUrl = '//a.tile.openstreetmap.org';
  if (e.request.url.indexOf(imageryUrl) > -1 || e.request.url.indexOf(terrainUrl) > -1) {
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
        
        return fetch(e.request).then(function(response){
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