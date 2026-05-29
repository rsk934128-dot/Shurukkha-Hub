
/**
 * @fileOverview Sovereign Service Worker.
 * Handles background notifications and active signals for Shurukkha Hub.
 */

self.addEventListener('install', (event) => {
  console.log('[Sovereign SW] Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Sovereign SW] Activated');
  event.waitUntil(clients.claim());
});

// Listener for background notifications
self.addEventListener('message', (event) => {
  if (event.data) {
    if (event.data.action === 'SHOW_NOTIFICATION') {
      const { title, body, icon, tag, data } = event.data.payload;
      self.registration.showNotification(title, {
        body,
        icon: icon || '/favicon.ico',
        tag: tag || 'sovereign-signal',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        data: data || {},
        requireInteraction: true
      });
    }

    if (event.data.action === 'SHOW_ACTIVE_SIGNAL') {
      self.registration.showNotification('Sovereign Signal Active', {
        body: 'আপনি বর্তমানে সিরাজগঞ্জ সুরক্ষা সাম্রাজ্যের সাথে যুক্ত আছেন।',
        icon: '/favicon.ico',
        tag: 'persistent-signal',
        silent: true,
        sticky: true
      });
    }

    if (event.data.action === 'CLOSE_ACTIVE_SIGNAL') {
      self.registration.getNotifications({ tag: 'persistent-signal' }).then(notifications => {
        notifications.forEach(n => n.close());
      });
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/dashboard');
    })
  );
});
