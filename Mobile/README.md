# Fleet Management — Mobile Apps (Flutter)

Two Flutter apps replacing the original Kotlin apps.

## Apps

### `fleet_driver/` — Driver App
Full driver portal matching the web dashboard, plus mobile-native extras.

**Features:**
- Login with role validation (Driver only)
- Assigned Trips — view, QR code, reject with reason
- Active Trip — live GPS tracking, speed, geofence status
- Engine Shutdown — pulsing red banner + vibration on restricted zone
- Trip History — completed trips with distance
- Maintenance — report issues with priority, view history
- Profile — edit name/phone/license, change password, vehicle info, notifications

**Run:**
```bash
cd fleet_driver
flutter pub get
flutter run
```

---

### `fleet_gate/` — Gate Scanner App
QR scanner for gate operators to start trips.

**Features:**
- Login (Gate / TransportOffice / Developer roles)
- Camera QR scan via `mobile_scanner`
- POST to `/trips/gate/start-from-scan`
- Shows trip number and state on success

**Run:**
```bash
cd fleet_gate
flutter pub get
flutter run
```

---

## API URL
Both apps default to:
```
https://fingers-pointer-ste-lottery.trycloudflare.com/api/v1
```
The gate app lets you change it in the UI. The driver app reads from secure storage (set via `Storage.setApiBase()`).
