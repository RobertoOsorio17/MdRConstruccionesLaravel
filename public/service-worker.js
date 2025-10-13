/**
 * Service Worker - MDR Construcciones
 * 
 * Estrategia de caché:
 * - Network First: HTML, API calls
 * - Cache First: CSS, JS, Fonts, Images
 * - Stale While Revalidate: Assets estáticos
 */

const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME = `mdr-construcciones-${CACHE_VERSION}`;

// Recursos críticos para pre-cache
const PRECACHE_URLS = [
    '/',
    '/css/app.css',
    '/js/app.js',
    '/images/logo.png',
    '/manifest.json'
];

// Recursos a cachear en runtime
const RUNTIME_CACHE = {
    images: `${CACHE_NAME}-images`,
    assets: `${CACHE_NAME}-assets`,
    api: `${CACHE_NAME}-api`
};

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...', CACHE_VERSION);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching resources');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...', CACHE_VERSION);
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            // Eliminar cachés antiguas
                            return cacheName.startsWith('mdr-construcciones-') && 
                                   cacheName !== CACHE_NAME &&
                                   !Object.values(RUNTIME_CACHE).includes(cacheName);
                        })
                        .map((cacheName) => {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar peticiones no-GET
    if (request.method !== 'GET') {
        return;
    }

    // Ignorar peticiones a dominios externos (excepto CDNs conocidos)
    if (url.origin !== location.origin && !isTrustedCDN(url.origin)) {
        return;
    }

    // Estrategia según tipo de recurso
    if (request.destination === 'image') {
        event.respondWith(cacheFirstStrategy(request, RUNTIME_CACHE.images));
    } else if (isStaticAsset(url.pathname)) {
        event.respondWith(cacheFirstStrategy(request, RUNTIME_CACHE.assets));
    } else if (isAPICall(url.pathname)) {
        event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE.api));
    } else {
        event.respondWith(networkFirstStrategy(request, CACHE_NAME));
    }
});

/**
 * Cache First Strategy
 * Intenta servir desde caché, si falla va a red
 */
async function cacheFirstStrategy(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
        console.log('[SW] Serving from cache:', request.url);
        return cached;
    }
    
    try {
        const response = await fetch(request);
        
        // Solo cachear respuestas exitosas
        if (response.status === 200) {
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.error('[SW] Fetch failed:', error);
        
        // Retornar página offline si existe
        const offlinePage = await cache.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }
        
        throw error;
    }
}

/**
 * Network First Strategy
 * Intenta red primero, si falla usa caché
 */
async function networkFirstStrategy(request, cacheName) {
    const cache = await caches.open(cacheName);
    
    try {
        const response = await fetch(request);
        
        // Cachear respuestas exitosas
        if (response.status === 200) {
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);
        
        const cached = await cache.match(request);
        if (cached) {
            return cached;
        }
        
        throw error;
    }
}

/**
 * Stale While Revalidate Strategy
 * Sirve desde caché inmediatamente y actualiza en background
 */
async function staleWhileRevalidateStrategy(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    const fetchPromise = fetch(request).then((response) => {
        if (response.status === 200) {
            cache.put(request, response.clone());
        }
        return response;
    });
    
    return cached || fetchPromise;
}

/**
 * Helpers
 */
function isStaticAsset(pathname) {
    return /\.(css|js|woff2?|ttf|eot|svg)$/.test(pathname);
}

function isAPICall(pathname) {
    return pathname.startsWith('/api/') || pathname.startsWith('/inertia/');
}

function isTrustedCDN(origin) {
    const trustedCDNs = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://cdn.jsdelivr.net',
        'https://unpkg.com'
    ];
    return trustedCDNs.includes(origin);
}

// Mensajes desde el cliente
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});

console.log('[SW] Service Worker loaded successfully');

