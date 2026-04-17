// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/hulogo.png',
    badge: '/hulogo.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      notificationId: data.id
    },
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Fleet Management', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
