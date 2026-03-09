import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { TrackingGateway } from './tracking.gateway';
import { GpsLocation } from './entities/gps-location.entity';
import { TripRequest } from '../trips/entities/trip-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GpsLocation, TripRequest])],
  controllers: [TrackingController],
  providers: [TrackingService, TrackingGateway],
  exports: [TrackingService, TrackingGateway],
})
export class TrackingModule {}
