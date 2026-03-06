// Firebase Messaging service worker — loaded automatically by FCM SDK
// Mirrors the push handling in sw.js for cases where Firebase uses this file directly
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
