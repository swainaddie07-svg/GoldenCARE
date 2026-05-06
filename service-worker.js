// GoldenCare Service Worker
// This makes the app work offline + enables notifications

const CACHE_NAME = 'goldencare-v3';
const urlsToCache = ['goldencare.html'];

// Install — cache app files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            // Focus existing window or open new one
            for (const client of clientList) {
                if (client.url.includes('goldencare') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('goldencare.html');
            }
        })
    );
});

// Receive push messages (for future server-based notifications)
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || '💊 GoldenCare Reminder';
    const options = {
        body: data.body || 'Time to check your medicine!',
        icon: data.icon || '💊',
        badge: '💊',
        vibrate: [300, 100, 300, 100, 300],
        requireInteraction: true, // Stays until user taps
        actions: [
            { action: 'taken', title: '✅ Taken' },
            { action: 'snooze', title: '⏰ Snooze 10min' }
        ]
    };
    event.waitUntil(self.registration.showNotification(title, options));
});
