import { Vehicle } from '../entities/vehicle.entity';

/** Haversine distance in meters between two WGS84 points. */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type GeofenceStatus = 'clear' | 'warning' | 'shutdown';

export interface GeofenceResult {
  status: GeofenceStatus;
  /** true only when status === 'shutdown' */
  engineSimulatedOff: boolean;
  violationZoneName: string | null;
  /** distance to nearest zone boundary in meters (negative = inside zone) */
  distanceToZoneMeters: number | null;
}

/**
 * Warning buffer: vehicle is warned when within this fraction of the radius.
 * e.g. 0.8 means warn when within 80% of the restricted radius.
 */
const WARNING_BUFFER_RATIO = 0.8;

export function evaluateVipGeofenceForPoint(
  vehicle: Vehicle | null | undefined,
  latitude: number,
  longitude: number,
): GeofenceResult {
  if (!vehicle?.vipGeoRestrictionEnabled) {
    return { status: 'clear', engineSimulatedOff: false, violationZoneName: null, distanceToZoneMeters: null };
  }
  const zones = vehicle.restrictedZones;
  if (!Array.isArray(zones) || zones.length === 0) {
    return { status: 'clear', engineSimulatedOff: false, violationZoneName: null, distanceToZoneMeters: null };
  }

  for (const z of zones) {
    if (z == null || typeof z !== 'object') continue;
    const lat = Number(z.latitude);
    const lng = Number(z.longitude);
    const r = Number(z.radiusMeters);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(r) || r <= 0) {
      continue;
    }
    const d = haversineDistanceMeters(latitude, longitude, lat, lng);
    const zoneName =
      typeof z.name === 'string' && z.name.trim().length > 0
        ? z.name.trim()
        : 'Restricted zone';

    if (d <= r) {
      // Inside the restricted zone → engine shutdown
      return {
        status: 'shutdown',
        engineSimulatedOff: true,
        violationZoneName: zoneName,
        distanceToZoneMeters: -(r - d), // negative = how far inside
      };
    }

    if (d <= r / WARNING_BUFFER_RATIO) {
      // Within warning buffer (approaching the zone)
      return {
        status: 'warning',
        engineSimulatedOff: false,
        violationZoneName: zoneName,
        distanceToZoneMeters: d - r, // positive = distance to boundary
      };
    }
  }

  return { status: 'clear', engineSimulatedOff: false, violationZoneName: null, distanceToZoneMeters: null };
}
