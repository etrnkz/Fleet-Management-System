# Fleet Mobile App

Unified Flutter app for **Drivers** and **Gate Personnel** at Haramaya University.

## App: `fleet_mobile`

One app, two interfaces — the correct UI is shown automatically based on the user's role after login.

| Role | Interface |
|------|-----------|
| Driver | GPS tracking, trip management, maintenance reports, QR code display |
| Gate | QR scanner, scan history, gate log |

## Build & Install

```bash
cd fleet_mobile
flutter pub get
flutter build apk --release --target-platform android-arm64
flutter install
```

## Requirements

- Flutter 3.x
- Android 8.0+ (API 26+)
- Location permission (GPS tracking)
- Camera permission (QR scanning — Gate role only)
