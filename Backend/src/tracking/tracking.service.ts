import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { GpsLocation } from './entities/gps-location.entity';
import { UpdateLocationDto } from './dto/update-location.dto';
import { TripRequest, TripState } from '../trips/entities/trip-request.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { evaluateVipGeofenceForPoint, GeofenceResult } from '../vehicles/utils/vip-geofence.util';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { SmsService } from '../sms/sms.service';

/** In-memory store for service vehicle live locations (no DB migration needed) */
export interface ServiceVehicleLocation {
  vehicleId: string;
  plateNumber: string;
  make: string;
  model: string;
  fuelType: string;
  serviceVehicleType: string;
  driverName: string | null;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  timestamp: Date;
}
const serviceVehicleLocations = new Map<string, ServiceVehicleLocation>();

export type LocationSavePayload = {
  id: string;
  tripId: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  altitude: number | null;
  accuracy: number | null;
  isOffline: boolean;
  timestamp: Date;
  metadata: string | null | undefined;
  engineSimulatedOff: boolean;
  geofenceStatus: 'clear' | 'warning' | 'shutdown';
  violationZoneName: string | null;
  distanceToZoneMeters: number | null;
};

// Track last geofence status per trip to avoid spamming notifications
const geofenceStateCache = new Map<string, 'clear' | 'warning' | 'shutdown'>();

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(GpsLocation)
    private readonly gpsLocationRepository: Repository<GpsLocation>,
    @InjectRepository(TripRequest)
    private readonly tripRepository: Repository<TripRequest>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
    private readonly smsService: SmsService,
  ) {}

  async saveLocation(
    tripId: string,
    locationDto: UpdateLocationDto,
  ): Promise<LocationSavePayload> {
    const trip = await this.tripRepository.findOne({
      where: { id: tripId },
      relations: ['allocatedVehicle', 'requester'],
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.state !== TripState.IN_PROGRESS) {
      throw new BadRequestException(
        'Can only track locations for trips in progress',
      );
    }

    const location = this.gpsLocationRepository.create({
      tripId,
      ...locationDto,
      metadata: locationDto.metadata
        ? JSON.stringify(locationDto.metadata)
        : undefined,
    });

    const saved = await this.gpsLocationRepository.save(location);
    const lat = Number(saved.latitude);
    const lng = Number(saved.longitude);
    const geofence = evaluateVipGeofenceForPoint(trip.allocatedVehicle, lat, lng);

    // Fire notifications only when status changes
    await this.handleGeofenceStateChange(trip, geofence);

    return this.toLocationPayload(saved, geofence);
  }

  private async handleGeofenceStateChange(
    trip: TripRequest,
    geofence: GeofenceResult,
  ): Promise<void> {
    const prevStatus = geofenceStateCache.get(trip.id) ?? 'clear';
    const newStatus = geofence.status;

    if (prevStatus === newStatus) return;
    geofenceStateCache.set(trip.id, newStatus);

    if (newStatus === 'clear') return; // No notification needed when clearing

    const vehicle = trip.allocatedVehicle;
    const plateNumber = vehicle?.plateNumber ?? 'Unknown';
    const zoneName = geofence.violationZoneName ?? 'Restricted zone';
    const distanceInfo = geofence.distanceToZoneMeters != null
      ? newStatus === 'warning'
        ? ` (${Math.round(geofence.distanceToZoneMeters)}m from boundary)`
        : ` (${Math.round(Math.abs(geofence.distanceToZoneMeters))}m inside zone)`
      : '';

    const isWarning = newStatus === 'warning';
    const notifType = isWarning ? NotificationType.GeofenceWarning : NotificationType.GeofenceViolation;
    const title = isWarning
      ? `⚠️ Geofence Warning — ${plateNumber}`
      : `🚨 Geofence Violation — Engine Shutdown — ${plateNumber}`;
    const message = isWarning
      ? `Vehicle ${plateNumber} is approaching restricted zone "${zoneName}"${distanceInfo}. Engine shutdown will trigger if it enters.`
      : `Vehicle ${plateNumber} has entered restricted zone "${zoneName}"${distanceInfo}. Engine shutdown has been triggered.`;

    const notifData = {
      tripId: trip.id,
      vehicleId: vehicle?.id,
      plateNumber,
      zoneName,
      geofenceStatus: newStatus,
      distanceToZoneMeters: geofence.distanceToZoneMeters,
    };

    // Notify the trip requester
    if (trip.requester) {
      await this.notificationsService.create(
        trip.requester, notifType, title, message, notifData,
      ).catch(() => {});

      // SMS to requester if they have a phone number
      if (trip.requester.phoneNumber) {
        if (newStatus === 'warning') {
          this.smsService.sendGeofenceWarningSms(trip.requester.phoneNumber, plateNumber, zoneName).catch(() => {});
        } else {
          this.smsService.sendGeofenceShutdownSms(trip.requester.phoneNumber, plateNumber, zoneName).catch(() => {});
        }
      }
    }

    // Notify all transport office users
    try {
      const transportUsers = await this.usersService.findByRole(UserRole.TransportOffice);
      for (const user of transportUsers) {
        await this.notificationsService.create(user, notifType, title, message, notifData).catch(() => {});
        // SMS transport office too
        if (user.phoneNumber) {
          if (newStatus === 'warning') {
            this.smsService.sendGeofenceWarningSms(user.phoneNumber, plateNumber, zoneName).catch(() => {});
          } else {
            this.smsService.sendGeofenceShutdownSms(user.phoneNumber, plateNumber, zoneName).catch(() => {});
          }
        }
      }
    } catch {}
  }

  toLocationPayload(
    saved: GpsLocation,
    geofence: GeofenceResult,
  ): LocationSavePayload {
    return {
      id: saved.id,
      tripId: saved.tripId,
      latitude: Number(saved.latitude),
      longitude: Number(saved.longitude),
      speed: saved.speed != null ? Number(saved.speed) : null,
      heading: saved.heading != null ? Number(saved.heading) : null,
      altitude: saved.altitude != null ? Number(saved.altitude) : null,
      accuracy: saved.accuracy != null ? Number(saved.accuracy) : null,
      isOffline: saved.isOffline,
      timestamp: saved.timestamp,
      metadata: saved.metadata ?? undefined,
      engineSimulatedOff: geofence.engineSimulatedOff,
      geofenceStatus: geofence.status,
      violationZoneName: geofence.violationZoneName,
      distanceToZoneMeters: geofence.distanceToZoneMeters,
    };
  }

  async getTripGeofenceConfig(tripId: string): Promise<{
    vipGeoRestrictionEnabled: boolean;
    restrictedZones: {
      name?: string;
      latitude: number;
      longitude: number;
      radiusMeters: number;
    }[];
  }> {
    const trip = await this.tripRepository.findOne({
      where: { id: tripId },
      relations: ['allocatedVehicle'],
    });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    const v = trip.allocatedVehicle;
    if (!v) {
      return { vipGeoRestrictionEnabled: false, restrictedZones: [] };
    }
    const zones = Array.isArray(v.restrictedZones) ? v.restrictedZones : [];
    return {
      vipGeoRestrictionEnabled: !!v.vipGeoRestrictionEnabled,
      restrictedZones: zones.map((z) => ({
        name: z.name,
        latitude: Number(z.latitude),
        longitude: Number(z.longitude),
        radiusMeters: Number(z.radiusMeters),
      })),
    };
  }

  async saveBulkLocations(
    tripId: string,
    locationsDto: UpdateLocationDto[],
  ): Promise<GpsLocation[]> {
    // Verify trip exists
    const trip = await this.tripRepository.findOne({ where: { id: tripId } });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const locations = locationsDto.map((dto) =>
      this.gpsLocationRepository.create({
        tripId,
        ...dto,
        metadata: dto.metadata ? JSON.stringify(dto.metadata) : undefined,
      }),
    );

    return this.gpsLocationRepository.save(locations);
  }

  async getRecentLocations(
    tripId: string,
    limit: number = 50,
  ): Promise<GpsLocation[]> {
    return this.gpsLocationRepository.find({
      where: { tripId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getTripRoute(tripId: string): Promise<GpsLocation[]> {
    return this.gpsLocationRepository.find({
      where: { tripId },
      order: { timestamp: 'ASC' },
    });
  }

  async getTripLocationsInTimeRange(
    tripId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<GpsLocation[]> {
    return this.gpsLocationRepository.find({
      where: {
        tripId,
        timestamp: Between(startTime, endTime),
      },
      order: { timestamp: 'ASC' },
    });
  }

  async getLocationStatistics(tripId: string) {
    const locations = await this.getTripRoute(tripId);

    if (locations.length === 0) {
      return {
        totalPoints: 0,
        distance: 0,
        averageSpeed: 0,
        maxSpeed: 0,
        duration: 0,
      };
    }

    // Calculate total distance using Haversine formula
    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      const dist = this.calculateDistance(
        locations[i - 1].latitude,
        locations[i - 1].longitude,
        locations[i].latitude,
        locations[i].longitude,
      );
      totalDistance += dist;
    }

    // Calculate speeds
    const speeds = locations
      .filter((l) => l.speed !== null)
      .map((l) => l.speed);
    const averageSpeed =
      speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
    const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;

    // Calculate duration
    const startTime = new Date(locations[0].timestamp).getTime();
    const endTime = new Date(
      locations[locations.length - 1].timestamp,
    ).getTime();
    const duration = (endTime - startTime) / 1000 / 60; // minutes

    return {
      totalPoints: locations.length,
      distance: Math.round(totalDistance * 100) / 100, // km
      averageSpeed: Math.round(averageSpeed * 100) / 100,
      maxSpeed: Math.round(maxSpeed * 100) / 100,
      duration: Math.round(duration * 100) / 100,
      startTime: locations[0].timestamp,
      endTime: locations[locations.length - 1].timestamp,
    };
  }

  async getCurrentLocation(tripId: string): Promise<GpsLocation | null> {
    return this.gpsLocationRepository.findOne({
      where: { tripId },
      order: { timestamp: 'DESC' },
    });
  }

  async getLiveVehicleLocations() {
    const activeTrips = await this.tripRepository.find({
      where: { state: TripState.IN_PROGRESS },
      relations: [
        'allocatedVehicle',
        'allocatedDriver',
        'allocatedDriver.user',
        'requester',
      ],
      order: { updatedAt: 'DESC' },
    });

    const liveLocations = await Promise.all(
      activeTrips.map(async (trip) => {
        const latestLocation = await this.getCurrentLocation(trip.id);
        if (!latestLocation || !trip.allocatedVehicle) {
          return null;
        }

        // Calculate traveled distance from route
        const route = await this.gpsLocationRepository.find({
          where: { tripId: trip.id },
          order: { timestamp: 'ASC' },
          select: ['latitude', 'longitude'],
        });

        let traveledKm = 0;
        for (let i = 1; i < route.length; i++) {
          traveledKm += this.calculateDistance(
            Number(route[i - 1].latitude), Number(route[i - 1].longitude),
            Number(route[i].latitude), Number(route[i].longitude),
          );
        }
        traveledKm = Math.round(traveledKm * 100) / 100;

        // Fuel calculations
        const v = trip.allocatedVehicle;
        const PETROL_PRICE = 132.18;
        const DIESEL_PRICE = 139.84;
        const fuelPricePerLiter = v.fuelType === 'Diesel' ? DIESEL_PRICE : PETROL_PRICE;
        const fuelEfficiency = Number(v.fuelEfficiency) || (v.fuelType === 'Diesel' ? 8 : 10);
        const fuelCapacity = Number(v.fuelCapacity) || 60;

        const fuelUsedLiters = traveledKm / fuelEfficiency;
        const fuelRemainingLiters = Math.max(0, fuelCapacity - fuelUsedLiters);
        const fuelRemainingPercent = Math.round((fuelRemainingLiters / fuelCapacity) * 100);
        const fuelRemainingKm = Math.round(fuelRemainingLiters * fuelEfficiency);
        const actualFuelCost = Math.round(fuelUsedLiters * fuelPricePerLiter * 100) / 100;

        // Expected total fuel cost (based on estimated distance if available)
        const estimatedDistance = Number(trip.estimatedDistance) || 0;
        const expectedTotalFuelCost = estimatedDistance > 0
          ? Math.round((estimatedDistance / fuelEfficiency) * fuelPricePerLiter * 100) / 100
          : null;

        return {
          tripId: trip.id,
          requestNumber: trip.requestNumber,
          destination: trip.destination,
          vehicleId: v.id,
          plateNumber: v.plateNumber,
          make: v.make,
          model: v.model,
          fuelType: v.fuelType,
          driverName: trip.allocatedDriver?.user?.name || null,
          requesterName: trip.requester?.name || null,
          latitude: Number(latestLocation.latitude),
          longitude: Number(latestLocation.longitude),
          speed: latestLocation.speed ? Number(latestLocation.speed) : 0,
          heading: latestLocation.heading ? Number(latestLocation.heading) : null,
          timestamp: latestLocation.timestamp,
          // Travel stats
          traveledKm,
          estimatedDistance: estimatedDistance || null,
          // Fuel stats
          fuelUsedLiters: Math.round(fuelUsedLiters * 100) / 100,
          fuelRemainingLiters: Math.round(fuelRemainingLiters * 100) / 100,
          fuelRemainingPercent,
          fuelRemainingKm,
          actualFuelCost,
          expectedTotalFuelCost,
          fuelPricePerLiter,
        };
      }),
    );

    return liveLocations.filter(Boolean);
  }

  /**
   * Enriches a saved location payload with vehicle/driver info + live travel stats
   * so the live-tracking broadcast has full context for the map.
   */
  async enrichLocationForBroadcast(tripId: string, location: LocationSavePayload): Promise<any> {
    try {
      const trip = await this.tripRepository.findOne({
        where: { id: tripId },
        relations: ['allocatedVehicle', 'allocatedDriver', 'allocatedDriver.user', 'requester'],
      });

      const v = trip?.allocatedVehicle;

      // Recalculate traveled distance
      let traveledKm = 0;
      if (trip) {
        const route = await this.gpsLocationRepository.find({
          where: { tripId },
          order: { timestamp: 'ASC' },
          select: ['latitude', 'longitude'],
        });
        for (let i = 1; i < route.length; i++) {
          traveledKm += this.calculateDistance(
            Number(route[i - 1].latitude), Number(route[i - 1].longitude),
            Number(route[i].latitude), Number(route[i].longitude),
          );
        }
        traveledKm = Math.round(traveledKm * 100) / 100;
      }

      const PETROL_PRICE = 132.18;
      const DIESEL_PRICE = 139.84;
      const fuelPricePerLiter = v?.fuelType === 'Diesel' ? DIESEL_PRICE : PETROL_PRICE;
      const fuelEfficiency = Number(v?.fuelEfficiency) || (v?.fuelType === 'Diesel' ? 8 : 10);
      const fuelCapacity = Number(v?.fuelCapacity) || 60;
      const fuelUsedLiters = traveledKm / fuelEfficiency;
      const fuelRemainingLiters = Math.max(0, fuelCapacity - fuelUsedLiters);
      const fuelRemainingPercent = Math.round((fuelRemainingLiters / fuelCapacity) * 100);
      const actualFuelCost = Math.round(fuelUsedLiters * fuelPricePerLiter * 100) / 100;
      const estimatedDistance = Number(trip?.estimatedDistance) || 0;
      const expectedTotalFuelCost = estimatedDistance > 0
        ? Math.round((estimatedDistance / fuelEfficiency) * fuelPricePerLiter * 100) / 100
        : null;

      return {
        ...location,
        vehicleId: v?.id ?? null,
        plateNumber: v?.plateNumber ?? null,
        make: v?.make ?? null,
        model: v?.model ?? null,
        fuelType: v?.fuelType ?? null,
        driverName: trip?.allocatedDriver?.user?.name ?? null,
        requesterName: trip?.requester?.name ?? null,
        destination: trip?.destination ?? null,
        requestNumber: trip?.requestNumber ?? null,
        traveledKm,
        estimatedDistance: estimatedDistance || null,
        fuelUsedLiters: Math.round(fuelUsedLiters * 100) / 100,
        fuelRemainingLiters: Math.round(fuelRemainingLiters * 100) / 100,
        fuelRemainingPercent,
        fuelRemainingKm: Math.round(fuelRemainingLiters * fuelEfficiency),
        actualFuelCost,
        expectedTotalFuelCost,
        fuelPricePerLiter,
      };
    } catch {
      return location;
    }
  }

  /** Save GPS location for a service vehicle (shuttle/security) — no trip needed */
  async saveServiceVehicleLocation(
    vehicleId: string,
    dto: UpdateLocationDto,
  ): Promise<ServiceVehicleLocation> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
      relations: ['assignedDriver', 'assignedDriver.user'],
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    if (!vehicle.isServiceVehicle) {
      throw new BadRequestException('Vehicle is not a service vehicle');
    }

    const loc: ServiceVehicleLocation = {
      vehicleId: vehicle.id,
      plateNumber: vehicle.plateNumber,
      make: vehicle.make,
      model: vehicle.model,
      fuelType: vehicle.fuelType,
      serviceVehicleType: vehicle.serviceVehicleType ?? 'Shuttle',
      driverName: (vehicle.assignedDriver as any)?.user?.name ?? null,
      latitude: dto.latitude,
      longitude: dto.longitude,
      speed: dto.speed ?? null,
      heading: dto.heading ?? null,
      timestamp: new Date(),
    };
    serviceVehicleLocations.set(vehicleId, loc);
    return loc;
  }

  /** Get live locations for all service vehicles that have reported in the last 5 minutes */
  getServiceVehicleLiveLocations(): ServiceVehicleLocation[] {
    const cutoff = new Date(Date.now() - 5 * 60 * 1000);
    return Array.from(serviceVehicleLocations.values()).filter(
      (l) => l.timestamp >= cutoff,
    );
  }

  /** Get the assigned service vehicle for a driver user */
  async getDriverServiceVehicle(userId: string): Promise<Vehicle | null> {
    // Find driver record for this user
    const vehicles = await this.vehicleRepository
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.assignedDriver', 'd')
      .leftJoinAndSelect('d.user', 'u')
      .where('v.isServiceVehicle = :sv', { sv: true })
      .andWhere('u.id = :uid', { uid: userId })
      .getMany();
    return vehicles[0] ?? null;
  }

  async deleteOldLocations(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.gpsLocationRepository
      .createQueryBuilder()
      .delete()
      .where('timestamp < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  // Haversine formula to calculate distance between two GPS coordinates
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
