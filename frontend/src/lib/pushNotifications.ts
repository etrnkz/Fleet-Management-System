const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

/** Play a short two-tone chime using Web Audio API — no external file needed */
export function playNotificationSound(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [880, 1100]; // A5 → C#6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  } catch {}
}

/** Show a browser Notification directly (foreground fallback) */
export function showBrowserNotification(title: string, body: string, url = '/'): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const n = new Notification(title, {
    body,
    icon: '/hulogo.png',
    badge: '/hulogo.png',
    tag: 'fleet-foreground',
    renotify: true,
  });
  n.onclick = () => { window.focus(); if (url !== '/') window.location.href = url; n.close(); };
}

/**
 * Listen for messages from the service worker.
 * When a push arrives while the app is open, the SW sends a postMessage
 * so we can show an in-app toast + play sound.
 *
 * @param onNotification callback with { title, body, url }
 * @returns cleanup function
 */
export function listenForPushMessages(
  onNotification: (data: { title: string; body: string; url: string }) => void
): () => void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return () => {};

  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'PUSH_NOTIFICATION') {
      playNotificationSound();
      onNotification({ title: event.data.title, body: event.data.body, url: event.data.url || '/' });
    }
    if (event.data?.type === 'NOTIFICATION_CLICK' && event.data.url) {
      window.location.href = event.data.url;
    }
  };

  navigator.serviceWorker.addEventListener('message', handler);
  return () => navigator.serviceWorker.removeEventListener('message', handler);
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try { return await navigator.serviceWorker.register('/sw.js', { scope: '/' }); }
  catch { return null; }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission !== 'denied') return await Notification.requestPermission();
  return Notification.permission;
}

export async function subscribeToPushNotifications(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  try {
    if (!VAPID_PUBLIC_KEY) return null;
    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource
    });
  } catch { return null; }
}

export async function getExistingSubscription(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  try { return await registration.pushManager.getSubscription(); }
  catch { return null; }
}

export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}
