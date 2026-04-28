# Fleet Management System — Technical Reference

University transportation system built with NestJS + Next.js. This doc covers only the non-obvious parts — decisions, rules, and behaviors that aren't self-evident from the code.

---

## Roles & Access

12 roles exist. The ones that are easy to confuse:

| Role | Notes |
|------|-------|
| `Dean` and `CollegeHead` | Same portal (`/college-dean`), same permissions — treated identically |
| `User` and `Employee` | Same thing — `User` is the DB enum value, "Employee" is the UI label |
| `Developer` | Full access, same portal as `SystemAdmin`. Seed/dev only — not for production users |
| `Gate` | No portal. Only scans QR codes to start/end trips. No dashboard |
| `DeploymentTeam` | Listed as "DeploymentOffice" in some frontend routes — same role |

Frontend middleware maps each role to a path prefix. A `DepartmentHead` hitting `/college-dean/*` gets redirected, not a 403.

---

## Trip Approval Flow

### Normal trip
`DRAFT → PENDING_DEPARTMENT → PENDING_COLLEGE → PENDING_PRESIDENT → APPROVED_FOR_ALLOCATION → CAR_ALLOCATED → PENDING_TRANSPORT_CONFIRM → READY → IN_PROGRESS → PENDING_RETURN → COMPLETED`

### VIP / SERVICE trip
Skips department and college — goes straight to `PENDING_PRESIDENT` after submit.

### Critical rules
- **48-hour minimum** — trips must be submitted at least 48h before `startDateTime`. Enforced server-side on create, not just client-side.
- **48-hour approval timeout** — each approval level has 48h to act. A warning notification fires at 24h. At 0h the trip auto-transitions to `AUTO_REJECTED_TIMEOUT` via a Bull queue job scheduled in Redis.
- **`PENDING_RETURN`** — exists because the employee marks "complete" from their phone, but the trip isn't truly done until the Gate scans the return QR. This prevents drivers from being released early.
- Vehicle and driver are locked (unavailable for other trips) from `CAR_ALLOCATED` through `PENDING_RETURN`. They're only freed on `COMPLETED` or `CANCELLED`.

---

## GPS Tracking

The driver app uses `navigator.geolocation.watchPosition` with `enableHighAccuracy: true`. Points are throttled to one post every **4 seconds minimum**.

**Offline handling** — if the device is offline, points go into `localStorage` (`hufms_gps_offline_queue_<tripId>`). On reconnect (or on mount if already online), the queue is flushed as a single bulk POST before the next live point is sent. The queue is only cleared after a successful upload.

**Distance** is calculated server-side using the Haversine formula across all consecutive GPS points in the route. `R = 6371 km`.

**Live broadcast** — after every saved point, the backend enriches the payload with vehicle info, driver name, traveled distance, and fuel stats, then broadcasts it over the `/tracking` Socket.io namespace to all Transport Office clients.

---

## Fuel Cost Calculation

Prices (editable by Transport Admin in Settings, stored in `localStorage`):
- Petrol: **132.18 ETB/L** (default)
- Diesel: **139.84 ETB/L** (default)

Default efficiency if not set on the vehicle: **10 km/L** (petrol), **8 km/L** (diesel). Default tank: **60 L**.

**Estimated cost** (set at allocation):
```
estimatedFuelCost = (estimatedDistance / efficiency) × pricePerLiter
```

**Live cost** (recalculated on every GPS point):
```
fuelUsed     = traveledKm / efficiency
fuelCost     = fuelUsed × pricePerLiter
fuelRemaining = tankCapacity − fuelUsed
remainingKm  = fuelRemaining × efficiency
```

The frontend Settings page saves updated prices to `localStorage`. The backend uses its own hardcoded defaults — the two are **not synced**. If prices change, both places need updating.

---

## Geofencing

Only applies to vehicles with `vipGeoRestrictionEnabled = true`. Each vehicle can have multiple restricted zones (center lat/lng + radius in meters).

On every GPS point:
- `d ≤ radius` → **shutdown**: `engineSimulatedOff = true` returned to driver app, SMS + in-app alert sent
- `d ≤ radius / 0.8` → **warning**: approaching zone, alert sent
- otherwise → **clear**

The `0.8` ratio means the warning triggers when the vehicle is within 25% of the radius distance from the boundary.

Notifications only fire on **status change** — a server-side `Map<tripId, status>` prevents alert spam on every tick. The cache is in-memory, so it resets on server restart (a restart during an active trip will re-fire the first notification after the restart).

---

## Known Constraints

- **Fuel prices are not synced** between frontend `localStorage` and backend constants. A price change in Settings only affects the frontend display; backend live-tracking calculations use hardcoded values until the backend is updated.
- **Geofence cache is in-memory** — server restart during an active trip causes one duplicate geofence notification.
- **GPS tracking only works while the driver app is open** — there is no background service worker for location. If the driver closes the tab, tracking stops.
- **48h timeout jobs survive server restarts** because they live in Redis/Bull. However, if Redis is wiped, pending timeout jobs are lost and those trips will never auto-reject.
- **One vehicle ↔ one driver** is a hard unique constraint in the DB. Reassigning a driver to a different vehicle requires clearing the old assignment first.
- **Feedback is one-per-trip** enforced by a unique constraint on `tripRequestId` in `trip_feedback`. Submitting twice returns a conflict error.

---

## Auth Edge Cases

- On 401, the API client automatically attempts one token refresh and retries the original request. If the refresh also fails, the error is thrown — the client does **not** auto-logout. The user gets redirected on the next navigation by the Next.js middleware.
- Logout calls `POST /auth/logout` which blacklists the access token server-side. The blacklist is checked on every request in `JwtAuthGuard`.
- Password reset tokens expire and are single-use. The token and expiry are stored as plain columns on the `users` table (not a separate table).

---

## Further Reading

- [Database Schema](./database-schema.md)
- [Use Case Diagram](./use-case-diagram.md)
- [Sequence Diagrams](./sequence-diagrams.md)
- [Activity Diagrams](./activity-diagram-combined.md)
- [Geofencing Detail](./geofence-feature.md)
- [GPS Tracking Detail](./gps-location-feature.md)
- [VIP Security](./vip-security-features.md)
- Swagger UI: `http://localhost:3000/api/docs`
