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

export function evaluateVipGeofenceForPoint(
  vehicle: Vehicle | null | undefined,
  latitude: number,
  longitude: number,
): { engineSimulatedOff: boolean; violationZoneName: string | null } {
  if (!vehicle?.vipGeoRestrictionEnabled) {
    return { engineSimulatedOff: false, violationZoneName: null };
  }
  const zones = vehicle.restrictedZones;
  if (!Array.isArray(zones) || zones.length === 0) {
    return { engineSimulatedOff: false, violationZoneName: null };
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
    if (d <= r) {
      const name =
        typeof z.name === 'string' && z.name.trim().length > 0
          ? z.name.trim()
          : 'Restricted zone';
      return { engineSimulatedOff: true, violationZoneName: name };
    }
  }
  return { engineSimulatedOff: false, violationZoneName: null };
}
