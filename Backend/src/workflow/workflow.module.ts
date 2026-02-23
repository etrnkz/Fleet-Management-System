import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { WorkflowService } from './workflow.service';
import { WorkflowProcessor } from './workflow.processor';
import { WorkflowConfiguration } from './entities/workflow-config.entity';
import { TripRequest } from '../trips/entities/trip-request.entity';
import { Approval } from '../trips/entities/approval.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowConfiguration, TripRequest, Approval]),
    BullModule.registerQueue({
      name: 'workflow',
    }),
    NotificationsModule,
  ],
  providers: [WorkflowService, WorkflowProcessor],
  exports: [WorkflowService],
})
export class WorkflowModule {}
