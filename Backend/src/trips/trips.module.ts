import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { GateScanController } from './gate-scan.controller';
import { TripRequest } from './entities/trip-request.entity';
import { Approval } from './entities/approval.entity';
import { TripFeedback } from './entities/trip-feedback.entity';
import { User } from '../users/entities/user.entity';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { DriversModule } from '../drivers/drivers.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([TripRequest, Approval, TripFeedback, User]),
    VehiclesModule,
    DriversModule,
    NotificationsModule,
    WorkflowModule,
  ],
  controllers: [TripsController, GateScanController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
