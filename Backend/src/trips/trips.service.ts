import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripRequest, TripState, TripType } from './entities/trip-request.entity';
import { Approval, ApprovalLevel, ApprovalStatus } from './entities/approval.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { ApproveTripDto } from './dto/approve-trip.dto';
import { RejectTripDto } from './dto/reject-trip.dto';
import { AllocateTripDto } from './dto/allocate-trip.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { VehiclesService } from '../vehicles/vehicles.service';
import { DriversService } from '../drivers/drivers.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(TripRequest)
    private readonly tripRepository: Repository<TripRequest>,
    @InjectRepository(Approval)
    private readonly approvalRepository: Repository<Approval>,
    private readonly vehiclesService: VehiclesService,
    private readonly driversService: DriversService,
    private readonly notificationsService: NotificationsService,
    private readonly workflowService: WorkflowService,
  ) {}

  async create(createTripDto: CreateTripDto, user: User): Promise<TripRequest> {
    // Validate 48-hour advance booking
    const startDate = new Date(createTripDto.startDateTime);
    const now = new Date();
    const hoursDiff = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 48) {
      throw new BadRequestException(
        'Trip must be requested at least 48 hours in advance',
      );
    }

    // Validate end date is after start date
    const endDate = new Date(createTripDto.endDateTime);
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Generate request number
    const count = await this.tripRepository.count();
    const requestNumber = `TR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const trip = this.tripRepository.create({
      ...createTripDto,
      requestNumber,
      requester: user,
      startDateTime: startDate,
      endDateTime: endDate,
      state: TripState.DRAFT,
    });

    return this.tripRepository.save(trip);
  }

  async findAll(userId?: string, role?: UserRole): Promise<TripRequest[]> {
    const query = this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.requester', 'requester')
      .leftJoinAndSelect('trip.allocatedVehicle', 'vehicle')
      .leftJoinAndSelect('trip.allocatedDriver', 'driver')
      .leftJoinAndSelect('driver.user', 'driverUser')
      .leftJoinAndSelect('trip.approvals', 'approvals')
      .orderBy('trip.createdAt', 'DESC');

    // Filter based on role
    if (role === UserRole.User) {
      query.where('requester.id = :userId', { userId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<TripRequest> {
    const trip = await this.tripRepository.findOne({
      where: { id },
      relations: [
        'requester',
        'requester.department',
        'requester.college',
        'allocatedVehicle',
        'allocatedDriver',
        'allocatedDriver.user',
        'approvals',
        'approvals.approver',
        'rejectedBy',
        'deploymentTeamMember',
        'transportOfficer',
      ],
    });

    if (!trip) {
      throw new NotFoundException('Trip request not found');
    }

    return trip;
  }

  async update(
    id: string,
    updateTripDto: UpdateTripDto,
    user: User,
  ): Promise<TripRequest> {
    const trip = await this.findOne(id);

    // Only allow updates in DRAFT state
    if (trip.state !== TripState.DRAFT) {
      throw new BadRequestException('Can only update trip requests in DRAFT state');
    }

    // Only requester can update
    if (trip.requester.id !== user.id) {
      throw new ForbiddenException('Only the requester can update this trip');
    }

    // Validate dates if provided
    if (updateTripDto.startDateTime) {
      const startDate = new Date(updateTripDto.startDateTime);
      const now = new Date();
      const hoursDiff = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < 48) {
        throw new BadRequestException(
          'Trip must be requested at least 48 hours in advance',
        );
      }

      trip.startDateTime = startDate;
    }

    if (updateTripDto.endDateTime) {
      trip.endDateTime = new Date(updateTripDto.endDateTime);
    }

    if (trip.endDateTime <= trip.startDateTime) {
      throw new BadRequestException('End date must be after start date');
    }

    Object.assign(trip, updateTripDto);
    return this.tripRepository.save(trip);
  }

  async submit(id: string, user: User): Promise<TripRequest> {
    const trip = await this.findOne(id);

    if (trip.state !== TripState.DRAFT) {
      throw new BadRequestException('Trip request has already been submitted');
    }

    if (trip.requester.id !== user.id) {
      throw new ForbiddenException('Only the requester can submit this trip');
    }

    // Determine initial state based on trip type
    let initialState: TripState;
    let approvalLevel: ApprovalLevel;

    if (trip.tripType === TripType.VIP) {
      // VIP goes directly to Dean
      initialState = TripState.PENDING_DEAN;
      approvalLevel = ApprovalLevel.Dean;
    } else {
      // Normal goes to Department first
      initialState = TripState.PENDING_DEPARTMENT;
      approvalLevel = ApprovalLevel.Department;
    }

    trip.state = initialState;
    trip.currentApprovalLevel = approvalLevel;

    // Create first approval record
    const approval = this.approvalRepository.create({
      tripRequest: trip,
      approvalLevel,
      status: ApprovalStatus.Pending,
      dueDate: this.calculateDueDate(48), // 48 hours timeout
    });

    await this.approvalRepository.save(approval);
    
    const savedTrip = await this.tripRepository.save(trip);
    
    // Initialize workflow (schedule timeout)
    try {
      await this.workflowService.initializeWorkflow(savedTrip);
    } catch (error) {
      console.error('Failed to initialize workflow:', error);
    }
    
    return savedTrip;
    // Reschedule workflow for next level or cancel if done
    try {
      await this.workflowService.rescheduleOnApproval(trip);
    } catch (error) {
      console.error('Failed to reschedule workflow:', error);
    }
    
    return this.tripRepository.save(trip);
  }

  async approve(
    id: string,
    approveTripDto: ApproveTripDto,
    user: User,
  ): Promise<TripRequest> {
    const trip = await this.findOne(id);

    // Validate user can approve at current level
    this.validateApprover(trip, user);

    // Get current pending approval
    const approval = trip.approvals.find(
      a => a.status === ApprovalStatus.Pending,
    );

    if (!approval) {
      throw new BadRequestException('No pending approval found');
    }

    // Update approval
    approval.status = ApprovalStatus.Approved;
    approval.approver = user;
    approval.comments = approveTripDto.comments || null;
    approval.approvedAt = new Date();
    await this.approvalRepository.save(approval);

    // Determine next state
    const nextState = this.getNextStateOnApprove(trip.state);
    trip.state = nextState;

    // If moving to next approval level, create approval record
    if (this.isApprovalState(nextState)) {
      const nextLevel = this.getApprovalLevelFromState(nextState);
      trip.currentApprovalLevel = nextLevel;

      const nextApproval = this.approvalRepository.create({
        tripRequest: trip,
        approvalLevel: nextLevel,
        status: ApprovalStatus.Pending,
        dueDate: this.calculateDueDate(48),
      });

      await this.approvalRepository.save(nextApproval);
    } else {
      trip.currentApprovalLevel = null;
    }

    return this.tripRepository.save(trip);
  }

  async reject(
    id: string,
    rejectTripDto: RejectTripDto,
    user: User,
  ): Promise<TripRequest> {
    const trip = await this.findOne(id);

    // Validate user can reject at current level
    this.validateApprover(trip, user);

    // Get current pending approval
    const approval = trip.approvals.find(
      a => a.status === ApprovalStatus.Pending,
    );

    if (!approval) {
      throw new BadRequestException('No pending approval found');
    }

    // Update approval
    approval.status = ApprovalStatus.Rejected;
    approval.approver = user;
    approval.comments = rejectTripDto.reason;
    approval.approvedAt = new Date();
    await this.approvalRepository.save(approval);

    // Update trip
    trip.state = TripState.REJECTED;
    trip.rejectedBy = user;
    trip.rejectedAt = new Date();
    trip.rejectionReason = rejectTripDto.reason;
    trip.currentApprovalLevel = null;

    // Cancel scheduled workflow jobs
    try {
      await this.workflowService.cancelScheduledJobs(trip.id);
    } catch (error) {
      console.error('Failed to cancel workflow jobs:', error);
    }

    // Send notification
    try {
      await this.notificationsService.notifyTripRejected(trip, user, rejectTripDto.reason);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    return this.tripRepository.save(trip);
  }

  async allocate(
    id: string,
    allocateTripDto: AllocateTripDto,
    user: User,
  ): Promise<TripRequest> {
    const trip = await this.findOne(id);

    if (trip.state !== TripState.APPROVED_FOR_ALLOCATION) {
      throw new BadRequestException(
        'Trip must be in APPROVED_FOR_ALLOCATION state',
      );
    }

    if (user.role !== UserRole.DeploymentTeam) {
      throw new ForbiddenException('Only Deployment Team can allocate resources');
    }

    // Verify vehicle and driver exist and are available
    const vehicle = await this.vehiclesService.findOne(allocateTripDto.vehicleId);
    const driver = await this.driversService.findOne(allocateTripDto.driverId);

    // TODO: In Phase 3, check vehicle/driver availability for the trip dates

    trip.allocatedVehicle = vehicle;
    trip.allocatedDriver = driver;
    trip.deploymentTeamMember = user;
    trip.estimatedFuelCost = allocateTripDto.estimatedFuelCost;
    trip.estimatedDistance = allocateTripDto.estimatedDistance;
    trip.state = TripState.CAR_ALLOCATED;

    const savedTrip = await this.tripRepository.save(trip);

    // Send notification
    try {
      await this.notificationsService.notifyTripAllocated(savedTrip);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    return savedTrip;
  }

  async cancel(id: string, user: User): Promise<TripRequest> {
    const trip = await this.findOne(id);

    // Only requester can cancel
    if (trip.requester.id !== user.id) {
      throw new ForbiddenException('Only the requester can cancel this trip');
    }

    // Can't cancel completed trips
    if (trip.state === TripState.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed trip');
    }

    // Cancel scheduled workflow jobs
    try {
      await this.workflowService.cancelScheduledJobs(trip.id);
    } catch (error) {
      console.error('Failed to cancel workflow jobs:', error);
    }

    trip.state = TripState.CANCELLED;
    return this.tripRepository.save(trip);
  }

  private validateApprover(trip: TripRequest, user: User): void {
    const requiredRole = this.getRequiredRoleForState(trip.state);

    if (user.role !== requiredRole) {
      throw new ForbiddenException(
        `Only ${requiredRole} can approve at this level`,
      );
    }
  }

  private getRequiredRoleForState(state: TripState): UserRole {
    const mapping = {
      [TripState.PENDING_DEPARTMENT]: UserRole.DepartmentHead,
      [TripState.PENDING_COLLEGE]: UserRole.CollegeHead,
      [TripState.PENDING_DEAN]: UserRole.Dean,
    };

    return mapping[state];
  }

  private getNextStateOnApprove(currentState: TripState): TripState {
    const mapping = {
      [TripState.PENDING_DEPARTMENT]: TripState.PENDING_COLLEGE,
      [TripState.PENDING_COLLEGE]: TripState.PENDING_DEAN,
      [TripState.PENDING_DEAN]: TripState.APPROVED_FOR_ALLOCATION,
    };

    return mapping[currentState];
  }

  private isApprovalState(state: TripState): boolean {
    return [
      TripState.PENDING_DEPARTMENT,
      TripState.PENDING_COLLEGE,
      TripState.PENDING_DEAN,
    ].includes(state);
  }

  private getApprovalLevelFromState(state: TripState): ApprovalLevel {
    const mapping = {
      [TripState.PENDING_DEPARTMENT]: ApprovalLevel.Department,
      [TripState.PENDING_COLLEGE]: ApprovalLevel.College,
      [TripState.PENDING_DEAN]: ApprovalLevel.Dean,
    };

    return mapping[state];
  }

  private calculateDueDate(hours: number): Date {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  async confirmTransport(
    id: string,
    confirmTransportDto: any,
    user: User,
  ): Promise<TripRequest> {
    const trip = await this.findOne(id);

    if (trip.state !== TripState.CAR_ALLOCATED) {
      throw new BadRequestException('Trip must be in CAR_ALLOCATED state');
    }

    if (user.role !== UserRole.TransportOffice) {
      throw new ForbiddenException('Only Transport Office can confirm transport');
    }

    if (!confirmTransportDto.fuelApproved) {
      throw new BadRequestException('Fuel must be approved to proceed');
    }

    trip.transportOfficer = user;
    trip.state = TripState.READY;

    const savedTrip = await this.tripRepository.save(trip);

    // Send notification
    try {
      await this.notificationsService.notifyTripReady(savedTrip);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    return savedTrip;
  }

  async startTrip(id: string, startTripDto: any, user: User): Promise<TripRequest> {
    const trip = await this.findOne(id);

    if (trip.state !== TripState.READY) {
      throw new BadRequestException('Trip must be in READY state to start');
    }

    // Validate plate number matches allocated vehicle
    if (trip.allocatedVehicle.plateNumber !== startTripDto.plateNumber) {
      throw new BadRequestException('Plate number does not match allocated vehicle');
    }

    if (!startTripDto.scannerValidation) {
      throw new BadRequestException('Scanner validation required to start trip');
    }

    // Only driver or transport office can start trip
    if (
      user.role !== UserRole.Driver &&
      user.role !== UserRole.TransportOffice
    ) {
      throw new ForbiddenException('Only Driver or Transport Office can start trip');
    }

    trip.state = TripState.IN_PROGRESS;

    return this.tripRepository.save(trip);
  }

  async completeTrip(
    id: string,
    completeTripDto: any,
    user: User,
  ): Promise<TripRequest> {
    const trip = await this.findOne(id);

    if (trip.state !== TripState.IN_PROGRESS) {
      throw new BadRequestException('Trip must be in IN_PROGRESS state to complete');
    }

    // Only driver or transport office can complete trip
    if (
      user.role !== UserRole.Driver &&
      user.role !== UserRole.TransportOffice
    ) {
      throw new ForbiddenException('Only Driver or Transport Office can complete trip');
    }

    trip.actualDistance = completeTripDto.actualDistance;
    trip.actualFuelCost = completeTripDto.actualFuelCost;
    trip.state = TripState.COMPLETED;
    trip.completedAt = new Date();

    // Update vehicle mileage
    if (trip.allocatedVehicle) {
      await this.vehiclesService.updateMileage(
        trip.allocatedVehicle.id,
        completeTripDto.finalMileage,
      );
    }

    // Update driver statistics
    if (trip.allocatedDriver) {
      await this.driversService.incrementTripStats(
        trip.allocatedDriver.id,
        completeTripDto.actualDistance,
      );
    }

    const savedTrip = await this.tripRepository.save(trip);

    // Send notification
    try {
      await this.notificationsService.notifyTripCompleted(savedTrip);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    return savedTrip;
  }

  async getPendingApprovals(userId: string, role: UserRole): Promise<TripRequest[]> {
    let state: TripState;

    switch (role) {
      case UserRole.DepartmentHead:
        state = TripState.PENDING_DEPARTMENT;
        break;
      case UserRole.CollegeHead:
        state = TripState.PENDING_COLLEGE;
        break;
      case UserRole.Dean:
        state = TripState.PENDING_DEAN;
        break;
      default:
        return [];
    }

    return this.tripRepository.find({
      where: { state },
      relations: [
        'requester',
        'requester.department',
        'requester.college',
        'approvals',
      ],
      order: { createdAt: 'ASC' },
    });
  }

  async getStatistics() {
    const total = await this.tripRepository.count();
    const draft = await this.tripRepository.count({ where: { state: TripState.DRAFT } });
    const pending = await this.tripRepository.count({
      where: [
        { state: TripState.PENDING_DEPARTMENT },
        { state: TripState.PENDING_COLLEGE },
        { state: TripState.PENDING_DEAN },
      ],
    });
    const approved = await this.tripRepository.count({
      where: { state: TripState.APPROVED_FOR_ALLOCATION },
    });
    const inProgress = await this.tripRepository.count({
      where: { state: TripState.IN_PROGRESS },
    });
    const completed = await this.tripRepository.count({
      where: { state: TripState.COMPLETED },
    });
    const rejected = await this.tripRepository.count({
      where: [
        { state: TripState.REJECTED },
        { state: TripState.AUTO_REJECTED_TIMEOUT },
      ],
    });
    const cancelled = await this.tripRepository.count({
      where: { state: TripState.CANCELLED },
    });

    // Calculate total fuel cost
    const fuelResult = await this.tripRepository
      .createQueryBuilder('trip')
      .select('SUM(trip.actualFuelCost)', 'totalFuel')
      .where('trip.state = :state', { state: TripState.COMPLETED })
      .getRawOne();

    // Calculate total distance
    const distanceResult = await this.tripRepository
      .createQueryBuilder('trip')
      .select('SUM(trip.actualDistance)', 'totalDistance')
      .where('trip.state = :state', { state: TripState.COMPLETED })
      .getRawOne();

    return {
      total,
      draft,
      pending,
      approved,
      inProgress,
      completed,
      rejected,
      cancelled,
      totalFuelCost: fuelResult?.totalFuel ? parseFloat(fuelResult.totalFuel) : 0,
      totalDistance: distanceResult?.totalDistance ? parseFloat(distanceResult.totalDistance) : 0,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
    };
  }
}
