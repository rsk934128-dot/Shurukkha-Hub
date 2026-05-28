
/*
 * Sovereign Service Worker v1.0
 * Handles persistent notifications and background signals for Sirajganj Shurukkha Hub.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/dashboard');
    })
  );
});

// Listener for background messages to update notification
self.addEventListener('message', (event) => {
  if (event.data.action === 'SHOW_ACTIVE_SIGNAL') {
    const options = {
      body: 'আপনার সার্বভৌম সংযোগ বর্তমানে সক্রিয় এবং সুরক্ষিত।',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'sovereign-active-signal',
      requireInteraction: true, // This keeps it persistent
      sticky: true,
      data: {
        timestamp: new Date().toISOString()
      },
      actions: [
        { action: 'open', title: 'Open Dashboard' }
      ]
    };

    self.registration.showNotification('🛡️ Shurukkha Hub: ACTIVE', options);
  } else if (event.data.action === 'CLOSE_ACTIVE_SIGNAL') {
    self.registration.getNotifications({ tag: 'sovereign-active-signal' }).then((notifications) => {
      notifications.forEach((notification) => notification.close());
    });
  }
});
