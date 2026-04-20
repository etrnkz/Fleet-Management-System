import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceRequest } from './entities/maintenance-request.entity';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { TripRequest } from '../trips/entities/trip-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceRequest, TripRequest]), VehiclesModule],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
