// ─────────────────────────────────────────────────────────────────────────────
// Firebase Messaging — required for Android background/closed notifications
// ─────────────────────────────────────────────────────────────────────────────
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyDfr_KCpQcyYsaqt0NBkybYpYwBYZj1mkY',
  authDomain:        'dr-monisha-dashboard.firebaseapp.com',
  projectId:         'dr-monisha-dashboard',
  storageBucket:     'dr-monisha-dashboard.firebasestorage.app',
  messagingSenderId: '427008771102',
  appId:             '1:427008771102:web:a955eede505fcdf7eb9a0f',
});

const messaging = firebase.messaging();

// Handles FCM messages when app is backgrounded or closed (Android-critical)
messaging.onBackgroundMessage(payload => {
  const n     = payload.notification || {};
  const d     = payload.data         || {};
  const title = n.title || d.title   || 'New Booking';
  const body  = n.body  || d.body    || '';
  const url   = d.url                || '/admin.html';

  return self.registration.showNotification(title, {
    body,
    icon:  '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data:  { url },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PWA Cache
// ─────────────────────────────────────────────────────────────────────────────
const CACHE_NAME = 'dr-monisha-v6';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  const url = new URL(request.url);

  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/admin.html') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// Notification click — open admin dashboard
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/admin.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Background sync (placeholder)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-appointments') {
    event.waitUntil(Promise.resolve());
  }
});
