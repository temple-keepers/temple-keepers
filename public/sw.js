// Service Worker for Push Notifications

self.addEventListener('push', function(event) {
  if (!event.data) return

  const data = event.data.json()
  
  const options = {
    body: data.message || data.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.action_url || data.url || '/',
      notificationId: data.id
    },
    actions: data.actions || [],
    tag: data.tag || data.id,
    renotify: true
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus()
            client.navigate(url)
            return
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  // Could track analytics here
  console.log('Notification closed:', event.notification.tag)
})