import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const existing = await this.vehicleRepository.findOne({
      where: { plateNumber: createVehicleDto.plateNumber },
    });

    if (existing) {
      throw new ConflictException('Vehicle with this plate number already exists');
    }

    const vehicle = this.vehicleRepository.create(createVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      order: { plateNumber: 'ASC' },
    });
  }

  async findAvailable(startDateTime?: Date, endDateTime?: Date): Promise<Vehicle[]> {
    // For now, return all active vehicles not under maintenance
    // In Phase 3, we'll check against trip allocations
    return this.vehicleRepository.find({
      where: {
        status: VehicleStatus.Active,
      },
      order: { plateNumber: 'ASC' },
    });
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

  async update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);

    if (updateVehicleDto.plateNumber && updateVehicleDto.plateNumber !== vehicle.plateNumber) {
      const existing = await this.vehicleRepository.findOne({
        where: { 
          plateNumber: updateVehicleDto.plateNumber,
          id: Not(id),
        },
      });

      if (existing) {
        throw new ConflictException('Vehicle with this plate number already exists');
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

  async setMaintenanceStatus(id: string, underMaintenance: boolean): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    vehicle.status = underMaintenance ? VehicleStatus.UnderMaintenance : VehicleStatus.Active;
    
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
    const active = await this.vehicleRepository.count({ where: { status: VehicleStatus.Active } });
    const underMaintenance = await this.vehicleRepository.count({ where: { status: VehicleStatus.UnderMaintenance } });
    const inactive = await this.vehicleRepository.count({ where: { status: VehicleStatus.Inactive } });

    return {
      total,
      active,
      underMaintenance,
      inactive,
      availablePercentage: total > 0 ? ((active / total) * 100).toFixed(2) : 0,
    };
  }
}
