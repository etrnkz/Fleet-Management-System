import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CollegesModule } from './colleges/colleges.module';
import { DepartmentsModule } from './departments/departments.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DriversModule } from './drivers/drivers.module';
import { TripsModule } from './trips/trips.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WorkflowModule } from './workflow/workflow.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { AuditModule } from './audit/audit.module';
import { FuelModule } from './fuel/fuel.module';
import { TrackingModule } from './tracking/tracking.module';
import { EmailModule } from './email/email.module';
import { SystemAdminModule } from './system-admin/system-admin.module';
import { SmsModule } from './sms/sms.module';
import configuration from './config/configuration';
import { typeOrmOptionsForNest } from './database/typeorm.factory';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const opts = typeOrmOptionsForNest(configService);
        let dbLabel = '?';
        if (opts.type === 'postgres') {
          if ('url' in opts && opts.url) dbLabel = '(DATABASE_URL)';
          else if ('database' in opts) dbLabel = String(opts.database);
        }
        new Logger('TypeOrm').log(
          `synchronize=${String(opts.synchronize)} database=${dbLabel}`,
        );
        return opts;
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('redis.host', 'localhost'),
          port: config.get('redis.port', 6379),
        },
      }),
    }),
    UsersModule,
    CollegesModule,
    DepartmentsModule,
    VehiclesModule,
    DriversModule,
    TripsModule,
    NotificationsModule,
    WorkflowModule,
    MaintenanceModule,
    AuditModule,
    FuelModule,
    EmailModule,
    SmsModule,
    TrackingModule,
    SystemAdminModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
