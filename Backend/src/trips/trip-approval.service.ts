/**
 * TripApprovalService — handles the approval workflow only.
 * Separated from TripsService to follow Single Responsibility Principle.
 */
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TripRequest,
  TripState,
} from './entities/trip-request.entity';
import {
  Approval,
  ApprovalLevel,
  ApprovalStatus,
} from './entities/approval.entity';
import { ApproveTripDto } from './dto/approve-trip.dto';
import { RejectTripDto } from './dto/reject-trip.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { WorkflowService } from '../workflow/workflow.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntity } from '../audit/entities/audit-log.entity';

@Injectable()
export class TripApprovalService {
  constructor(
    @InjectRepository(TripRequest)
    private readonly tripRepository: Repository<TripRequest>,
    @InjectRepository(Approval)
    private readonly approvalRepository: Repository<Approval>,
    private readonly notificationsService: NotificationsService,
    private readonly workflowService: WorkflowService,
    private readonly auditService: AuditService,
  ) {}

  /** Validate that the user can approve at the current trip state */
  async validateApprover(trip: TripRequest, user: User): Promise<void> {
    const stateRoleMap: Partial<Record<TripState, UserRole[]>> = {
      [TripState.PENDING_DEPARTMENT]: [UserRole.DepartmentHead, UserRole.Developer, UserRole.SystemAdmin],
      [TripState.PENDING_COLLEGE]: [UserRole.Dean, UserRole.CollegeHead, UserRole.Developer, UserRole.SystemAdmin],
      [TripState.PENDING_PRESIDENT]: [UserRole.President, UserRole.Developer, UserRole.SystemAdmin],
      [TripState.CAR_ALLOCATED]: [UserRole.TransportOffice, UserRole.Developer, UserRole.SystemAdmin],
    };

    const allowedRoles = stateRoleMap[trip.state];
    if (!allowedRoles) {
      throw new BadRequestException(`Trip cannot be approved in state: ${trip.state}`);
    }
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Role ${user.role} cannot approve at state ${trip.state}. Required: ${allowedRoles.join(', ')}`,
      );
    }
  }

  getNextStateOnApprove(currentState: TripState): TripState {
    const transitions: Partial<Record<TripState, TripState>> = {
      [TripState.PENDING_DEPARTMENT]: TripState.PENDING_COLLEGE,
      [TripState.PENDING_COLLEGE]: TripState.PENDING_PRESIDENT,
      [TripState.PENDING_PRESIDENT]: TripState.APPROVED_FOR_ALLOCATION,
      [TripState.CAR_ALLOCATED]: TripState.PENDING_TRANSPORT_CONFIRM,
    };
    const next = transitions[currentState];
    if (!next) throw new BadRequestException(`No approval transition from state: ${currentState}`);
    return next;
  }

  isApprovalState(state: TripState): boolean {
    return [
      TripState.PENDING_DEPARTMENT,
      TripState.PENDING_COLLEGE,
      TripState.PENDING_PRESIDENT,
    ].includes(state);
  }

  getApprovalLevelFromState(state: TripState): ApprovalLevel {
    const map: Partial<Record<TripState, ApprovalLevel>> = {
      [TripState.PENDING_DEPARTMENT]: ApprovalLevel.Department,
      [TripState.PENDING_COLLEGE]: ApprovalLevel.College,
      [TripState.PENDING_PRESIDENT]: ApprovalLevel.President,
    };
    return map[state] ?? ApprovalLevel.Department;
  }

  calculateDueDate(hoursFromNow: number): Date {
    const due = new Date();
    due.setHours(due.getHours() + hoursFromNow);
    return due;
  }
}
