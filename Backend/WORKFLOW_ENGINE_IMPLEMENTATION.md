# Workflow Engine Implementation - COMPLETE

## Overview

Successfully implemented a production-ready workflow engine with automatic timeout handling, scheduled jobs, and configurable workflows.

## Architecture

### Components

1. **WorkflowService**: Core workflow logic
2. **WorkflowProcessor**: Bull queue job processor
3. **WorkflowConfiguration Entity**: Database-stored workflow definitions
4. **Bull Queue**: Redis-backed job scheduling
5. **Integration**: Seamless integration with trips module

## Features Implemented

### 1. Configurable Workflows

Workflows are stored in the database and can be configured without code changes:

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
  role: string;
  state: string;
  timeoutHours: number;
  nextStateOnApprove: string;
  nextStateOnReject: string;
  nextStateOnTimeout: string;
  actions: WorkflowAction[];
}
```

### 2. Automatic Timeout Handling

- **48-hour timeout** per approval level
- **Automatic rejection** when timeout expires
- **Scheduled jobs** using Bull queue with Redis
- **Timeout warnings** sent 24 hours before expiration
- **Graceful handling** of already-processed approvals

### 3. Default Workflows

#### Normal Trip Workflow
1. Department Approval (48h timeout)
2. College Approval (48h timeout)
3. Dean Approval (48h timeout)
4. Approved for Allocation

#### VIP Trip Workflow
1. Dean Approval (48h timeout)
2. Approved for Allocation

### 4. Job Scheduling

**Timeout Check Job**:
- Scheduled when trip is submitted
- Runs after 48 hours
- Checks if approval is still pending
- Auto-rejects if overdue
- Sends notifications

**Timeout Warning Job**:
- Scheduled 24 hours before timeout
- Sends warning notification
- Only for timeouts > 24 hours

### 5. Workflow Lifecycle Management

**On Trip Submission**:
```typescript
await workflowService.initializeWorkflow(trip);
// - Schedules timeout check
// - Schedules warning (if applicable)
```

**On Approval**:
```typescript
await workflowService.rescheduleOnApproval(trip);
// - Cancels existing jobs
// - Schedules new jobs for next level
```

**On Rejection**:
```typescript
await workflowService.cancelScheduledJobs(tripId);
// - Cancels all pending jobs
```

**On Cancellation**:
```typescript
await workflowService.cancelScheduledJobs(tripId);
// - Cancels all pending jobs
```

## Technical Implementation

### Dependencies Added

```json
{
  "@nestjs/bull": "^10.x",
  "@nestjs/schedule": "^4.x",
  "bull": "^4.x"
}
```

### Redis Configuration

```typescript
BullModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    redis: {
      host: config.get('redis.host', 'localhost'),
      port: config.get('redis.port', 6379),
    },
  }),
})
```

### Environment Variables

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Workflow Service Methods

### Core Methods

1. **getActiveWorkflow(tripType)**: Retrieve active workflow configuration
2. **initializeWorkflow(trip)**: Start workflow for new trip
3. **scheduleTimeoutCheck(tripId, hours)**: Schedule timeout job
4. **scheduleTimeoutWarning(tripId, hours)**: Schedule warning job
5. **handleTimeout(tripId)**: Process timeout (auto-reject)
6. **handleTimeoutWarning(tripId)**: Send warning notification
7. **cancelScheduledJobs(tripId)**: Cancel all jobs for trip
8. **rescheduleOnApproval(trip)**: Reschedule for next level
9. **seedDefaultWorkflows()**: Initialize default workflows

### Integration Points

**TripsService Integration**:
- Submit: Initialize workflow
- Approve: Reschedule workflow
- Reject: Cancel workflow jobs
- Cancel: Cancel workflow jobs

## Job Processing

### Timeout Check Job

```typescript
@Process('check-timeout')
async handleTimeout(job: Job<{ tripId: string }>) {
  // 1. Load trip with relations
  // 2. Verify still in pending state
  // 3. Check if approval is overdue
  // 4. Mark approval as auto-rejected
  // 5. Update trip state to AUTO_REJECTED_TIMEOUT
  // 6. Send notifications
  // 7. Log completion
}
```

### Timeout Warning Job

```typescript
@Process('timeout-warning')
async handleTimeoutWarning(job: Job<{ tripId: string }>) {
  // 1. Load trip
  // 2. Verify still pending
  // 3. Send warning notification
  // 4. Log completion
}
```

## Error Handling

### Graceful Degradation
- Workflow failures don't block trip operations
- Errors logged with context
- Jobs can be retried on failure
- Dead letter queue for failed jobs

### Edge Cases Handled
- Trip already approved before timeout
- Trip rejected before timeout
- Trip cancelled before timeout
- Duplicate job execution prevention
- Missing workflow configuration

## Notifications

### Timeout Notifications

**Auto-Rejection**:
```typescript
{
  type: NotificationType.TripAutoRejected,
  title: 'Trip Request Auto-Rejected',
  message: 'Your trip request was automatically rejected due to approval timeout',
  data: { tripId, requestNumber, level }
}
```

**Warning**:
```typescript
{
  type: NotificationType.ApprovalReminder,
  title: 'Approval Timeout Warning',
  message: 'Trip will be auto-rejected in 24 hours if not approved',
  data: { tripId, requestNumber, level }
}
```

## Database Schema

### workflow_configurations Table

```sql
CREATE TABLE workflow_configurations (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  tripType VARCHAR NOT NULL,
  isActive BOOLEAN DEFAULT true,
  steps JSON NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Indexes
- `idx_workflow_type_active` on (tripType, isActive)

## Testing

### Manual Testing

1. **Submit Trip**: Verify jobs scheduled
2. **Wait for Warning**: Check notification after 24h (or adjust timeout for testing)
3. **Wait for Timeout**: Verify auto-rejection after 48h
4. **Approve Before Timeout**: Verify jobs cancelled and rescheduled
5. **Reject Trip**: Verify jobs cancelled
6. **Cancel Trip**: Verify jobs cancelled

### Testing with Reduced Timeouts

For testing, you can modify the workflow configuration:

```typescript
// Change timeout from 48 hours to 2 minutes for testing
timeoutHours: 2 / 60 // 2 minutes
```

## Monitoring

### Bull Dashboard (Optional)

Install Bull Board for visual monitoring:

```bash
npm install @bull-board/api @bull-board/nestjs
```

### Logging

All workflow operations are logged:
- Job scheduling
- Job execution
- Timeout processing
- Warning notifications
- Error conditions

### Metrics to Monitor

- Jobs scheduled per hour
- Jobs completed successfully
- Jobs failed
- Average processing time
- Timeout rate
- Warning notification rate

## Production Considerations

### Redis Configuration

**Production Redis**:
```typescript
{
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === 'true',
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  }
}
```

### Job Configuration

**Retry Strategy**:
```typescript
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
}
```

**Job Cleanup**:
```typescript
{
  removeOnComplete: 100, // Keep last 100 completed
  removeOnFail: 500,     // Keep last 500 failed
}
```

### Scaling

- Redis can be clustered for high availability
- Multiple worker instances can process jobs
- Jobs are distributed across workers
- No single point of failure

## Security

- Workflow configurations stored in database
- Only admins can modify workflows
- Job data doesn't contain sensitive information
- Redis should be password-protected in production

## Future Enhancements

1. **Escalation**: Notify higher authority if timeout approaching
2. **Custom Timeouts**: Per-department or per-user timeout settings
3. **Business Hours**: Only count business hours for timeouts
4. **Workflow Analytics**: Track approval times, bottlenecks
5. **Dynamic Workflows**: A/B testing different workflows
6. **Approval Delegation**: Temporary delegation during absence

## API Endpoints

No new public endpoints added. Workflow engine operates internally.

## Status: ✅ COMPLETE

The workflow engine is fully implemented and integrated:
- ✅ Configurable workflows stored in database
- ✅ Automatic 48-hour timeout per level
- ✅ Scheduled jobs with Bull and Redis
- ✅ Timeout warnings (24h before)
- ✅ Auto-rejection on timeout
- ✅ Job cancellation on approval/rejection
- ✅ Job rescheduling on approval
- ✅ Comprehensive error handling
- ✅ Logging and monitoring
- ✅ Default workflows seeded
- ✅ Full integration with trips module

## Running the System

### Prerequisites

1. **Install Redis**:
   ```bash
   # Windows (using Chocolatey)
   choco install redis-64
   
   # Or use Docker
   docker run -d -p 6379:6379 redis:alpine
   
   # Or use Memurai (Redis for Windows)
   # Download from: https://www.memurai.com/
   ```

2. **Start Redis**:
   ```bash
   redis-server
   # Or if using Memurai, start from Windows Services
   ```

3. **Seed Workflows**:
   ```bash
   npm run build
   node dist/workflow/seed-workflows.js
   ```

4. **Start Application**:
   ```bash
   npm run start:dev
   ```

### Verification

Check logs for:
```
[WorkflowService] Workflow initialized for trip <id>
[WorkflowService] Scheduled timeout check for trip <id> in 48 hours
[WorkflowService] Scheduled timeout warning for trip <id> in 24 hours
```

## Summary

The workflow engine provides production-ready automatic timeout handling with:
- Zero manual intervention required
- Configurable workflows
- Reliable job scheduling
- Comprehensive error handling
- Full audit trail through logs and notifications

This completes one of the most critical features for the production system!
