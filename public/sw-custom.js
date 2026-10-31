// Notivo Custom Background Service Worker
// Handles Web Push, Notification Clicks, and Background Water Reminders

// 1. Handle Web Push Events (Cloud Web Push / FCM)
self.addEventListener('push', (event) => {
  let data = { title: 'Time to drink water 💧', body: 'Stay hydrated! Maintain your peak performance.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || 'Stay hydrated!',
    icon: '/pwa-192x192.png',
    badge: '/favicon-48x48.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'water-reminder',
    renotify: true,
    data: {
      url: data.url || '/water'
    }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 2. Handle Notification Click (Focus or open the Notivo app)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// 3. Handle Background Water Reminder Messages
let activeWaterTimer = null;

self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SCHEDULE_WATER_REMINDER') {
    const { targetTime } = event.data;
    if (activeWaterTimer) clearTimeout(activeWaterTimer);

    const delay = Math.max(1000, targetTime - Date.now());
    activeWaterTimer = setTimeout(() => {
      self.registration.showNotification('Time to drink water 💧', {
        body: 'Stay hydrated! Maintain your peak performance.',
        icon: '/pwa-192x192.png',
        badge: '/favicon-48x48.png',
        tag: 'water-reminder',
        renotify: true,
        vibrate: [200, 100, 200],
        data: { url: '/water' }
      });
    }, delay);
  }

  if (event.data.type === 'CANCEL_WATER_REMINDER') {
    if (activeWaterTimer) {
      clearTimeout(activeWaterTimer);
      activeWaterTimer = null;
    }
  }
});
