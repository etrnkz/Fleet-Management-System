# Push Notifications Setup Guide

This guide explains how to set up Web Push Notifications using VAPID keys for the Employee app.

## Prerequisites

- Node.js installed
- `web-push` npm package (for generating VAPID keys)

## Step 1: Generate VAPID Keys

Install the web-push package globally (if not already installed):

```bash
npm install -g web-push
```

Generate VAPID keys:

```bash
npx web-push generate-vapid-keys
```

This will output something like:

```
=======================================
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib27SDbQjfTbSAVLVvKCBUHGze01YUGEiR7QBzLlHPaCpeT4qiSKm4QoUiI

Private Key:
UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls
=======================================
```

## Step 2: Configure Environment Variables

### Frontend (.env.local)

Create or update `frontend/apps/employee/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib27SDbQjfTbSAVLVvKCBUHGze01YUGEiR7QBzLlHPaCpeT4qiSKm4QoUiI
```

### Backend (.env)

Add to `Backend/.env`:

```env
VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib27SDbQjfTbSAVLVvKCBUHGze01YUGEiR7QBzLlHPaCpeT4qiSKm4QoUiI
VAPID_PRIVATE_KEY=UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls
VAPID_SUBJECT=mailto:admin@haramaya.edu.et
```

## Step 3: How It Works

### Frontend Flow

1. **Service Worker Registration**: When the app loads, it registers a service worker (`/sw.js`)
2. **Permission Request**: A prompt appears asking the user to enable notifications
3. **Subscription**: If granted, the browser creates a push subscription using the VAPID public key
4. **Backend Sync**: The subscription is sent to the backend API endpoint `/api/v1/notifications/subscribe`

### Backend Flow

1. **Store Subscription**: Backend stores the push subscription in the database
2. **Send Notifications**: When an event occurs (trip approved, etc.), backend uses the stored subscription to send push notifications
3. **VAPID Authentication**: Backend uses the VAPID private key to authenticate with the push service

## Step 4: Backend Implementation (Required)

You need to implement the following endpoint in your backend:

### POST /api/v1/notifications/subscribe

```typescript
// Store push subscription
{
  subscription: {
    endpoint: "https://fcm.googleapis.com/fcm/send/...",
    keys: {
      p256dh: "...",
      auth: "..."
    }
  }
}
```

### Sending Push Notifications

Use the `web-push` library in your backend:

```typescript
import webpush from 'web-push';

// Configure VAPID
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Send notification
const payload = JSON.stringify({
  title: 'Trip Approved',
  body: 'Your trip request has been approved',
  url: '/trips',
  id: 'notification-id'
});

await webpush.sendNotification(subscription, payload);
```

## Step 5: Testing

1. Start the employee app: `npm run dev`
2. Open the app in your browser
3. You should see a notification prompt in the bottom-right corner
4. Click "Enable" to grant notification permission
5. The subscription will be sent to the backend
6. Test by sending a push notification from the backend

## Features

- ✅ Service Worker for background notifications
- ✅ VAPID authentication
- ✅ Permission request UI
- ✅ Automatic subscription management
- ✅ Click handling (opens relevant page)
- ✅ Custom notification icons and badges
- ✅ Vibration support

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: iOS 16.4+ and macOS 13+
- Opera: Full support

## Security Notes

- VAPID keys should be kept secure
- Never commit private keys to version control
- Use environment variables for all keys
- HTTPS is required for push notifications (except localhost)

## Troubleshooting

### Notifications not appearing

1. Check browser permissions in browser settings
2. Verify VAPID keys are correctly configured
3. Check browser console for errors
4. Ensure service worker is registered successfully

### Subscription fails

1. Verify VAPID public key format (base64url encoded)
2. Check that service worker is accessible at `/sw.js`
3. Ensure HTTPS is being used (or localhost for development)

## Additional Resources

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
