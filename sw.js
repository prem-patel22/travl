// Service Worker for travl PWA
const CACHE_NAME = 'travl-v1.2.0';
const API_CACHE_NAME = 'travl-api-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/components/header.css',
    '/css/components/footer.css',
    '/css/components/forms.css',
    '/js/main.js',
    '/js/auth.js',
    '/manifest.json'
];

// API endpoints to cache
const API_ENDPOINTS = [
    '/api/destinations',
    '/api/destinations/featured'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // API requests - cache with network-first strategy
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            caches.open(API_CACHE_NAME).then(cache => {
                return fetch(request).then(networkResponse => {
                    // Cache successful API responses
                    if (networkResponse.status === 200) {
                        cache.put(request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // Fallback to cache when offline
                    return cache.match(request);
                });
            })
        );
        return;
    }

    // Static assets - cache-first strategy
    if (request.destination === 'style' || 
        request.destination === 'script' || 
        request.destination === 'image') {
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request).then(networkResponse => {
                    // Cache new resources
                    if (networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, networkResponse.clone());
                        });
                    }
                    return networkResponse;
                });
            })
        );
        return;
    }

    // HTML pages - network-first strategy
    if (request.destination === 'document') {
        event.respondWith(
            fetch(request).then(networkResponse => {
                // Cache successful page loads
                if (networkResponse.status === 200) {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Fallback to cached version
                return caches.match(request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Fallback to offline page
                    return caches.match('/offline.html');
                });
            })
        );
    }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-booking') {
        event.waitUntil(doBackgroundBookingSync());
    }
});

async function doBackgroundBookingSync() {
    const db = await openBookingDB();
    const pendingBookings = await db.getAll('pending-bookings');
    
    for (const booking of pendingBookings) {
        try {
            await fetch('/api/bookings', {
                method: 'POST',
                body: JSON.stringify(booking.data),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': booking.token
                }
            });
            
            // Remove from pending on success
            await db.delete('pending-bookings', booking.id);
        } catch (error) {
            console.error('Background sync failed for booking:', booking.id);
        }
    }
}

// Push notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url
        },
        actions: [
            {
                action: 'view',
                title: 'View Details'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

// Helper function to open IndexedDB
function openBookingDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TravelBookings', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('pending-bookings')) {
                const store = db.createObjectStore('pending-bookings', { keyPath: 'id' });
                store.createIndex('timestamp', 'timestamp');
            }
        };
    });
}