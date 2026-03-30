import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { WorkflowConfiguration } from './entities/workflow-config.entity';
import {
  TripRequest,
  TripType,
  TripState,
} from '../trips/entities/trip-request.entity';
import { Approval, ApprovalStatus } from '../trips/entities/approval.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    @InjectRepository(WorkflowConfiguration)
    private readonly workflowConfigRepo: Repository<WorkflowConfiguration>,
    @InjectRepository(TripRequest)
    private readonly tripRepository: Repository<TripRequest>,
    @InjectRepository(Approval)
    private readonly approvalRepository: Repository<Approval>,
    @InjectQueue('workflow')
    private readonly workflowQueue: Queue,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getActiveWorkflow(
    tripType: TripType,
  ): Promise<WorkflowConfiguration | null> {
    return this.workflowConfigRepo.findOne({
      where: { tripType, isActive: true },
    });
  }

  async initializeWorkflow(trip: TripRequest): Promise<void> {
    const workflow = await this.getActiveWorkflow(trip.tripType);

    if (!workflow) {
      this.logger.warn(
        `No active workflow found for trip type: ${trip.tripType}`,
      );
      return;
    }

    const firstStep = workflow.steps.find((s) => s.order === 1);
    if (!firstStep) {
      this.logger.error('Workflow has no steps defined');
      return;
    }

    // Schedule timeout check
    await this.scheduleTimeoutCheck(trip.id, firstStep.timeoutHours);

    // Schedule warning (24 hours before timeout if timeout > 24 hours)
    if (firstStep.timeoutHours > 24) {
      await this.scheduleTimeoutWarning(trip.id, firstStep.timeoutHours - 24);
    }

    this.logger.log(`Workflow initialized for trip ${trip.id}`);
  }

  async scheduleTimeoutCheck(
    tripId: string,
    timeoutHours: number,
  ): Promise<void> {
    const delayMs = timeoutHours * 60 * 60 * 1000;

    await this.workflowQueue.add(
      'check-timeout',
      { tripId },
      {
        delay: delayMs,
        jobId: `timeout-${tripId}-${Date.now()}`,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(
      `Scheduled timeout check for trip ${tripId} in ${timeoutHours} hours`,
    );
  }

  async scheduleTimeoutWarning(
    tripId: string,
    delayHours: number,
  ): Promise<void> {
    const delayMs = delayHours * 60 * 60 * 1000;

    await this.workflowQueue.add(
      'timeout-warning',
      { tripId },
      {
        delay: delayMs,
        jobId: `warning-${tripId}-${Date.now()}`,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(
      `Scheduled timeout warning for trip ${tripId} in ${delayHours} hours`,
    );
  }

  async handleTimeout(tripId: string): Promise<void> {
    const trip = await this.tripRepository.findOne({
      where: { id: tripId },
      relations: ['approvals', 'requester'],
    });

    if (!trip) {
      this.logger.warn(`Trip ${tripId} not found for timeout handling`);
      return;
    }

    // Check if trip is still in a pending approval state
    const pendingStates = [
      TripState.PENDING_DEPARTMENT,
      TripState.PENDING_COLLEGE,
      TripState.PENDING_DEAN,
    ];

    if (!pendingStates.includes(trip.state)) {
      this.logger.log(`Trip ${tripId} is no longer pending, skipping timeout`);
      return;
    }

    // Find the pending approval
    const pendingApproval = trip.approvals.find(
      (a) => a.status === ApprovalStatus.Pending,
    );

    if (!pendingApproval) {
      this.logger.log(`No pending approval found for trip ${tripId}`);
      return;
    }

    // Check if approval is actually overdue
    const now = new Date();
    if (pendingApproval.dueDate > now) {
      this.logger.log(`Approval for trip ${tripId} is not yet overdue`);
      return;
    }

    // Mark approval as auto-rejected
    pendingApproval.status = ApprovalStatus.AutoRejectedTimeout;
    await this.approvalRepository.save(pendingApproval);

    // Update trip state
    trip.state = TripState.AUTO_REJECTED_TIMEOUT;
    trip.rejectionReason = `Approval timeout exceeded at ${trip.currentApprovalLevel} level`;
    trip.rejectedAt = now;
    await this.tripRepository.save(trip);

    // Send notifications
    try {
      await this.notificationsService.create(
        trip.requester,
        NotificationType.TripAutoRejected,
        'Trip Request Auto-Rejected',
        `Your trip request ${trip.requestNumber} was automatically rejected due to approval timeout at ${trip.currentApprovalLevel} level.`,
        { tripId: trip.id, requestNumber: trip.requestNumber },
      );
    } catch (error) {
      this.logger.error(
        `Failed to send timeout notification: ${error.message}`,
      );
    }

    this.logger.log(`Trip ${tripId} auto-rejected due to timeout`);
  }

  async handleTimeoutWarning(tripId: string): Promise<void> {
    const trip = await this.tripRepository.findOne({
      where: { id: tripId },
      relations: ['approvals', 'requester'],
    });

    if (!trip) {
      return;
    }

    // Check if still pending
    const pendingStates = [
      TripState.PENDING_DEPARTMENT,
      TripState.PENDING_COLLEGE,
      TripState.PENDING_DEAN,
    ];

    if (!pendingStates.includes(trip.state)) {
      return;
    }

    const pendingApproval = trip.approvals.find(
      (a) => a.status === ApprovalStatus.Pending,
    );

    if (!pendingApproval) {
      return;
    }

    // Send warning notification
    try {
      await this.notificationsService.create(
        trip.requester,
        NotificationType.ApprovalReminder,
        'Approval Timeout Warning',
        `Your trip request ${trip.requestNumber} will be auto-rejected in 24 hours if not approved at ${trip.currentApprovalLevel} level.`,
        { tripId: trip.id, requestNumber: trip.requestNumber },
      );
    } catch (error) {
      this.logger.error(
        `Failed to send warning notification: ${error.message}`,
      );
    }

    this.logger.log(`Sent timeout warning for trip ${tripId}`);
  }

  async cancelScheduledJobs(tripId: string): Promise<void> {
    // Get all jobs for this trip
    const jobs = await this.workflowQueue.getJobs(['delayed', 'waiting']);

    for (const job of jobs) {
      if (job.data.tripId === tripId) {
        await job.remove();
        this.logger.log(`Cancelled job ${job.id} for trip ${tripId}`);
      }
    }
  }

  async rescheduleOnApproval(trip: TripRequest): Promise<void> {
    // Cancel existing jobs
    await this.cancelScheduledJobs(trip.id);

    // If moving to next approval level, schedule new timeout
    const pendingStates = [
      TripState.PENDING_DEPARTMENT,
      TripState.PENDING_COLLEGE,
      TripState.PENDING_DEAN,
    ];

    if (pendingStates.includes(trip.state)) {
      const workflow = await this.getActiveWorkflow(trip.tripType);
      if (workflow) {
        const currentStep = workflow.steps.find((s) => s.state === trip.state);
        if (currentStep) {
          await this.scheduleTimeoutCheck(trip.id, currentStep.timeoutHours);

          if (currentStep.timeoutHours > 24) {
            await this.scheduleTimeoutWarning(
              trip.id,
              currentStep.timeoutHours - 24,
            );
          }
        }
      }
    }
  }

  // Seed default workflows
  async seedDefaultWorkflows(): Promise<void> {
    const normalWorkflow = await this.workflowConfigRepo.findOne({
      where: { tripType: TripType.Normal, isActive: true },
    });

    if (!normalWorkflow) {
      const workflow = this.workflowConfigRepo.create({
        name: 'Normal Trip Approval Workflow',
        tripType: TripType.Normal,
        isActive: true,
        steps: [
          {
            name: 'Department Approval',
            order: 1,
            role: 'DepartmentHead',
            state: 'PENDING_DEPARTMENT',
            timeoutHours: 48,
            nextStateOnApprove: 'PENDING_COLLEGE',
            nextStateOnReject: 'REJECTED',
            nextStateOnTimeout: 'AUTO_REJECTED_TIMEOUT',
            actions: [
              {
                type: 'notification',
                trigger: 'onEnter',
                config: { template: 'trip_pending_approval' },
              },
            ],
          },
          {
            name: 'College Approval',
            order: 2,
            role: 'CollegeHead',
            state: 'PENDING_COLLEGE',
            timeoutHours: 48,
            nextStateOnApprove: 'PENDING_DEAN',
            nextStateOnReject: 'REJECTED',
            nextStateOnTimeout: 'AUTO_REJECTED_TIMEOUT',
            actions: [
              {
                type: 'notification',
                trigger: 'onEnter',
                config: { template: 'trip_pending_approval' },
              },
            ],
          },
          {
            name: 'Dean Approval',
            order: 3,
            role: 'Dean',
            state: 'PENDING_DEAN',
            timeoutHours: 48,
            nextStateOnApprove: 'APPROVED_FOR_ALLOCATION',
            nextStateOnReject: 'REJECTED',
            nextStateOnTimeout: 'AUTO_REJECTED_TIMEOUT',
            actions: [
              {
                type: 'notification',
                trigger: 'onEnter',
                config: { template: 'trip_pending_approval' },
              },
            ],
          },
        ],
      });

      await this.workflowConfigRepo.save(workflow);
      this.logger.log('Seeded Normal workflow');
    }

    const vipWorkflow = await this.workflowConfigRepo.findOne({
      where: { tripType: TripType.VIP, isActive: true },
    });

    if (!vipWorkflow) {
      const workflow = this.workflowConfigRepo.create({
        name: 'VIP Trip Approval Workflow',
        tripType: TripType.VIP,
        isActive: true,
        steps: [
          {
            name: 'Dean Approval',
            order: 1,
            role: 'Dean',
            state: 'PENDING_DEAN',
            timeoutHours: 48,
            nextStateOnApprove: 'APPROVED_FOR_ALLOCATION',
            nextStateOnReject: 'REJECTED',
            nextStateOnTimeout: 'AUTO_REJECTED_TIMEOUT',
            actions: [
              {
                type: 'notification',
                trigger: 'onEnter',
                config: { template: 'vip_trip_pending_approval' },
              },
            ],
          },
        ],
      });

      await this.workflowConfigRepo.save(workflow);
      this.logger.log('Seeded VIP workflow');
    }
  }
}
