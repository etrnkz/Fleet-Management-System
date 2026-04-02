import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TripRequest,
  TripState,
  TripType,
} from './entities/trip-request.entity';
import {
  Approval,
  ApprovalLevel,
  ApprovalStatus,
} from './entities/approval.entity';
import { TripFeedback, FeedbackRating } from './entities/trip-feedback.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { ApproveTripDto } from './dto/approve-trip.dto';
import { RejectTripDto } from './dto/reject-trip.dto';
import { AllocateTripDto } from './dto/allocate-trip.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { EarlyCompleteTripDto } from './dto/early-complete-trip.dto';
import { ConfirmTransportDto } from './dto/confirm-transport.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { VehiclesService } from '../vehicles/vehicles.service';
import { DriversService } from '../drivers/drivers.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WorkflowService } from '../workflow/workflow.service';
import { parseTripQrPayload } from './utils/trip-qr.util';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(TripRequest)
    private readonly tripRepository: Repository<TripRequest>,
    @InjectRepository(Approval)
    private readonly approvalRepository: Repository<Approval>,
    @InjectRepository(TripFeedback)
    private readonly feedbackRepository: Repository<TripFeedback>,
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
      .leftJoinAndSelect('requester.department', 'requesterDepartment')
      .leftJoinAndSelect('requester.college', 'requesterCollege')
      .leftJoinAndSelect('trip.allocatedVehicle', 'vehicle')
      .leftJoinAndSelect('trip.allocatedDriver', 'driver')
      .leftJoinAndSelect('driver.user', 'driverUser')
      .leftJoinAndSelect('trip.approvals', 'approvals')
      .orderBy('trip.createdAt', 'DESC');

    // Filter based on role
    if (role === UserRole.User) {
      query.where('requester.id = :userId', { userId });
    } else if (role === UserRole.DepartmentHead) {
      // Department heads see trips from their department
      query
        .leftJoin('users', 'approver', 'approver.id = :userId', { userId })
        .leftJoin('approver.department', 'approverDepartment')
        .where('requesterDepartment.id = approverDepartment.id');
    } else if (role === UserRole.CollegeHead) {
      // College heads see trips from their college
      query
        .leftJoin('users', 'approver', 'approver.id = :userId', { userId })
        .leftJoin('approver.college', 'approverCollege')
        .where('requesterCollege.id = approverCollege.id');
    }
    // Dean and other roles see all trips

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
      throw new BadRequestException(
        'Can only update trip requests in DRAFT state',
      );
    }

    // Only requester can update
    if (trip.requester.id !== user.id) {
      throw new ForbiddenException('Only the requester can update this trip');
    }

    // Validate dates if provided
    if (updateTripDto.startDateTime) {
      const startDate = new Date(updateTripDto.startDateTime);
      const now = new Date();
      const hoursDiff =
        (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

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

    // Save trip first to ensure it has an ID
    const savedTrip = await this.tripRepository.save(trip);

    // Create first approval record
    const approval = this.approvalRepository.create({
      tripRequest: savedTrip,
      approvalLevel,
      status: ApprovalStatus.Pending,
      dueDate: this.calculateDueDate(48), // 48 hours timeout
    });

    await this.approvalRepository.save(approval);

    // Send notification about submission
    try {
      await this.notificationsService.notifyTripSubmitted(savedTrip);
    } catch (error) {
      console.error('Failed to send submission notification:', error);
    }

    // Initialize workflow (schedule timeout)
    try {
      await this.workflowService.initializeWorkflow(savedTrip);
    } catch (error) {
      console.error('Failed to initialize workflow:', error);
    }

    return savedTrip;
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
      (a) => a.status === ApprovalStatus.Pending,
    );

    if (!approval) {
      // Log for debugging
      console.error('No pending approval found for trip:', {
        tripId: trip.id,
        tripState: trip.state,
        approvalsCount: trip.approvals.length,
        approvals: trip.approvals.map((a) => ({
          id: a.id,
          level: a.approvalLevel,
          status: a.status,
        })),
      });
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
    const oldState = trip.state;
    trip.state = nextState;

    // If moving to next approval level, create approval record BEFORE saving trip
    if (this.isApprovalState(nextState)) {
      const nextLevel = this.getApprovalLevelFromState(nextState);
      trip.currentApprovalLevel = nextLevel;

      // Save trip first to ensure it has the new state
      await this.tripRepository.save(trip);

      // Now create the approval record
      const nextApproval = this.approvalRepository.create({
        tripRequest: trip,
        approvalLevel: nextLevel,
        status: ApprovalStatus.Pending,
        dueDate: this.calculateDueDate(48),
      });

      const savedApproval = await this.approvalRepository.save(nextApproval);

      console.log('Created next approval:', {
        tripId: trip.id,
        oldState,
        nextState,
        nextLevel,
        approvalId: savedApproval.id,
        approvalStatus: savedApproval.status,
      });
    } else {
      trip.currentApprovalLevel = null;
      await this.tripRepository.save(trip);
    }

    // Send notification to employee about approval
    try {
      await this.notificationsService.notifyTripApproved(trip, user);
    } catch (error) {
      console.error('Failed to send approval notification:', error);
    }

    // Reload trip with fresh approvals data
    return this.findOne(trip.id);
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
      (a) => a.status === ApprovalStatus.Pending,
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
      await this.notificationsService.notifyTripRejected(
        trip,
        user,
        rejectTripDto.reason,
      );
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
      throw new ForbiddenException(
        'Only Deployment Team can allocate resources',
      );
    }

    // Verify vehicle and driver exist and are available
    const vehicle = await this.vehiclesService.findOne(
      allocateTripDto.vehicleId,
    );
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

    const terminalStates: TripState[] = [
      TripState.COMPLETED,
      TripState.CANCELLED,
      TripState.REJECTED,
      TripState.AUTO_REJECTED_TIMEOUT,
    ];
    if (terminalStates.includes(trip.state)) {
      throw new BadRequestException('This trip cannot be cancelled');
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

  async driverRejectAssignment(
    id: string,
    reason: string,
    user: User,
  ): Promise<TripRequest> {
    const trip = await this.findOne(id);

    if (!['READY', 'CAR_ALLOCATED'].includes(trip.state)) {
      throw new BadRequestException(
        'Trip must be in READY or CAR_ALLOCATED state to reject assignment',
      );
    }

    if (trip.allocatedDriver?.user?.id !== user.id) {
      throw new ForbiddenException(
        'Only the assigned driver can reject this assignment',
      );
    }

    // Reset allocation — send back for reassignment
    trip.allocatedDriver = null as any;
    trip.allocatedVehicle = null as any;
    trip.state = TripState.APPROVED_FOR_ALLOCATION;
    trip.rejectionReason = `Driver rejected: ${reason}`;

    return this.tripRepository.save(trip);
  }

  /** Permanently remove a draft trip (requester only). */
  async remove(id: string, user: User): Promise<void> {
    const trip = await this.findOne(id);

    if (trip.state !== TripState.DRAFT) {
      throw new BadRequestException('Only draft trips can be deleted');
    }

    if (trip.requester.id !== user.id) {
      throw new ForbiddenException('Only the requester can delete this trip');
    }

    await this.tripRepository.remove(trip);
  }

  private getRequiredRoleForState(state: TripState): UserRole {
    const mapping = {
      [TripState.PENDING_DEPARTMENT]: UserRole.DepartmentHead,
      [TripState.PENDING_COLLEGE]: UserRole.Dean, // Dean is the college head
      [TripState.PENDING_PRESIDENT]: UserRole.President,
    };

    return mapping[state];
  }

  private validateApprover(trip: TripRequest, user: User): void {
    const requiredRole = this.getRequiredRoleForState(trip.state);

    if (user.role !== requiredRole) {
      throw new ForbiddenException(
        `Only ${requiredRole} can approve at this level`,
      );
    }
  }

  private getNextStateOnApprove(currentState: TripState): TripState {
    const mapping = {
      [TripState.PENDING_DEPARTMENT]: TripState.PENDING_COLLEGE,
      [TripState.PENDING_COLLEGE]: TripState.PENDING_PRESIDENT,
      [TripState.PENDING_PRESIDENT]: TripState.APPROVED_FOR_ALLOCATION,
    };

    return mapping[currentState];
  }

  private isApprovalState(state: TripState): boolean {
    return [
      TripState.PENDING_DEPARTMENT,
      TripState.PENDING_COLLEGE,
      TripState.PENDING_PRESIDENT,
    ].includes(state);
  }

  private getApprovalLevelFromState(state: TripState): ApprovalLevel {
    const mapping = {
      [TripState.PENDING_DEPARTMENT]: ApprovalLevel.Department,
      [TripState.PENDING_COLLEGE]: ApprovalLevel.College,
      [TripState.PENDING_PRESIDENT]: ApprovalLevel.President,
    };

    return mapping[state];
  }

  private calculateDueDate(hours: number): Date {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  async confirmTransport(
    id: string,
    confirmTransportDto: ConfirmTransportDto,
    user: User,
  ): Promise<TripRequest> {
    const trip = await this.findOne(id);

    if (trip.state !== TripState.CAR_ALLOCATED) {
      throw new BadRequestException('Trip must be in CAR_ALLOCATED state');
    }

    if (user.role !== UserRole.TransportOffice) {
      throw new ForbiddenException(
        'Only Transport Office can confirm transport',
      );
    }

    if (!confirmTransportDto.fuelApproved) {
      throw new BadRequestException('Fuel must be approved to proceed');
    }

    if (confirmTransportDto.estimatedFuelCost != null) {
      trip.estimatedFuelCost = confirmTransportDto.estimatedFuelCost;
    }
    if (confirmTransportDto.estimatedDistance != null) {
      trip.estimatedDistance = confirmTransportDto.estimatedDistance;
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

  async rejectTransport(
    id: string,
    rejectTransportDto: { reason: string },
    user: User,
  ): Promise<TripRequest> {
    const trip = await this.findOne(id);

    if (trip.state !== TripState.CAR_ALLOCATED) {
      throw new BadRequestException('Trip must be in CAR_ALLOCATED state');
    }

    if (user.role !== UserRole.TransportOffice) {
      throw new ForbiddenException(
        'Only Transport Office can reject transport',
      );
    }

    // Reset allocation and move back to approved for allocation
    trip.allocatedVehicle = null;
    trip.allocatedDriver = null;
    trip.deploymentTeamMember = null;
    trip.estimatedFuelCost = null;
    trip.estimatedDistance = null;
    trip.state = TripState.APPROVED_FOR_ALLOCATION;
    trip.rejectionReason = rejectTransportDto.reason;

    const savedTrip = await this.tripRepository.save(trip);

    // Send notification
    try {
      await this.notificationsService.notifyTripRejected(
        savedTrip,
        user,
        rejectTransportDto.reason,
      );
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    return savedTrip;
  }

  async startTrip(
    id: string,
    startTripDto: any,
    user: User,
  ): Promise<TripRequest> {
    const trip = await this.findOne(id);

    if (trip.state !== TripState.READY) {
      throw new BadRequestException('Trip must be in READY state to start');
    }

    // Validate plate number matches allocated vehicle
    if (!trip.allocatedVehicle || trip.allocatedVehicle.plateNumber !== startTripDto.plateNumber) {
      throw new BadRequestException(
        'Plate number does not match allocated vehicle',
      );
    }

    if (!startTripDto.scannerValidation) {
      throw new BadRequestException(
        'Scanner validation required to start trip',
      );
    }

    // Only driver or transport office can start trip
    if (
      user.role !== UserRole.Driver &&
      user.role !== UserRole.TransportOffice
    ) {
      throw new ForbiddenException(
        'Only Driver or Transport Office can start trip',
      );
    }

    trip.state = TripState.IN_PROGRESS;

    return this.tripRepository.save(trip);
  }

  /**
   * Gate device scans the driver QR (JSON or trip UUID). Starts trip when READY and QR fields match the server record.
   * Caller must be Gate, TransportOffice, or Developer (enforced by RolesGuard on the controller).
   */
  async startTripFromGateScan(qrPayload: string): Promise<TripRequest> {
    const parsed = parseTripQrPayload(qrPayload);
    const trip = await this.findOne(parsed.tripId);

    if (trip.state !== TripState.READY) {
      throw new BadRequestException(
        `Trip is not ready to start (current state: ${trip.state})`,
      );
    }

    if (!trip.allocatedVehicle) {
      throw new BadRequestException('Trip has no allocated vehicle');
    }

    if (
      parsed.requestNumber != null &&
      parsed.requestNumber !== trip.requestNumber
    ) {
      throw new BadRequestException('QR request number does not match trip');
    }

    if (
      parsed.vehiclePlate != null &&
      parsed.vehiclePlate !== trip.allocatedVehicle.plateNumber
    ) {
      throw new BadRequestException(
        'QR vehicle plate does not match allocated vehicle',
      );
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
      throw new BadRequestException(
        'Trip must be in IN_PROGRESS state to complete',
      );
    }

    // Only driver or transport office can complete trip
    if (
      user.role !== UserRole.Driver &&
      user.role !== UserRole.TransportOffice
    ) {
      throw new ForbiddenException(
        'Only Driver or Transport Office can complete trip',
      );
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

  async getPendingApprovals(
    userId: string,
    role: UserRole,
  ): Promise<TripRequest[]> {
    let states: TripState[] = [];

    switch (role) {
      case UserRole.DepartmentHead:
        states = [TripState.PENDING_DEPARTMENT];
        break;
      case UserRole.CollegeHead:
        // CollegeHead role is not used, Dean handles college approvals
        states = [TripState.PENDING_COLLEGE];
        break;
      case UserRole.Dean:
        // Dean approves at college level (PENDING_COLLEGE)
        states = [TripState.PENDING_COLLEGE, TripState.PENDING_DEAN];
        break;
      case UserRole.President:
        states = [TripState.PENDING_PRESIDENT];
        break;
      default:
        return [];
    }

    const query = this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.requester', 'requester')
      .leftJoinAndSelect('requester.department', 'requesterDepartment')
      .leftJoinAndSelect('requester.college', 'requesterCollege')
      .leftJoinAndSelect('trip.approvals', 'approvals')
      .where('trip.state IN (:...states)', { states })
      .orderBy('trip.createdAt', 'ASC');

    // For department heads, only show trips from their department
    if (role === UserRole.DepartmentHead) {
      query
        .leftJoin('users', 'approver', 'approver.id = :userId', { userId })
        .leftJoin('approver.department', 'approverDepartment')
        .andWhere('requesterDepartment.id = approverDepartment.id');
    }

    // For college heads and deans, only show trips from their college
    if (role === UserRole.CollegeHead || role === UserRole.Dean) {
      query
        .leftJoin('users', 'approver', 'approver.id = :userId', { userId })
        .leftJoin('approver.college', 'approverCollege')
        .andWhere('requesterCollege.id = approverCollege.id');
    }

    return query.getMany();
  }

  async getStatistics() {
    const total = await this.tripRepository.count();
    const draft = await this.tripRepository.count({
      where: { state: TripState.DRAFT },
    });
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
      totalFuelCost: fuelResult?.totalFuel
        ? parseFloat(fuelResult.totalFuel)
        : 0,
      totalDistance: distanceResult?.totalDistance
        ? parseFloat(distanceResult.totalDistance)
        : 0,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
    };
  }

  async completeEarly(
    id: string,
    earlyCompleteTripDto: EarlyCompleteTripDto,
    user: User,
  ): Promise<TripRequest> {
    const trip = await this.findOne(id);

    if (trip.state !== TripState.IN_PROGRESS) {
      throw new BadRequestException(
        'Trip must be in IN_PROGRESS state to complete early',
      );
    }

    // Only Transport Office or Deployment Team can complete trips early
    if (
      user.role !== UserRole.TransportOffice &&
      user.role !== UserRole.DeploymentTeam
    ) {
      throw new ForbiddenException(
        'Only Transport Office or Deployment Team can complete trips early',
      );
    }

    // Check if trip is being completed before scheduled end time
    const now = new Date();
    const scheduledEnd = new Date(trip.endDateTime);

    if (now >= scheduledEnd) {
      throw new BadRequestException(
        'Trip cannot be completed early as scheduled end time has passed',
      );
    }

    trip.actualDistance = earlyCompleteTripDto.actualDistance;
    trip.actualFuelCost = earlyCompleteTripDto.actualFuelCost;
    trip.state = TripState.COMPLETED;
    trip.completedAt = now;

    // Update vehicle mileage
    if (trip.allocatedVehicle) {
      await this.vehiclesService.updateMileage(
        trip.allocatedVehicle.id,
        earlyCompleteTripDto.finalMileage,
      );
    }

    // Update driver statistics
    if (trip.allocatedDriver) {
      await this.driversService.incrementTripStats(
        trip.allocatedDriver.id,
        earlyCompleteTripDto.actualDistance,
      );
    }

    const savedTrip = await this.tripRepository.save(trip);

    // Send notification about early completion
    try {
      await this.notificationsService.notifyTripCompletedEarly(
        savedTrip,
        earlyCompleteTripDto.earlyCompletionReason,
      );
    } catch (error) {
      console.error('Failed to send early completion notification:', error);
    }

    return savedTrip;
  }

  async submitFeedback(
    id: string,
    createFeedbackDto: CreateFeedbackDto,
    user: User,
  ): Promise<TripFeedback> {
    const trip = await this.findOne(id);

    if (trip.state !== TripState.COMPLETED) {
      throw new BadRequestException(
        'Can only submit feedback for completed trips',
      );
    }

    // Check if feedback already exists
    const existingFeedback = await this.feedbackRepository.findOne({
      where: { tripRequest: { id } },
    });

    if (existingFeedback) {
      throw new BadRequestException(
        'Feedback has already been submitted for this trip',
      );
    }

    // Only the trip requester can submit feedback
    if (trip.requester.id !== user.id) {
      throw new ForbiddenException(
        'Only the trip requester can submit feedback',
      );
    }

    const feedback = this.feedbackRepository.create({
      tripRequest: trip,
      submittedBy: user,
      ...createFeedbackDto,
    });

    const savedFeedback = await this.feedbackRepository.save(feedback);

    // Send notification to relevant parties about feedback
    try {
      await this.notificationsService.notifyFeedbackSubmitted(
        trip,
        savedFeedback,
      );
    } catch (error) {
      console.error('Failed to send feedback notification:', error);
    }

    return savedFeedback;
  }

  async getFeedback(id: string): Promise<TripFeedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { tripRequest: { id } },
      relations: ['tripRequest', 'submittedBy'],
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found for this trip');
    }

    return feedback;
  }

  async getFeedbackStatistics(): Promise<any> {
    const feedbacks = await this.feedbackRepository.find({
      relations: ['tripRequest'],
    });

    if (feedbacks.length === 0) {
      return {
        totalFeedbacks: 0,
        averageRatings: {},
        ratingDistribution: {},
        commonIssues: [],
        recommendationRate: 0,
      };
    }

    const totalFeedbacks = feedbacks.length;

    // Calculate average ratings
    const averageRatings = {
      overall: this.calculateAverageRating(feedbacks, 'overallRating'),
      driver: this.calculateAverageRating(feedbacks, 'driverRating'),
      vehicle: this.calculateAverageRating(feedbacks, 'vehicleRating'),
      punctuality: this.calculateAverageRating(feedbacks, 'punctualityRating'),
    };

    // Calculate rating distribution
    const ratingDistribution = this.calculateRatingDistribution(feedbacks);

    // Get common issues
    const allIssues = feedbacks
      .filter((f) => f.issues && f.issues.length > 0)
      .flatMap((f) => f.issues);

    const issueCount = allIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {});

    const commonIssues = Object.entries(issueCount)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([issue, count]) => ({ issue, count }));

    // Calculate recommendation rate
    const recommendCount = feedbacks.filter((f) => f.wouldRecommend).length;
    const recommendationRate = (recommendCount / totalFeedbacks) * 100;

    return {
      totalFeedbacks,
      averageRatings,
      ratingDistribution,
      commonIssues,
      recommendationRate,
    };
  }

  private calculateAverageRating(
    feedbacks: TripFeedback[],
    field: string,
  ): number {
    const validRatings = feedbacks
      .map((f) => f[field])
      .filter((rating) => rating !== null && rating !== undefined);

    if (validRatings.length === 0) return 0;

    const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
    return Math.round((sum / validRatings.length) * 100) / 100;
  }

  private calculateRatingDistribution(feedbacks: TripFeedback[]): any {
    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    feedbacks.forEach((feedback) => {
      if (feedback.overallRating) {
        distribution[feedback.overallRating]++;
      }
    });

    return distribution;
  }
}
