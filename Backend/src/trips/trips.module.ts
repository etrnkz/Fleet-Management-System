import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { TripRequest } from './entities/trip-request.entity';
import { Approval } from './entities/approval.entity';
import { TripFeedback } from './entities/trip-feedback.entity';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { DriversModule } from '../drivers/drivers.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TripRequest, Approval, TripFeedback]),
    VehiclesModule,
    DriversModule,
    NotificationsModule,
    WorkflowModule,
  ],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
