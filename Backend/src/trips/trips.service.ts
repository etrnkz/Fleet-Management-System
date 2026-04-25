import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  TripRequest,
  TripState,
  TripType,
  TripCategory,
  TRIP_STATES_HOLDING_ALLOCATION,
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
import { VehicleStatus } from '../vehicles/entities/vehicle.entity';
import { DriversService } from '../drivers/drivers.service';
import { DriverStatus } from '../drivers/entities/driver.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { WorkflowService } from '../workflow/workflow.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntity } from '../audit/entities/audit-log.entity';
import { FuelService } from '../fuel/fuel.service';
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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly vehiclesService: VehiclesService,
    private readonly driversService: DriversService,
    private readonly notificationsService: NotificationsService,
    private readonly workflowService: WorkflowService,
    private readonly auditService: AuditService,
    private readonly fuelService: FuelService,
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
    const requestNumber = `TR-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    const trip = this.tripRepository.create({
      ...createTripDto,
      requestNumber,
      requester: user,
      startDateTime: startDate,
      endDateTime: endDate,
      state: TripState.DRAFT,
    });

    const savedTrip = await this.tripRepository.save(trip);

    // Audit log
    try {
      await this.auditService.log(
        user,
        AuditAction.CREATE,
        AuditEntity.Trip,
        savedTrip.id,
        null,
        { requestNumber: savedTrip.requestNumber, state: savedTrip.state },
        undefined,
        undefined,
        `Trip created: ${savedTrip.requestNumber}`,
      );
    } catch (e) { /* non-blocking */ }

    return savedTrip;
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

    if (role === UserRole.User) {
      // Regular users only see their own trips
      query.where('requester.id = :userId', { userId });
    } else if (role === UserRole.DepartmentHead) {
      // Department heads see only trips from their own department
      const approver = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['department'],
      });
      if (!approver?.department?.id) return [];
      query.where('requesterDepartment.id = :deptId', {
        deptId: approver.department.id,
      });
    } else if (role === UserRole.Dean || role === UserRole.CollegeHead) {
      // Deans see only trips from their own college
      const approver = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['college'],
      });
      if (!approver?.college?.id) return [];
      query.where('requesterCollege.id = :collegeId', {
        collegeId: approver.college.id,
      });
    }
    // President, DeploymentTeam, TransportOffice, SystemAdmin see all trips

    return query.getMany();
  }

  async findOne(id: string, viewer?: Pick<User, 'id' | 'role'>): Promise<TripRequest> {
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

    if (viewer?.role === UserRole.User && trip.requester.id !== viewer.id) {
      throw new ForbiddenException('You can only view your own trip requests');
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

    // Check that at least one active vehicle exists in the fleet
    const availableVehicles = await this.vehiclesService.findAvailable();
    if (availableVehicles.length === 0) {
      throw new BadRequestException(
        'No vehicles are currently available in the fleet. Please contact the transport office.',
      );
    }

    // Load requester with department and college relations
    const requester = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['department', 'department.college', 'college'],
    });

    // Determine initial state based on trip category AND requester's role.
    // Higher-ranking requesters skip approval levels at or below their own rank.
    let initialState: TripState;
    let approvalLevel: ApprovalLevel | null;

    const requesterRole = user.role;

    if (trip.tripCategory === TripCategory.VIP || trip.tripCategory === TripCategory.SERVICE) {
      // VIP and SERVICE always go directly to President
      initialState = TripState.PENDING_PRESIDENT;
      approvalLevel = ApprovalLevel.President;
    } else if (trip.tripType === TripType.VIP) {
      // Legacy VIP type goes directly to College (Dean)
      initialState = TripState.PENDING_COLLEGE;
      approvalLevel = ApprovalLevel.College;
    } else if (
      requesterRole === UserRole.President ||
      requesterRole === UserRole.Dean
    ) {
      // President and Dean skip all approval levels — go straight to allocation
      initialState = TripState.APPROVED_FOR_ALLOCATION;
      approvalLevel = undefined as any;
    } else if (
      requesterRole === UserRole.CollegeHead ||
      requesterRole === UserRole.DepartmentHead
    ) {
      // Department/College heads skip department approval — go straight to President
      initialState = TripState.PENDING_PRESIDENT;
      approvalLevel = ApprovalLevel.President;
    } else {
      // Regular employees — must have department AND college set for routing to work
      const dept = requester?.department;
      const college = requester?.college || dept?.college;
      if (!dept) {
        throw new BadRequestException(
          'Your profile does not have a department assigned. Please update your profile with your department before submitting a standard trip request.',
        );
      }
      if (!college) {
        throw new BadRequestException(
          'Your department does not have a college assigned. Please contact your system administrator.',
        );
      }
      // Ensure trip requester has college set for approval routing
      if (!requester.college && dept.college) {
        await this.userRepository.update(user.id, { college: dept.college });
      }
      initialState = TripState.PENDING_DEPARTMENT;
      approvalLevel = ApprovalLevel.Department;
    }

    trip.state = initialState;
    trip.currentApprovalLevel = approvalLevel;

    // Wrap trip save + approval creation in a transaction
    const savedTrip = await this.tripRepository.manager.transaction(async (manager) => {
      const saved = await manager.save(TripRequest, trip);

      if (approvalLevel) {
        const approval = manager.create(Approval, {
          tripRequest: saved,
          approvalLevel,
          status: ApprovalStatus.Pending,
          dueDate: this.calculateDueDate(48),
        });
        await manager.save(Approval, approval);
      }

      return saved;
    });

    // Audit log
    try {
      await this.auditService.log(
        user,
        AuditAction.SUBMIT,
        AuditEntity.Trip,
        savedTrip.id,
        { state: TripState.DRAFT },
        { state: savedTrip.state },
        undefined,
        undefined,
        `Trip submitted: ${savedTrip.requestNumber}`,
      );
    } catch (e) { /* non-blocking */ }

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
    await this.validateApprover(trip, user);

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

    // Reschedule timeout for next approval level
    try {
      await this.workflowService.rescheduleOnApproval(trip);
    } catch (error) {
      console.error('Failed to reschedule workflow:', error);
    }

    // Audit log
    try {
      await this.auditService.log(
        user,
        AuditAction.APPROVE,
        AuditEntity.Trip,
        trip.id,
        null,
        { state: trip.state },
        undefined,
        undefined,
        `Trip approved: ${trip.requestNumber}`,
      );
    } catch (e) { /* non-blocking */ }

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
    await this.validateApprover(trip, user);

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

    const savedTrip = await this.tripRepository.save(trip);

    // Audit log
    try {
      await this.auditService.log(
        user,
        AuditAction.REJECT,
        AuditEntity.Trip,
        savedTrip.id,
        null,
        { state: TripState.REJECTED, reason: rejectTripDto.reason },
        undefined,
        undefined,
        `Trip rejected: ${savedTrip.requestNumber}`,
      );
    } catch (e) { /* non-blocking */ }

    return savedTrip;
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

    let vehicleId = allocateTripDto.vehicleId;
    let driverId = allocateTripDto.driverId;

    // Auto-suggest pre-assigned driver+vehicle if not explicitly provided
    if (!vehicleId || !driverId) {
      const suggested = await this.getSuggestedAllocation();
      if (!vehicleId && suggested.vehicle) vehicleId = suggested.vehicle.id;
      if (!driverId && suggested.driver) driverId = suggested.driver.id;
    }

    if (!vehicleId) throw new BadRequestException('No vehicle specified and no pre-assigned vehicle available');
    if (!driverId) throw new BadRequestException('No driver specified and no pre-assigned driver available');

    // Verify vehicle and driver exist
    const vehicle = await this.vehiclesService.findOne(vehicleId);
    const driver = await this.driversService.findOne(driverId);

    // Block allocation if vehicle is under maintenance
    if (vehicle.status === VehicleStatus.Maintenance) {
      throw new BadRequestException('Cannot allocate a vehicle that is under maintenance');
    }

    // Check driver not already on an active trip
    const driverInUse = await this.tripRepository.count({
      where: {
        allocatedDriver: { id: driverId },
        state: In(TRIP_STATES_HOLDING_ALLOCATION),
      },
    });
    if (driverInUse > 0) {
      throw new BadRequestException('This driver is already assigned to an active trip');
    }

    // Check vehicle not already on an active trip
    const vehicleInUse = await this.tripRepository.count({
      where: {
        allocatedVehicle: { id: vehicleId },
        state: In(TRIP_STATES_HOLDING_ALLOCATION),
      },
    });
    if (vehicleInUse > 0) {
      throw new BadRequestException('This vehicle is already assigned to an active trip');
    }

    trip.allocatedVehicle = vehicle;
    trip.allocatedDriver = driver;
    trip.deploymentTeamMember = user;
    trip.estimatedFuelCost = allocateTripDto.estimatedFuelCost;
    trip.estimatedDistance = allocateTripDto.estimatedDistance;
    trip.state = TripState.CAR_ALLOCATED;

    const savedTrip = await this.tripRepository.save(trip);

    // Set driver status to OnTrip
    try {
      await this.driversService.updateStatus(driver.id, DriverStatus.OnTrip);
    } catch (error) {
      console.error('Failed to update driver status:', error);
    }

    // Send notification
    try {
      await this.notificationsService.notifyTripAllocated(savedTrip);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    // Audit log
    try {
      await this.auditService.log(
        user,
        AuditAction.ALLOCATE,
        AuditEntity.Trip,
        savedTrip.id,
        null,
        { state: TripState.CAR_ALLOCATED, vehicleId, driverId },
        undefined,
        undefined,
        `Trip allocated: ${savedTrip.requestNumber}`,
      );
    } catch (e) { /* non-blocking */ }

    return savedTrip;
  }

  /**
   * Returns the first available pre-assigned driver+vehicle pair.
   * Used to auto-populate allocation when no explicit IDs are provided.
   */
  async getSuggestedAllocation(): Promise<{ driver: any | null; vehicle: any | null }> {
    // Find a driver who has a pre-assigned vehicle, is Available, and not on an active trip
    const busyDriverIds = await this.tripRepository
      .createQueryBuilder('trip')
      .select('driver.id', 'driverId')
      .innerJoin('trip.allocatedDriver', 'driver')
      .where('trip.state IN (:...states)', { states: TRIP_STATES_HOLDING_ALLOCATION })
      .getRawMany()
      .then((rows) => rows.map((r) => r.driverId).filter(Boolean));

    const query = this.driversService['driverRepository']
      .createQueryBuilder('driver')
      .leftJoinAndSelect('driver.assignedVehicle', 'vehicle')
      .leftJoinAndSelect('driver.user', 'user')
      .where('vehicle.id IS NOT NULL')
      .andWhere('driver.status = :status', { status: DriverStatus.Available });

    if (busyDriverIds.length > 0) {
      query.andWhere('driver.id NOT IN (:...busyIds)', { busyIds: busyDriverIds });
    }

    const driver = await query.getOne();

    return {
      driver: driver ?? null,
      vehicle: driver?.assignedVehicle ?? null,
    };
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

    if (trip.state === TripState.IN_PROGRESS) {
      throw new BadRequestException('Trips in progress cannot be cancelled');
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
    const prevDriver = trip.allocatedDriver;
    trip.allocatedDriver = null as any;
    trip.allocatedVehicle = null as any;
    trip.state = TripState.APPROVED_FOR_ALLOCATION;
    // Reset driver status
    if (prevDriver) {
      await this.driversService.updateStatus(prevDriver.id, 'Available' as any).catch(() => {});
    }
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

  private async validateApprover(trip: TripRequest, user: User): Promise<void> {
    const requiredRole = this.getRequiredRoleForState(trip.state);

    if (user.role !== requiredRole) {
      throw new ForbiddenException(
        `Only ${requiredRole} can approve at this level`,
      );
    }

    // Load the approver's full profile with relations (JWT payload only has id/email/role)
    const approver = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['department', 'college'],
    });

    if (!approver) {
      throw new ForbiddenException('Approver account not found');
    }

    // For college-level approval, enforce same-college check
    if (trip.state === TripState.PENDING_COLLEGE) {
      const requesterCollegeId = trip.requester?.college?.id;
      const approverCollegeId = approver.college?.id;
      if (!requesterCollegeId || !approverCollegeId) {
        throw new ForbiddenException(
          'College information is missing — cannot verify approval authority',
        );
      }
      if (requesterCollegeId !== approverCollegeId) {
        throw new ForbiddenException('You can only approve trips from your own college');
      }
    }

    // For department-level approval, enforce same-department check
    if (trip.state === TripState.PENDING_DEPARTMENT) {
      const requesterDeptId = trip.requester?.department?.id;
      const approverDeptId = approver.department?.id;
      if (!requesterDeptId || !approverDeptId) {
        throw new ForbiddenException(
          'Department information is missing — cannot verify approval authority',
        );
      }
      if (requesterDeptId !== approverDeptId) {
        throw new ForbiddenException('You can only approve trips from your own department');
      }
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
    const prevDriverOnReject = trip.allocatedDriver;
    trip.allocatedVehicle = null as any;
    trip.allocatedDriver = null as any;
    trip.deploymentTeamMember = null as any;
    trip.estimatedFuelCost = null as any;
    // Reset driver status
    if (prevDriverOnReject) {
      await this.driversService.updateStatus(prevDriverOnReject.id, 'Available' as any).catch(() => {});
    }
    trip.estimatedDistance = null as any;
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

    if (!trip.allocatedVehicle || trip.allocatedVehicle.plateNumber !== startTripDto.plateNumber) {
      throw new BadRequestException(
        'Plate number does not match allocated vehicle',
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
   * Gate device scans the driver QR (JSON or trip UUID).
   * - If trip is READY → starts the trip (IN_PROGRESS)
   * - If trip is PENDING_RETURN → vehicle returned, fully completes the trip (COMPLETED)
   * Caller must be Gate, TransportOffice, or Developer (enforced by RolesGuard on the controller).
   */
  async startTripFromGateScan(qrPayload: string): Promise<TripRequest> {
    const parsed = parseTripQrPayload(qrPayload);
    const trip = await this.findOne(parsed.tripId);

    if (trip.state !== TripState.READY && trip.state !== TripState.PENDING_RETURN) {
      throw new BadRequestException(
        `Trip cannot be scanned at gate (current state: ${trip.state}). Expected READY or PENDING_RETURN.`,
      );
    }

    if (!trip.allocatedVehicle) {
      throw new BadRequestException('Trip has no allocated vehicle');
    }

    if (parsed.requestNumber != null && parsed.requestNumber !== trip.requestNumber) {
      throw new BadRequestException('QR request number does not match trip');
    }

    if (parsed.vehiclePlate != null && parsed.vehiclePlate !== trip.allocatedVehicle.plateNumber) {
      throw new BadRequestException('QR vehicle plate does not match allocated vehicle');
    }

    // READY → start the trip
    if (trip.state === TripState.READY) {
      trip.state = TripState.IN_PROGRESS;
      return this.tripRepository.save(trip);
    }

    // PENDING_RETURN → vehicle returned, fully complete the trip
    trip.state = TripState.COMPLETED;

    const savedTrip = await this.tripRepository.save(trip);

    // Now release driver and vehicle
    if (trip.allocatedDriver) {
      await this.driversService.updateStatus(trip.allocatedDriver.id, DriverStatus.Available).catch(() => {});
    }

    // Send full completion notifications
    try {
      await this.notificationsService.notifyTripCompleted(savedTrip);
    } catch (error) {
      console.error('Failed to send completion notification:', error);
    }

    // Audit log
    try {
      await this.auditService.log(
        { id: 'gate', role: UserRole.Gate } as any,
        AuditAction.COMPLETE,
        AuditEntity.Trip,
        savedTrip.id,
        null,
        { state: TripState.COMPLETED },
        undefined,
        undefined,
        `Trip fully completed via gate return scan: ${savedTrip.requestNumber}`,
      );
    } catch (e) { /* non-blocking */ }

    return savedTrip;
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

    // Allow driver, transport office, or the trip requester to complete trip
    const isRequester = trip.requester && trip.requester.id === user.id;
    if (
      user.role !== UserRole.Driver &&
      user.role !== UserRole.TransportOffice &&
      !isRequester
    ) {
      throw new ForbiddenException(
        'Only Driver, Transport Office, or the trip requester can complete trip',
      );
    }

    trip.actualDistance = completeTripDto.actualDistance;
    trip.actualFuelCost = completeTripDto.actualFuelCost;
    // Employee/driver marks trip as PENDING_RETURN — gate must scan on return to fully complete
    trip.state = TripState.PENDING_RETURN;
    trip.completedAt = new Date();

    // Update vehicle mileage
    if (trip.allocatedVehicle && completeTripDto.finalMileage != null) {
      await this.vehiclesService.updateMileage(
        trip.allocatedVehicle.id,
        completeTripDto.finalMileage,
      );
    }

    // Create fuel consumption record
    if (trip.allocatedVehicle && completeTripDto.actualFuelCost && completeTripDto.actualDistance) {
      try {
        // Calculate fuel quantity from cost
        const PETROL_PRICE = 132.18; // Birr per liter
        const DIESEL_PRICE = 139.84; // Birr per liter
        const fuelPricePerLiter = trip.allocatedVehicle.fuelType === 'Diesel' ? DIESEL_PRICE : PETROL_PRICE;
        const fuelQuantity = completeTripDto.actualFuelCost / fuelPricePerLiter;

        await this.fuelService.create(
          {
            vehicleId: trip.allocatedVehicle.id,
            tripId: trip.id,
            type: 'TripConsumption' as any,
            quantity: fuelQuantity,
            pricePerLiter: fuelPricePerLiter,
            mileageAtRefuel: completeTripDto.finalMileage,
            notes: `Trip ${trip.requestNumber} - ${trip.destination}`,
          },
          user.id,
        );
      } catch (error) {
        console.error('Failed to create fuel record:', error);
        // Non-blocking - trip completion should still succeed
      }
    }

    // Update driver statistics
    if (trip.allocatedDriver) {
      await this.driversService.incrementTripStats(
        trip.allocatedDriver.id,
        completeTripDto.actualDistance,
      );
      // Driver stays OnTrip until gate confirms return — do NOT reset yet
    }

    const savedTrip = await this.tripRepository.save(trip);

    // Notify requester that trip is pending return scan
    try {
      await this.notificationsService.create(
        trip.requester,
        'TripCompleted' as any,
        'Trip Marked Complete — Awaiting Gate Return Scan',
        `Your trip ${trip.requestNumber} has been marked complete. The vehicle must be scanned at the gate on return to finalize.`,
        { tripId: trip.id, requestNumber: trip.requestNumber },
      );
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    // Audit log
    try {
      await this.auditService.log(
        user,
        AuditAction.COMPLETE,
        AuditEntity.Trip,
        savedTrip.id,
        null,
        { state: TripState.PENDING_RETURN, actualDistance: completeTripDto.actualDistance },
        undefined,
        undefined,
        `Trip marked complete by ${user.role}, pending gate return scan: ${savedTrip.requestNumber}`,
      );
    } catch (e) { /* non-blocking */ }

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
        states = [TripState.PENDING_COLLEGE];
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

  /**
   * Allows the trip requester (employee) to mark their own IN_PROGRESS trip as completed
   * when it finishes before the scheduled end time. No distance/fuel required — transport
   * office can update those later. Only the requester of the trip can call this.
   */
  async requesterCompleteTrip(
    id: string,
    reason: string | undefined,
    user: User,
  ): Promise<TripRequest> {
    const trip = await this.findOne(id);

    if (trip.state !== TripState.IN_PROGRESS) {
      throw new BadRequestException('Trip must be IN_PROGRESS to complete');
    }

    if (trip.requester.id !== user.id) {
      throw new ForbiddenException('Only the trip requester can complete their own trip');
    }

    const now = new Date();
    const scheduledEnd = new Date(trip.endDateTime);

    if (now >= scheduledEnd) {
      throw new BadRequestException(
        'Trip scheduled end time has already passed — contact Transport Office to complete it',
      );
    }

    trip.state = TripState.COMPLETED;
    trip.completedAt = now;

    // Update driver statistics (distance unknown at this point — set to 0 as placeholder)
    if (trip.allocatedDriver) {
      await this.driversService.incrementTripStats(trip.allocatedDriver.id, 0).catch(() => {});
      await this.driversService.updateStatus(trip.allocatedDriver.id, DriverStatus.Available).catch(() => {});
    }

    const savedTrip = await this.tripRepository.save(trip);

    try {
      await this.notificationsService.notifyTripCompletedEarly(savedTrip, reason);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    try {
      await this.auditService.log(
        user,
        AuditAction.COMPLETE,
        AuditEntity.Trip,
        savedTrip.id,
        null,
        { state: TripState.COMPLETED, completedBy: 'requester', reason },
        undefined,
        undefined,
        `Trip completed early by requester: ${savedTrip.requestNumber}`,
      );
    } catch (e) { /* non-blocking */ }

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
