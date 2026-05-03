import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemAdminController } from './system-admin.controller';
import { SystemAdminService } from './system-admin.service';
import { User } from '../users/entities/user.entity';
import { TripRequest } from '../trips/entities/trip-request.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { MaintenanceRequest } from '../maintenance/entities/maintenance-request.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, TripRequest, Vehicle, MaintenanceRequest, Notification, AuditLog,
    ]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [SystemAdminController],
  providers: [SystemAdminService],
  exports: [SystemAdminService],
})
export class SystemAdminModule {}
