# Workflow Engine Design

## Overview

The workflow engine is a configurable, event-driven system that manages trip request approval flows with automatic timeout handling, state transitions, and notifications.

## Core Concepts

### 1. State Machine

The trip request lifecycle is modeled as a finite state machine with explicit states and transitions.

```typescript
enum TripState {
  // Initial states
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  
  // Approval states
  PENDING_DEPARTMENT = 'PENDING_DEPARTMENT',
  PENDING_COLLEGE = 'PENDING_COLLEGE',
  PENDING_DEAN = 'PENDING_DEAN',
  
  // Rejection states
  REJECTED = 'REJECTED',
  AUTO_REJECTED_TIMEOUT = 'AUTO_REJECTED_TIMEOUT',
  
  // Allocation states
  APPROVED_FOR_ALLOCATION = 'APPROVED_FOR_ALLOCATION',
  CAR_ALLOCATED = 'CAR_ALLOCATED',
  PENDING_TRANSPORT_CONFIRM = 'PENDING_TRANSPORT_CONFIRM',
  
  // Execution states
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
```

### 2. Workflow Configuration

Workflows are defined in JSON format and stored in the database, allowing runtime configuration without code changes.

```typescript
interface WorkflowConfiguration {
  id: string;
  name: string;
  tripType: TripType; // Normal or VIP
  isActive: boolean;
  steps: WorkflowStep[];
}

interface WorkflowStep {
  name: string;
  order: number;
  role: UserRole;
  state: TripState;
  timeoutHours: number;
  nextStateOnApprove: TripState;
  nextStateOnReject: TripState;
  nextStateOnTimeout: TripState;
  actions: WorkflowAction[];
  conditions?: WorkflowCondition[];
}

interface WorkflowAction {
  type: 'notification' | 'email' | 'webhook' | 'state_change';
  trigger: 'onEnter' | 'onApprove' | 'onReject' | 'onTimeout' | 'onWarning';
  config: {
    template?: string;
    recipients?: string[];
    url?: string;
    [key: string]: any;
  };
}

interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'contains';
  value: any;
}
```

## Workflow Definitions

### Normal Workflow

```json
{
  "name": "Normal Trip Approval",
  "tripType": "Normal",
  "isActive": true,
  "steps": [
    {
      "name": "Department Approval",
      "order": 1,
      "role": "DepartmentHead",
      "state": "PENDING_DEPARTMENT",
      "timeoutHours": 48,
      "nextStateOnApprove": "PENDING_COLLEGE",
      "nextStateOnReject": "REJECTED",
      "nextStateOnTimeout": "AUTO_REJECTED_TIMEOUT",
      "actions": [
        {
          "type": "notification",
          "trigger": "onEnter",
          "config": {
            "template": "trip_pending_approval",
            "recipients": ["departmentHead"]
          }
        },
        {
          "type": "notification",
          "trigger": "onWarning",
          "config": {
            "template": "approval_timeout_warning",
            "recipients": ["departmentHead"],
            "hoursBeforeTimeout": 24
          }
        },
        {
          "type": "notification",
          "trigger": "onApprove",
          "config": {
            "template": "trip_approved_level",
            "recipients": ["requester"]
          }
        },
        {
          "type": "notification",
          "trigger": "onReject",
          "config": {
            "template": "trip_rejected",
            "recipients": ["requester"]
          }
        },
        {
          "type": "notification",
          "trigger": "onTimeout",
          "config": {
            "template": "trip_auto_rejected",
            "recipients": ["requester", "departmentHead"]
          }
        }
      ]
    },
    {
      "name": "College Approval",
      "order": 2,
      "role": "CollegeHead",
      "state": "PENDING_COLLEGE",
      "timeoutHours": 48,
      "nextStateOnApprove": "PENDING_DEAN",
      "nextStateOnReject": "REJECTED",
      "nextStateOnTimeout": "AUTO_REJECTED_TIMEOUT",
      "actions": [
        {
          "type": "notification",
          "trigger": "onEnter",
          "config": {
            "template": "trip_pending_approval",
            "recipients": ["collegeHead"]
          }
        }
      ]
    },
    {
      "name": "Dean Approval",
      "order": 3,
      "role": "Dean",
      "state": "PENDING_DEAN",
      "timeoutHours": 48,
      "nextStateOnApprove": "APPROVED_FOR_ALLOCATION",
      "nextStateOnReject": "REJECTED",
      "nextStateOnTimeout": "AUTO_REJECTED_TIMEOUT",
      "actions": [
        {
          "type": "notification",
          "trigger": "onEnter",
          "config": {
            "template": "trip_pending_approval",
            "recipients": ["dean"]
          }
        },
        {
          "type": "notification",
          "trigger": "onApprove",
          "config": {
            "template": "trip_fully_approved",
            "recipients": ["requester", "deploymentTeam"]
          }
        }
      ]
    }
  ]
}
```

### VIP Workflow

```json
{
  "name": "VIP Trip Approval",
  "tripType": "VIP",
  "isActive": true,
  "steps": [
    {
      "name": "Dean Approval",
      "order": 1,
      "role": "Dean",
      "state": "PENDING_DEAN",
      "timeoutHours": 48,
      "nextStateOnApprove": "APPROVED_FOR_ALLOCATION",
      "nextStateOnReject": "REJECTED",
      "nextStateOnTimeout": "AUTO_REJECTED_TIMEOUT",
      "actions": [
        {
          "type": "notification",
          "trigger": "onEnter",
          "config": {
            "template": "vip_trip_pending_approval",
            "recipients": ["dean"],
            "priority": "high"
          }
        },
        {
          "type": "notification",
          "trigger": "onApprove",
          "config": {
            "template": "vip_trip_approved",
            "recipients": ["requester", "deploymentTeam"],
            "priority": "high"
          }
        }
      ]
    }
  ]
}
```

## Workflow Engine Implementation

### 1. Workflow Service

```typescript
@Injectable()
export class WorkflowService {
  constructor(
    private readonly workflowConfigRepo: Repository<WorkflowConfiguration>,
    private readonly tripRepo: Repository<TripRequest>,
    private readonly approvalRepo: Repository<Approval>,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getWorkflow(tripType: TripType): Promise<WorkflowConfiguration> {
    return this.workflowConfigRepo.findOne({
      where: { tripType, isActive: true },
    });
  }

  async initializeWorkflow(trip: TripRequest): Promise<void> {
    const workflow = await this.getWorkflow(trip.tripType);
    const firstStep = workflow.steps.find(s => s.order === 1);
    
    // Create approval record
    const approval = this.approvalRepo.create({
      tripRequest: trip,
      approvalLevel: this.mapStateToLevel(firstStep.state),
      status: ApprovalStatus.Pending,
      dueDate: this.calculateDueDate(firstStep.timeoutHours),
    });
    
    await this.approvalRepo.save(approval);
    
    // Update trip state
    trip.state = firstStep.state;
    trip.currentApprovalLevel = firstStep.name;
    await this.tripRepo.save(trip);
    
    // Execute onEnter actions
    await this.executeActions(firstStep, trip, 'onEnter');
    
    // Schedule timeout check
    await this.scheduleTimeoutCheck(trip.id, approval.id, firstStep.timeoutHours);
  }

  async processApproval(
    tripId: string,
    approverId: string,
    approved: boolean,
    comments?: string,
  ): Promise<TripRequest> {
    const trip = await this.tripRepo.findOne({
      where: { id: tripId },
      relations: ['approvals', 'requester'],
    });
    
    const workflow = await this.getWorkflow(trip.tripType);
    const currentStep = workflow.steps.find(s => s.state === trip.state);
    
    if (!currentStep) {
      throw new Error('Invalid workflow state');
    }
    
    // Validate approver role
    const approver = await this.validateApprover(approverId, currentStep.role);
    
    // Update approval record
    const approval = trip.approvals.find(
      a => a.approvalLevel === this.mapStateToLevel(currentStep.state) && 
           a.status === ApprovalStatus.Pending
    );
    
    approval.approver = approver;
    approval.status = approved ? ApprovalStatus.Approved : ApprovalStatus.Rejected;
    approval.comments = comments;
    approval.approvedAt = new Date();
    await this.approvalRepo.save(approval);
    
    // Determine next state
    const nextState = approved 
      ? currentStep.nextStateOnApprove 
      : currentStep.nextStateOnReject;
    
    trip.state = nextState;
    
    if (!approved) {
      trip.rejectedBy = approver;
      trip.rejectedAt = new Date();
      trip.rejectionReason = comments;
    }
    
    await this.tripRepo.save(trip);
    
    // Execute actions
    const trigger = approved ? 'onApprove' : 'onReject';
    await this.executeActions(currentStep, trip, trigger);
    
    // If approved and not final state, move to next step
    if (approved && this.isApprovalState(nextState)) {
      const nextStep = workflow.steps.find(s => s.state === nextState);
      await this.moveToNextStep(trip, nextStep);
    }
    
    // Emit event
    this.eventEmitter.emit('trip.approval.processed', {
      tripId: trip.id,
      approved,
      state: trip.state,
    });
    
    return trip;
  }

  async handleTimeout(tripId: string, approvalId: string): Promise<void> {
    const trip = await this.tripRepo.findOne({
      where: { id: tripId },
      relations: ['approvals'],
    });
    
    const approval = trip.approvals.find(a => a.id === approvalId);
    
    if (approval.status !== ApprovalStatus.Pending) {
      return; // Already processed
    }
    
    const workflow = await this.getWorkflow(trip.tripType);
    const currentStep = workflow.steps.find(s => s.state === trip.state);
    
    // Mark as auto-rejected
    approval.status = ApprovalStatus.AutoRejectedTimeout;
    await this.approvalRepo.save(approval);
    
    trip.state = currentStep.nextStateOnTimeout;
    trip.rejectionReason = 'Approval timeout exceeded';
    trip.rejectedAt = new Date();
    await this.tripRepo.save(trip);
    
    // Execute timeout actions
    await this.executeActions(currentStep, trip, 'onTimeout');
    
    // Emit event
    this.eventEmitter.emit('trip.timeout', {
      tripId: trip.id,
      approvalLevel: currentStep.name,
    });
  }

  private async moveToNextStep(
    trip: TripRequest,
    nextStep: WorkflowStep,
  ): Promise<void> {
    // Create next approval record
    const approval = this.approvalRepo.create({
      tripRequest: trip,
      approvalLevel: this.mapStateToLevel(nextStep.state),
      status: ApprovalStatus.Pending,
      dueDate: this.calculateDueDate(nextStep.timeoutHours),
    });
    
    await this.approvalRepo.save(approval);
    
    trip.currentApprovalLevel = nextStep.name;
    await this.tripRepo.save(trip);
    
    // Execute onEnter actions
    await this.executeActions(nextStep, trip, 'onEnter');
    
    // Schedule timeout check
    await this.scheduleTimeoutCheck(trip.id, approval.id, nextStep.timeoutHours);
  }

  private async executeActions(
    step: WorkflowStep,
    trip: TripRequest,
    trigger: string,
  ): Promise<void> {
    const actions = step.actions.filter(a => a.trigger === trigger);
    
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'notification':
            await this.notificationService.send(trip, action.config);
            break;
          case 'email':
            await this.emailService.send(trip, action.config);
            break;
          case 'webhook':
            await this.webhookService.call(trip, action.config);
            break;
        }
      } catch (error) {
        console.error(`Failed to execute action: ${action.type}`, error);
      }
    }
  }

  private async scheduleTimeoutCheck(
    tripId: string,
    approvalId: string,
    timeoutHours: number,
  ): Promise<void> {
    const queue = this.queueService.getQueue('workflow');
    
    // Schedule timeout check
    await queue.add(
      'check-timeout',
      { tripId, approvalId },
      { delay: timeoutHours * 60 * 60 * 1000 },
    );
    
    // Schedule warning (24 hours before timeout)
    if (timeoutHours > 24) {
      await queue.add(
        'timeout-warning',
        { tripId, approvalId },
        { delay: (timeoutHours - 24) * 60 * 60 * 1000 },
      );
    }
  }

  private calculateDueDate(timeoutHours: number): Date {
    return new Date(Date.now() + timeoutHours * 60 * 60 * 1000);
  }

  private isApprovalState(state: TripState): boolean {
    return [
      TripState.PENDING_DEPARTMENT,
      TripState.PENDING_COLLEGE,
      TripState.PENDING_DEAN,
    ].includes(state);
  }

  private mapStateToLevel(state: TripState): ApprovalLevel {
    const mapping = {
      [TripState.PENDING_DEPARTMENT]: ApprovalLevel.Department,
      [TripState.PENDING_COLLEGE]: ApprovalLevel.College,
      [TripState.PENDING_DEAN]: ApprovalLevel.Dean,
    };
    return mapping[state];
  }

  private async validateApprover(
    userId: string,
    requiredRole: UserRole,
  ): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    
    if (user.role !== requiredRole) {
      throw new ForbiddenException('Insufficient permissions to approve');
    }
    
    return user;
  }
}
```

### 2. Timeout Processor

```typescript
@Processor('workflow')
export class WorkflowProcessor {
  constructor(private readonly workflowService: WorkflowService) {}

  @Process('check-timeout')
  async handleTimeout(job: Job<{ tripId: string; approvalId: string }>) {
    const { tripId, approvalId } = job.data;
    await this.workflowService.handleTimeout(tripId, approvalId);
  }

  @Process('timeout-warning')
  async handleTimeoutWarning(job: Job<{ tripId: string; approvalId: string }>) {
    const { tripId, approvalId } = job.data;
    await this.workflowService.sendTimeoutWarning(tripId, approvalId);
  }
}
```

### 3. State Transition Validator

```typescript
@Injectable()
export class StateTransitionValidator {
  private readonly transitions: Map<TripState, TripState[]> = new Map([
    [TripState.DRAFT, [TripState.SUBMITTED, TripState.CANCELLED]],
    [TripState.SUBMITTED, [TripState.PENDING_DEPARTMENT, TripState.PENDING_DEAN]],
    [TripState.PENDING_DEPARTMENT, [
      TripState.PENDING_COLLEGE,
      TripState.REJECTED,
      TripState.AUTO_REJECTED_TIMEOUT,
    ]],
    [TripState.PENDING_COLLEGE, [
      TripState.PENDING_DEAN,
      TripState.REJECTED,
      TripState.AUTO_REJECTED_TIMEOUT,
    ]],
    [TripState.PENDING_DEAN, [
      TripState.APPROVED_FOR_ALLOCATION,
      TripState.REJECTED,
      TripState.AUTO_REJECTED_TIMEOUT,
    ]],
    [TripState.APPROVED_FOR_ALLOCATION, [TripState.CAR_ALLOCATED]],
    [TripState.CAR_ALLOCATED, [TripState.PENDING_TRANSPORT_CONFIRM]],
    [TripState.PENDING_TRANSPORT_CONFIRM, [TripState.READY]],
    [TripState.READY, [TripState.IN_PROGRESS, TripState.CANCELLED]],
    [TripState.IN_PROGRESS, [TripState.COMPLETED, TripState.CANCELLED]],
  ]);

  canTransition(from: TripState, to: TripState): boolean {
    const allowedTransitions = this.transitions.get(from) || [];
    return allowedTransitions.includes(to);
  }

  validateTransition(from: TripState, to: TripState): void {
    if (!this.canTransition(from, to)) {
      throw new BadRequestException(
        `Invalid state transition from ${from} to ${to}`,
      );
    }
  }
}
```

## Event-Driven Architecture

### Event Emitters

```typescript
// Trip events
this.eventEmitter.emit('trip.created', { tripId, userId });
this.eventEmitter.emit('trip.submitted', { tripId, workflow });
this.eventEmitter.emit('trip.approved', { tripId, level, approverId });
this.eventEmitter.emit('trip.rejected', { tripId, level, reason });
this.eventEmitter.emit('trip.timeout', { tripId, level });
this.eventEmitter.emit('trip.allocated', { tripId, vehicleId, driverId });
this.eventEmitter.emit('trip.started', { tripId, timestamp });
this.eventEmitter.emit('trip.completed', { tripId, stats });
```

### Event Listeners

```typescript
@Injectable()
export class TripEventListener {
  @OnEvent('trip.approved')
  async handleTripApproved(payload: any) {
    // Send notifications
    // Update analytics
    // Trigger webhooks
  }

  @OnEvent('trip.timeout')
  async handleTripTimeout(payload: any) {
    // Send alerts
    // Log incident
    // Update metrics
  }

  @OnEvent('trip.allocated')
  async handleTripAllocated(payload: any) {
    // Update vehicle status
    // Update driver status
    // Send notifications
  }
}
```

## Workflow Administration

### Admin Endpoints

```typescript
// Get all workflows
GET /admin/workflows

// Create workflow
POST /admin/workflows

// Update workflow
PATCH /admin/workflows/:id

// Activate/deactivate workflow
PATCH /admin/workflows/:id/toggle

// Test workflow
POST /admin/workflows/:id/test
```

## Testing Strategy

### Unit Tests
- State transition validation
- Workflow step execution
- Action execution
- Timeout calculation

### Integration Tests
- Complete approval flow
- Timeout handling
- VIP workflow
- Rejection scenarios

### E2E Tests
- Full trip lifecycle
- Multiple concurrent approvals
- Timeout edge cases
- Workflow configuration changes

## Performance Considerations

1. **Caching**: Cache active workflow configurations
2. **Indexing**: Index trip state and approval due dates
3. **Queue Management**: Use Bull for reliable job scheduling
4. **Event Processing**: Async event handlers to avoid blocking
5. **Database Transactions**: Ensure atomic state transitions

## Monitoring

- Track approval times per level
- Monitor timeout rates
- Alert on high rejection rates
- Dashboard for workflow metrics
- Audit all state transitions
