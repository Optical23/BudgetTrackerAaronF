const VERSION = 'v1';
const APP_PREFIX = 'budge-tracker'
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = 'data-cache-' + VERSION;

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  '/js/idb.js',
  '/js/index.js',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
        console.log('installing cache : ' + CACHE_NAME);
          return cache.addAll(FILES_TO_CACHE)
        })
    )
});

self.addEventListener('fetch', (e) => {
    //Cache all get request from /api/ routes
    if (e.request.url.includes('/api/')) {
        e.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(e.request).then(response => {
                    //Response passed it caches the response
                    if(response.status === 200) {
                        cache.put(e.request.url, response.clone());
                    }
                    return response
                }).catch(error => {
                    //If connection failed return the cache
                    return cache.match(e.request);
                });
            })
        );
        return;
    };
    e.respondWith(
        fetch(e.request).catch(() => {
            return caches.match(e.request).then(response => {
                if(response) {
                    return response;
                }else if (e.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/');
                }
            });
        })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keyList => {
            let cacheKeepList = keyList.filter(key => {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeepList.push(CACHE_NAME);
  
            return Promise.all(
            keyList.map(function(key, i) {
                if (cacheKeepList.indexOf(key) === -1) {
                console.log('deleting cache : ' + keyList[i]);
                return caches.delete(keyList[i]);
                }
            })
            );
        })
    )
});
