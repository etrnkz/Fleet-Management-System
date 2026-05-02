// ── Notification sound ────────────────────────────────────────────────────────
// Play a short chime using the Web Audio API (no external file needed)
function playNotificationSound() {
  try {
    const ctx = new (self.AudioContext || self.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);          // A5
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);   // C#6
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

// ── Push event ────────────────────────────────────────────────────────────────
self.addEventListener('push', function(event) {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch { data = { title: 'Fleet Management', body: event.data.text() }; }

  const title = data.title || 'Fleet Management';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/hulogo.png',
    badge: '/hulogo.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'fleet-notification',
    renotify: true,
    requireInteraction: false,
    silent: false,
    data: { url: data.url || '/', payload: data },
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      // Notify all open tabs so they can show an in-app toast
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'PUSH_NOTIFICATION', title, body: options.body, url: options.data.url, payload: data });
        });
      }),
    ])
  );
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      // Focus existing tab if open
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'NOTIFICATION_CLICK', url });
          return;
        }
      }
      // Otherwise open new tab
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

// ── Background sync / keep-alive ──────────────────────────────────────────────
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

