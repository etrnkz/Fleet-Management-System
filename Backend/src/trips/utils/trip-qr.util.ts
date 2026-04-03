import { BadRequestException } from '@nestjs/common';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ParsedTripQr = {
  tripId: string;
  requestNumber?: string;
  vehiclePlate?: string;
};

export function parseTripQrPayload(raw: string): ParsedTripQr {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new BadRequestException('Empty QR payload');
  }
  if (UUID_RE.test(trimmed)) {
    return { tripId: trimmed };
  }
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    throw new BadRequestException(
      'Invalid QR: expected trip UUID or JSON from driver app',
    );
  }
  if (!obj || typeof obj !== 'object') {
    throw new BadRequestException('Invalid QR payload');
  }
  const tripId = obj.tripId;
  if (typeof tripId !== 'string' || !UUID_RE.test(tripId)) {
    throw new BadRequestException('Invalid QR: missing or invalid tripId');
  }
  if (obj.action != null && obj.action !== 'START_TRIP') {
    throw new BadRequestException('Invalid QR: only START_TRIP is supported');
  }
  return {
    tripId,
    requestNumber:
      typeof obj.requestNumber === 'string' ? obj.requestNumber : undefined,
    vehiclePlate: typeof obj.vehicle === 'string' ? obj.vehicle : undefined,
  };
}
