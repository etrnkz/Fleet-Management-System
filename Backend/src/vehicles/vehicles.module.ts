import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity';
import { TripRequest } from '../trips/entities/trip-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, TripRequest])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService, TypeOrmModule],
})
export class VehiclesModule {}
