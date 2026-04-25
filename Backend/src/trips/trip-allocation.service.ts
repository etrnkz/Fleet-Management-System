/**
 * TripAllocationService — handles vehicle/driver allocation only.
 * Separated from TripsService to follow Single Responsibility Principle.
 */
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  TripRequest,
  TripState,
  TRIP_STATES_HOLDING_ALLOCATION,
} from './entities/trip-request.entity';
import { AllocateTripDto } from './dto/allocate-trip.dto';
import { ConfirmTransportDto } from './dto/confirm-transport.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { VehiclesService } from '../vehicles/vehicles.service';
import { VehicleStatus } from '../vehicles/entities/vehicle.entity';
import { DriversService } from '../drivers/drivers.service';
import { DriverStatus } from '../drivers/entities/driver.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntity } from '../audit/entities/audit-log.entity';

@Injectable()
export class TripAllocationService {
  constructor(
    @InjectRepository(TripRequest)
    private readonly tripRepository: Repository<TripRequest>,
    private readonly vehiclesService: VehiclesService,
    private readonly driversService: DriversService,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
  ) {}

  /** Check if a vehicle is available (not on active trip, not under maintenance) */
  async isVehicleAvailable(vehicleId: string): Promise<{ available: boolean; reason?: string }> {
    const vehicle = await this.vehiclesService.findOne(vehicleId);
    if (vehicle.status === VehicleStatus.Maintenance) {
      return { available: false, reason: 'Vehicle is under maintenance' };
    }
    const inUse = await this.tripRepository.count({
      where: { allocatedVehicle: { id: vehicleId }, state: In(TRIP_STATES_HOLDING_ALLOCATION) },
    });
    if (inUse > 0) {
      return { available: false, reason: 'Vehicle is already on an active trip' };
    }
    return { available: true };
  }

  /** Check if a driver is available (not on active trip) */
  async isDriverAvailable(driverId: string): Promise<{ available: boolean; reason?: string }> {
    const inUse = await this.tripRepository.count({
      where: { allocatedDriver: { id: driverId }, state: In(TRIP_STATES_HOLDING_ALLOCATION) },
    });
    if (inUse > 0) {
      return { available: false, reason: 'Driver is already assigned to an active trip' };
    }
    return { available: true };
  }
}
