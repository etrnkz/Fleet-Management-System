import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { FuelRecord, FuelRecordType } from './entities/fuel-record.entity';
import { CreateFuelRecordDto } from './dto/create-fuel-record.dto';
import { VehiclesService } from '../vehicles/vehicles.service';

@Injectable()
export class FuelService {
  constructor(
    @InjectRepository(FuelRecord)
    private readonly fuelRecordRepository: Repository<FuelRecord>,
    private readonly vehiclesService: VehiclesService,
  ) {}

  async create(createFuelRecordDto: CreateFuelRecordDto, userId: string): Promise<FuelRecord> {
    // Verify vehicle exists
    const vehicle = await this.vehiclesService.findOne(createFuelRecordDto.vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Calculate total cost
    const totalCost = createFuelRecordDto.quantity * createFuelRecordDto.pricePerLiter;

    const fuelRecord = this.fuelRecordRepository.create({
      ...createFuelRecordDto,
      totalCost,
      recordedById: userId,
    });

    return this.fuelRecordRepository.save(fuelRecord);
  }

  async findAll(
    vehicleId?: string,
    type?: FuelRecordType,
    startDate?: Date,
    endDate?: Date,
  ): Promise<FuelRecord[]> {
    const query = this.fuelRecordRepository.createQueryBuilder('fuel')
      .leftJoinAndSelect('fuel.vehicle', 'vehicle')
      .leftJoinAndSelect('fuel.recordedBy', 'recordedBy')
      .leftJoinAndSelect('fuel.trip', 'trip');

    if (vehicleId) {
      query.andWhere('fuel.vehicleId = :vehicleId', { vehicleId });
    }

    if (type) {
      query.andWhere('fuel.type = :type', { type });
    }

    if (startDate && endDate) {
      query.andWhere('fuel.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    query.orderBy('fuel.createdAt', 'DESC');

    return query.getMany();
  }

  async findOne(id: string): Promise<FuelRecord> {
    const record = await this.fuelRecordRepository.findOne({
      where: { id },
      relations: ['vehicle', 'recordedBy', 'trip'],
    });

    if (!record) {
      throw new NotFoundException('Fuel record not found');
    }

    return record;
  }

  async getVehicleFuelHistory(vehicleId: string): Promise<FuelRecord[]> {
    return this.fuelRecordRepository.find({
      where: { vehicleId },
      relations: ['recordedBy', 'trip'],
      order: { createdAt: 'DESC' },
    });
  }

  async calculateFuelEfficiency(vehicleId: string): Promise<any> {
    const records = await this.fuelRecordRepository.find({
      where: { vehicleId },
      order: { mileageAtRefuel: 'ASC' },
    });

    if (records.length < 2) {
      return {
        message: 'Insufficient data for fuel efficiency calculation',
        recordCount: records.length,
      };
    }

    const refuelRecords = records.filter(r => r.type === FuelRecordType.Refuel && r.mileageAtRefuel);

    if (refuelRecords.length < 2) {
      return {
        message: 'Need at least 2 refuel records with mileage',
        recordCount: refuelRecords.length,
      };
    }

    let totalDistance = 0;
    let totalFuel = 0;
    const efficiencyData: Array<{
      date: Date;
      distance: number;
      fuel: number;
      efficiency: number;
      mileage: number;
    }> = [];

    for (let i = 1; i < refuelRecords.length; i++) {
      const current = refuelRecords[i];
      const previous = refuelRecords[i - 1];

      const distance = current.mileageAtRefuel - previous.mileageAtRefuel;
      const fuel = Number(current.quantity);

      if (distance > 0 && fuel > 0) {
        const efficiency = distance / fuel; // km per liter
        totalDistance += distance;
        totalFuel += fuel;

        efficiencyData.push({
          date: current.createdAt,
          distance,
          fuel,
          efficiency: parseFloat(efficiency.toFixed(2)),
          mileage: current.mileageAtRefuel,
        });
      }
    }

    const averageEfficiency = totalDistance / totalFuel;

    return {
      vehicleId,
      averageEfficiency: parseFloat(averageEfficiency.toFixed(2)),
      totalDistance,
      totalFuel: parseFloat(totalFuel.toFixed(2)),
      recordCount: efficiencyData.length,
      efficiencyData,
    };
  }

  async getStatistics(startDate?: Date, endDate?: Date): Promise<any> {
    const query = this.fuelRecordRepository.createQueryBuilder('fuel');

    if (startDate && endDate) {
      query.where('fuel.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const records = await query.getMany();

    const totalRecords = records.length;
    const totalCost = records.reduce((sum, r) => sum + Number(r.totalCost), 0);
    const totalQuantity = records.reduce((sum, r) => sum + Number(r.quantity), 0);

    const byType = records.reduce((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byVehicle = records.reduce((acc, record) => {
      const key = record.vehicle?.plateNumber || 'Unknown';
      if (!acc[key]) {
        acc[key] = { count: 0, totalCost: 0, totalQuantity: 0 };
      }
      acc[key].count++;
      acc[key].totalCost += Number(record.totalCost);
      acc[key].totalQuantity += Number(record.quantity);
      return acc;
    }, {} as Record<string, any>);

    const averagePricePerLiter = totalQuantity > 0 ? totalCost / totalQuantity : 0;

    return {
      totalRecords,
      totalCost: parseFloat(totalCost.toFixed(2)),
      totalQuantity: parseFloat(totalQuantity.toFixed(2)),
      averagePricePerLiter: parseFloat(averagePricePerLiter.toFixed(2)),
      byType,
      byVehicle,
      dateRange: startDate && endDate ? { startDate, endDate } : null,
    };
  }

  async getCostAnalysis(vehicleId?: string, startDate?: Date, endDate?: Date): Promise<any> {
    const query = this.fuelRecordRepository.createQueryBuilder('fuel')
      .leftJoinAndSelect('fuel.vehicle', 'vehicle');

    if (vehicleId) {
      query.where('fuel.vehicleId = :vehicleId', { vehicleId });
    }

    if (startDate && endDate) {
      query.andWhere('fuel.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const records = await query.getMany();

    const totalCost = records.reduce((sum, r) => sum + Number(r.totalCost), 0);
    const totalQuantity = records.reduce((sum, r) => sum + Number(r.quantity), 0);

    // Group by month
    const monthlyData = records.reduce((acc, record) => {
      const month = new Date(record.createdAt).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { cost: 0, quantity: 0, count: 0 };
      }
      acc[month].cost += Number(record.totalCost);
      acc[month].quantity += Number(record.quantity);
      acc[month].count++;
      return acc;
    }, {} as Record<string, any>);

    return {
      totalCost: parseFloat(totalCost.toFixed(2)),
      totalQuantity: parseFloat(totalQuantity.toFixed(2)),
      recordCount: records.length,
      monthlyBreakdown: Object.entries(monthlyData).map(([month, data]) => ({
        month,
        cost: parseFloat(data.cost.toFixed(2)),
        quantity: parseFloat(data.quantity.toFixed(2)),
        count: data.count,
        averageCostPerRefuel: parseFloat((data.cost / data.count).toFixed(2)),
      })),
      vehicleId: vehicleId || 'all',
    };
  }
}
