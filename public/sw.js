// public/sw.js
self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver productos',
        icon: '/checkmark.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Tu Tienda', options)
  );
});