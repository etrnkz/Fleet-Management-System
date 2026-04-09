import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { Driver } from './entities/driver.entity';
import { UsersModule } from '../users/users.module';
import { TripRequest } from '../trips/entities/trip-request.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, TripRequest, Vehicle]), UsersModule],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService, TypeOrmModule],
})
export class DriversModule {}
