import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Driver, DriverStatus } from './entities/driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
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
      ...createDriverDto,
      user: { id: createDriverDto.userId } as any,
      licenseExpiry: new Date(createDriverDto.licenseExpiry),
    });

    return this.driverRepository.save(driver);
  }

  async findAll(): Promise<Driver[]> {
    return this.driverRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAvailable(): Promise<Driver[]> {
    return this.driverRepository.find({
      where: { status: DriverStatus.Available },
      relations: ['user'],
      order: { rating: 'DESC' },
    });
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
      relations: ['user'],
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
