import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Driver, DriverStatus } from './entities/driver.entity';
import { Vehicle, VehicleStatus } from '../vehicles/entities/vehicle.entity';
import {
  TripRequest,
  TRIP_STATES_HOLDING_ALLOCATION,
} from '../trips/entities/trip-request.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(TripRequest)
    private readonly tripRepository: Repository<TripRequest>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    private readonly usersService: UsersService,
  ) {}

  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
    // Verify user exists and has Driver role
    const user = await this.usersService.findById(createDriverDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.Driver) {
      throw new BadRequestException('User must have Driver role');
    }

    // Check if driver profile already exists for this user
    const existingByUser = await this.driverRepository.findOne({
      where: { user: { id: createDriverDto.userId } },
    });

    if (existingByUser) {
      throw new ConflictException(
        'Driver profile already exists for this user',
      );
    }

    // Check if license number already exists
    const existingByLicense = await this.driverRepository.findOne({
      where: { licenseNumber: createDriverDto.licenseNumber },
    });

    if (existingByLicense) {
      throw new ConflictException('License number already exists');
    }

    const driver = this.driverRepository.create({
      user: { id: createDriverDto.userId } as any,
      licenseNumber: createDriverDto.licenseNumber,
      licenseExpiry: new Date(createDriverDto.licenseExpiry),
      experienceYears: createDriverDto.experienceYears,
      specializations: createDriverDto.specializations,
      notes: createDriverDto.notes,
    });

    const saved = await this.driverRepository.save(driver);

    // Save phoneNumber to the linked user if provided
    if (createDriverDto.phoneNumber) {
      await this.usersService.update(createDriverDto.userId, {
        phoneNumber: createDriverDto.phoneNumber,
      });
    }

    return saved;
  }

  async findAll(): Promise<Driver[]> {
    return this.driverRepository.find({
      relations: ['user', 'assignedVehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAvailable(): Promise<Driver[]> {
    const drivers = await this.driverRepository.find({
      where: { status: DriverStatus.Available },
      relations: ['user'],
      order: { rating: 'DESC' },
    });

    const holdingTrips = await this.tripRepository.find({
      where: { state: In(TRIP_STATES_HOLDING_ALLOCATION) },
      relations: ['allocatedDriver'],
    });
    const busyIds = new Set(
      holdingTrips
        .map((t) => t.allocatedDriver?.id)
        .filter((id): id is string => Boolean(id)),
    );

    return drivers.filter((d) => !busyIds.has(d.id));
  }

  async findByStatus(status: DriverStatus): Promise<Driver[]> {
    return this.driverRepository.find({
      where: { status },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id },
      relations: ['user', 'assignedVehicle'],
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  async findByUserId(userId: string): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!driver) {
      throw new NotFoundException('Driver profile not found for this user');
    }

    return driver;
  }

  async update(id: string, updateDriverDto: UpdateDriverDto): Promise<Driver> {
    const driver = await this.findOne(id);

    if (
      updateDriverDto.licenseNumber &&
      updateDriverDto.licenseNumber !== driver.licenseNumber
    ) {
      const existing = await this.driverRepository.findOne({
        where: {
          licenseNumber: updateDriverDto.licenseNumber,
          id: Not(id),
        },
      });

      if (existing) {
        throw new ConflictException('License number already exists');
      }
    }

    if (updateDriverDto.licenseExpiry) {
      driver.licenseExpiry = new Date(updateDriverDto.licenseExpiry);
    }

    Object.assign(driver, updateDriverDto);
    return this.driverRepository.save(driver);
  }

  async updateStatus(id: string, status: DriverStatus): Promise<Driver> {
    const driver = await this.findOne(id);
    driver.status = status;
    return this.driverRepository.save(driver);
  }

  async updateRating(id: string, rating: number): Promise<Driver> {
    const driver = await this.findOne(id);
    driver.rating = rating;
    return this.driverRepository.save(driver);
  }

  async incrementTripStats(id: string, distance: number): Promise<Driver> {
    const driver = await this.findOne(id);
    driver.totalTrips += 1;
    driver.totalDistance = Number(driver.totalDistance) + distance;
    return this.driverRepository.save(driver);
  }

  async remove(id: string): Promise<void> {
    const driver = await this.findOne(id);
    driver.status = DriverStatus.Inactive;
    await this.driverRepository.save(driver);
  }

  async assignVehicle(driverId: string, vehicleId: string): Promise<Driver> {
    const driver = await this.findOne(driverId);

    if (driver.status === DriverStatus.OnTrip) {
      throw new BadRequestException('Cannot reassign vehicle while driver is on a trip');
    }

    // Check vehicle exists
    const vehicle = await this.vehicleRepository.findOne({ where: { id: vehicleId } });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Block if vehicle is under maintenance
    if (vehicle.status === 'Maintenance') {
      throw new BadRequestException('Cannot assign a vehicle that is under maintenance');
    }

    // Block if vehicle is currently on an active trip
    const vehicleOnTrip = await this.tripRepository.count({
      where: {
        allocatedVehicle: { id: vehicleId },
        state: In(TRIP_STATES_HOLDING_ALLOCATION),
      },
    });
    if (vehicleOnTrip > 0) {
      throw new BadRequestException('Cannot assign a vehicle that is currently on an active trip');
    }

    // Enforce strict 1-to-1: vehicle must not be assigned to ANY other driver
    const alreadyAssigned = await this.driverRepository
      .createQueryBuilder('driver')
      .leftJoin('driver.assignedVehicle', 'vehicle')
      .leftJoin('driver.user', 'user')
      .addSelect(['user.name', 'user.id'])
      .where('vehicle.id = :vehicleId', { vehicleId })
      .andWhere('driver.id != :driverId', { driverId })
      .getOne();

    if (alreadyAssigned) {
      const name = alreadyAssigned.user?.name ?? alreadyAssigned.id;
      throw new ConflictException(
        `Vehicle is already assigned to driver "${name}". Unassign it first.`,
      );
    }

    // If this driver already has a different vehicle, unassign it first (1 driver = 1 vehicle)
    if (driver.assignedVehicle && driver.assignedVehicle.id !== vehicleId) {
      driver.assignedVehicle = null;
      await this.driverRepository.save(driver);
    }

    driver.assignedVehicle = vehicle;
    // Mark driver as Available (on-duty, ready for assignment)
    driver.status = DriverStatus.Available;
    await this.driverRepository.save(driver);

    // Set vehicle to Active and link back to this driver
    vehicle.status = VehicleStatus.Active;
    vehicle.assignedDriver = { id: driverId } as any;
    await this.vehicleRepository.save(vehicle);

    // Return fresh driver with vehicle relation loaded
    return this.findOne(driverId);
  }

  async unassignVehicle(driverId: string): Promise<Driver> {
    const driver = await this.findOne(driverId);
    if (driver.status === DriverStatus.OnTrip) {
      throw new BadRequestException('Cannot unassign vehicle while driver is on a trip');
    }
    const vehicleId = driver.assignedVehicle?.id;
    driver.assignedVehicle = null;
    driver.status = DriverStatus.Inactive;
    const saved = await this.driverRepository.save(driver);

    // Set the vehicle to Inactive too — no driver means not deployable
    if (vehicleId) {
      const vehicle = await this.vehicleRepository.findOne({ where: { id: vehicleId } });
      if (vehicle) {
        vehicle.status = VehicleStatus.Inactive;
        vehicle.assignedDriver = null;
        await this.vehicleRepository.save(vehicle);
      }
    }

    return saved;
  }

  async getAssignedVehicle(driverId: string) {
    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
      relations: ['assignedVehicle', 'user'],
    });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver.assignedVehicle ?? null;
  }

  async getStatistics() {
    const total = await this.driverRepository.count();
    const available = await this.driverRepository.count({
      where: { status: DriverStatus.Available },
    });
    const onTrip = await this.driverRepository.count({
      where: { status: DriverStatus.OnTrip },
    });
    const onLeave = await this.driverRepository.count({
      where: { status: DriverStatus.OnLeave },
    });
    const inactive = await this.driverRepository.count({
      where: { status: DriverStatus.Inactive },
    });

    const avgRatingResult = await this.driverRepository
      .createQueryBuilder('driver')
      .select('AVG(driver.rating)', 'avgRating')
      .getRawOne();

    return {
      total,
      available,
      onTrip,
      onLeave,
      inactive,
      averageRating: avgRatingResult?.avgRating
        ? parseFloat(avgRatingResult.avgRating).toFixed(2)
        : 0,
      availablePercentage:
        total > 0 ? ((available / total) * 100).toFixed(2) : 0,
    };
  }
}
