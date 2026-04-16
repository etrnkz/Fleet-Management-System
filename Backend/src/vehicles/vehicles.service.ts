import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';
import {
  TripRequest,
  TRIP_STATES_HOLDING_ALLOCATION,
} from '../trips/entities/trip-request.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { DriversService } from '../drivers/drivers.service';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(TripRequest)
    private readonly tripRepository: Repository<TripRequest>,
    @Inject(forwardRef(() => DriversService))
    private readonly driversService: DriversService,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const existing = await this.vehicleRepository.findOne({
      where: { plateNumber: createVehicleDto.plateNumber },
    });

    if (existing) {
      throw new ConflictException(
        'Vehicle with this plate number already exists',
      );
    }

    const vehicle = this.vehicleRepository.create(createVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      relations: ['assignedDriver', 'assignedDriver.user'],
      order: { plateNumber: 'ASC' },
    });
  }

  async findAvailable(
    startDateTime?: Date,
    endDateTime?: Date,
  ): Promise<Vehicle[]> {
    const active = await this.vehicleRepository.find({
      where: { status: VehicleStatus.Active },
      order: { plateNumber: 'ASC' },
    });

    const holdingTrips = await this.tripRepository.find({
      where: { state: In(TRIP_STATES_HOLDING_ALLOCATION) },
      relations: ['allocatedVehicle'],
    });
    const busyIds = new Set(
      holdingTrips
        .map((t) => t.allocatedVehicle?.id)
        .filter((id): id is string => Boolean(id)),
    );

    void startDateTime;
    void endDateTime;
    return active.filter((v) => !busyIds.has(v.id));
  }

  async findByStatus(status: VehicleStatus): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      where: { status },
      order: { plateNumber: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['assignedDriver', 'assignedDriver.user'],
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async findByPlateNumber(plateNumber: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { plateNumber },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async update(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(id);

    if (
      updateVehicleDto.plateNumber &&
      updateVehicleDto.plateNumber !== vehicle.plateNumber
    ) {
      const existing = await this.vehicleRepository.findOne({
        where: {
          plateNumber: updateVehicleDto.plateNumber,
          id: Not(id),
        },
      });

      if (existing) {
        throw new ConflictException(
          'Vehicle with this plate number already exists',
        );
      }
    }

    Object.assign(vehicle, updateVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async updateMileage(id: string, mileage: number): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    vehicle.currentMileage = mileage;
    return this.vehicleRepository.save(vehicle);
  }

  async setMaintenanceStatus(
    id: string,
    underMaintenance: boolean,
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    vehicle.status = underMaintenance
      ? VehicleStatus.Maintenance
      : VehicleStatus.Active;

    if (underMaintenance) {
      vehicle.lastMaintenanceDate = new Date();
    }

    return this.vehicleRepository.save(vehicle);
  }

  async remove(id: string): Promise<void> {
    const vehicle = await this.findOne(id);
    vehicle.status = VehicleStatus.Inactive;
    await this.vehicleRepository.save(vehicle);
  }

  async getStatistics() {
    const total = await this.vehicleRepository.count();
    const active = await this.vehicleRepository.count({
      where: { status: VehicleStatus.Active },
    });
    const underMaintenance = await this.vehicleRepository.count({
      where: { status: VehicleStatus.Maintenance },
    });
    const inactive = await this.vehicleRepository.count({
      where: { status: VehicleStatus.Inactive },
    });

    return {
      total,
      active,
      underMaintenance,
      inactive,
      availablePercentage: total > 0 ? ((active / total) * 100).toFixed(2) : 0,
    };
  }

  async getGeofenceConfig(id: string) {
    const vehicle = await this.findOne(id);
    return {
      vehicleId: vehicle.id,
      plateNumber: vehicle.plateNumber,
      vipGeoRestrictionEnabled: vehicle.vipGeoRestrictionEnabled,
      restrictedZones: vehicle.restrictedZones ?? [],
    };
  }

  async updateGeofenceConfig(
    id: string,
    vipGeoRestrictionEnabled: boolean,
    restrictedZones: { name?: string; latitude: number; longitude: number; radiusMeters: number }[],
  ) {
    const vehicle = await this.findOne(id);
    vehicle.vipGeoRestrictionEnabled = vipGeoRestrictionEnabled;
    vehicle.restrictedZones = restrictedZones.length > 0 ? restrictedZones : null;
    const saved = await this.vehicleRepository.save(vehicle);
    return {
      vehicleId: saved.id,
      plateNumber: saved.plateNumber,
      vipGeoRestrictionEnabled: saved.vipGeoRestrictionEnabled,
      restrictedZones: saved.restrictedZones ?? [],
      message: vipGeoRestrictionEnabled
        ? `Geofence enabled with ${restrictedZones.length} zone(s)`
        : 'Geofence disabled',
    };
  }

  async assignDriver(vehicleId: string, driverId: string): Promise<Vehicle> {
    const vehicle = await this.findOne(vehicleId);
    
    // Validate driver exists
    const driver = await this.driversService.findOne(driverId);
    
    vehicle.assignedDriver = driver;
    
    // Activate vehicle when driver is assigned
    if (vehicle.status === VehicleStatus.Inactive) {
      vehicle.status = VehicleStatus.Active;
    }
    
    return this.vehicleRepository.save(vehicle);
  }

  async unassignDriver(vehicleId: string): Promise<Vehicle> {
    const vehicle = await this.findOne(vehicleId);
    vehicle.assignedDriver = null;
    
    // Set vehicle to Inactive when driver is unassigned
    if (vehicle.status === VehicleStatus.Active) {
      vehicle.status = VehicleStatus.Inactive;
    }
    
    return this.vehicleRepository.save(vehicle);
  }
}
