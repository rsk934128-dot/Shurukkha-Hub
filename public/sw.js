
/**
 * @fileOverview Sovereign Service Worker.
 * Handles background signals and persistent notifications with actions.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data.action === 'SHOW_ACTIVE_SIGNAL') {
    self.registration.showNotification('Shurukkha Hub: Online', {
      body: 'আপনার সার্বভৌম সংযোগ ব্যাকগ্রাউন্ডে সক্রিয় আছে।',
      icon: '/favicon.ico',
      tag: 'active-signal',
      sticky: true,
      silent: true,
      renotify: false
    });
  }

  if (event.data.action === 'CLOSE_ACTIVE_SIGNAL') {
    self.registration.getNotifications({ tag: 'active-signal' }).then((notifications) => {
      notifications.forEach((n) => n.close());
    });
  }

  if (event.data.action === 'SHOW_NOTIFICATION') {
    const { title, body, tag, actions } = event.data.payload;
    self.registration.showNotification(title, {
      body,
      tag,
      icon: '/favicon.ico',
      vibrate: [200, 100, 200],
      actions: actions || []
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Handle Action Buttons
  if (event.action === 'accept-call') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.postMessage({ action: 'ACCEPT_CALL_FROM_NOTIFICATION' });
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/dashboard');
        }
      })
    );
  } else {
    // Default click behavior: Open the app
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow('/');
      })
    );
  }
});
