# Fleet Gate Scanner (Android)

1. Set **API base** (e.g. `http://YOUR_PC_IP:3000/api/v1`).
2. **Sign in** with email/password — account must have role **Gate**, **TransportOffice**, or **Developer** on the server.
3. **Scan** the same QR as the driver app (`START_TRIP` JSON).

Calls:

- `POST {apiBase}/auth/login` — obtains JWT  
- `POST {apiBase}/trips/gate/start-from-scan` — `Authorization: Bearer …`, body `{ "qrPayload": "<raw QR string>" }`

Seeded test user (after `Backend/seed_all.py`): **gate@test.com** / **password123**.

Trip must be **READY**; on success it becomes **IN_PROGRESS**.

## Build / install (system Gradle)

```powershell
cd Mobile\gate-scanner
gradle :app:installDebug
```

Ensure `local.properties` has `sdk.dir=…` (Android SDK), or set `ANDROID_HOME`.

## Permissions

- **Camera** — QR scanning  
- **Internet** — API calls  
