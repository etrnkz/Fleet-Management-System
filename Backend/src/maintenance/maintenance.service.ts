import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceRequest, MaintenanceStatus } from './entities/maintenance-request.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { InspectMaintenanceDto } from './dto/inspect-maintenance.dto';
import { CompleteMaintenanceDto } from './dto/complete-maintenance.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { VehiclesService } from '../vehicles/vehicles.service';
import { VehicleStatus } from '../vehicles/entities/vehicle.entity';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceRequest)
    private readonly maintenanceRepository: Repository<MaintenanceRequest>,
    private readonly vehiclesService: VehiclesService,
  ) {}

  async create(createMaintenanceDto: CreateMaintenanceDto, user: User): Promise<MaintenanceRequest> {
    // Verify vehicle exists
    const vehicle = await this.vehiclesService.findOne(createMaintenanceDto.vehicleId);

    // Generate request number
    const count = await this.maintenanceRepository.count();
    const requestNumber = `MR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const maintenance = this.maintenanceRepository.create({
      requestNumber,
      vehicle,
      submittedBy: user,
      issueDescription: createMaintenanceDto.issueDescription,
      priority: createMaintenanceDto.priority,
      status: MaintenanceStatus.Submitted,
    });

    // Set vehicle to under maintenance
    await this.vehiclesService.setMaintenanceStatus(vehicle.id, true);

    return this.maintenanceRepository.save(maintenance);
  }

  async findAll(): Promise<MaintenanceRequest[]> {
    return this.maintenanceRepository.find({
      relations: ['vehicle', 'submittedBy', 'inspectedBy', 'approvedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: MaintenanceStatus): Promise<MaintenanceRequest[]> {
    return this.maintenanceRepository.find({
      where: { status },
      relations: ['vehicle', 'submittedBy', 'inspectedBy', 'approvedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MaintenanceRequest> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id },
      relations: ['vehicle', 'submittedBy', 'inspectedBy', 'approvedBy'],
    });

    if (!maintenance) {
      throw new NotFoundException('Maintenance request not found');
    }

    return maintenance;
  }

  async inspect(id: string, inspectDto: InspectMaintenanceDto, user: User): Promise<MaintenanceRequest> {
    const maintenance = await this.findOne(id);

    if (maintenance.status !== MaintenanceStatus.Submitted) {
      throw new BadRequestException('Can only inspect submitted maintenance requests');
    }

    if (user.role !== UserRole.MaintenanceTeam) {
      throw new ForbiddenException('Only Maintenance Team can inspect');
    }

    maintenance.inspectionNotes = inspectDto.inspectionNotes;
    maintenance.estimatedCost = inspectDto.estimatedCost;
    maintenance.inspectedBy = user;
    maintenance.inspectedAt = new Date();
    maintenance.status = MaintenanceStatus.EstimateProvided;

    return this.maintenanceRepository.save(maintenance);
  }

  async approveBudget(id: string, user: User): Promise<MaintenanceRequest> {
    const maintenance = await this.findOne(id);

    if (maintenance.status !== MaintenanceStatus.EstimateProvided) {
      throw new BadRequestException('Can only approve budget for estimated maintenance');
    }

    if (user.role !== UserRole.TransportOffice) {
      throw new ForbiddenException('Only Transport Office can approve budget');
    }

    maintenance.approvedBy = user;
    maintenance.approvedAt = new Date();
    maintenance.status = MaintenanceStatus.BudgetApproved;

    return this.maintenanceRepository.save(maintenance);
  }

  async startMaintenance(id: string, user: User): Promise<MaintenanceRequest> {
    const maintenance = await this.findOne(id);

    if (maintenance.status !== MaintenanceStatus.BudgetApproved) {
      throw new BadRequestException('Budget must be approved before starting maintenance');
    }

    if (user.role !== UserRole.MaintenanceTeam) {
      throw new ForbiddenException('Only Maintenance Team can start maintenance');
    }

    maintenance.status = MaintenanceStatus.InProgress;

    return this.maintenanceRepository.save(maintenance);
  }

  async complete(id: string, completeDto: CompleteMaintenanceDto, user: User): Promise<MaintenanceRequest> {
    const maintenance = await this.findOne(id);

    if (maintenance.status !== MaintenanceStatus.InProgress) {
      throw new BadRequestException('Maintenance must be in progress to complete');
    }

    if (user.role !== UserRole.MaintenanceTeam) {
      throw new ForbiddenException('Only Maintenance Team can complete maintenance');
    }

    maintenance.actualCost = completeDto.actualCost;
    maintenance.completionNotes = completeDto.completionNotes;
    maintenance.completedAt = new Date();
    maintenance.status = MaintenanceStatus.Completed;

    // Set vehicle back to active
    await this.vehiclesService.setMaintenanceStatus(maintenance.vehicle.id, false);

    return this.maintenanceRepository.save(maintenance);
  }

  async reject(id: string, reason: string, user: User): Promise<MaintenanceRequest> {
    const maintenance = await this.findOne(id);

    if (maintenance.status === MaintenanceStatus.Completed) {
      throw new BadRequestException('Cannot reject completed maintenance');
    }

    if (user.role !== UserRole.TransportOffice && user.role !== UserRole.MaintenanceTeam) {
      throw new ForbiddenException('Only Transport Office or Maintenance Team can reject');
    }

    maintenance.rejectionReason = reason;
    maintenance.status = MaintenanceStatus.Rejected;

    // Set vehicle back to active
    await this.vehiclesService.setMaintenanceStatus(maintenance.vehicle.id, false);

    return this.maintenanceRepository.save(maintenance);
  }

  async getStatistics() {
    const total = await this.maintenanceRepository.count();
    const submitted = await this.maintenanceRepository.count({ where: { status: MaintenanceStatus.Submitted } });
    const inProgress = await this.maintenanceRepository.count({ where: { status: MaintenanceStatus.InProgress } });
    const completed = await this.maintenanceRepository.count({ where: { status: MaintenanceStatus.Completed } });
    const rejected = await this.maintenanceRepository.count({ where: { status: MaintenanceStatus.Rejected } });

    const costResult = await this.maintenanceRepository
      .createQueryBuilder('maintenance')
      .select('SUM(maintenance.actualCost)', 'totalCost')
      .where('maintenance.status = :status', { status: MaintenanceStatus.Completed })
      .getRawOne();

    return {
      total,
      submitted,
      inProgress,
      completed,
      rejected,
      totalCost: costResult?.totalCost ? parseFloat(costResult.totalCost) : 0,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
    };
  }
}
