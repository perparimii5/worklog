const CACHE = 'worklog-pro-v3';
const FILES = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

self.addEventListener('message', e => {
  if (!e.data) return;

  if (e.data.type === 'TEST_NOTIFICATION') {
    self.registration.showNotification('WorkLog', {
      body: 'Kujtuesi funksionon. Do te njoftohesh cdo dite. ✓',
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'test'
    });
  }

  if (e.data.type === 'SCHEDULE_REMINDER') {
    const { delay } = e.data;
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      setTimeout(() => {
        self.registration.showNotification('WorkLog', {
          body: 'Mos harro te shenosh diten e sotme ne WorkLog.',
          icon: './icon-192.png',
          badge: './icon-192.png',
          vibrate: [300, 100, 300],
          tag: 'daily-reminder',
          renotify: true
        });
      }, delay);
    }
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow('./index.html');
    })
  );
});
