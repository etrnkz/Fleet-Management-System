import { PartialType } from '@nestjs/swagger';
import { CreateVehicleDto } from './create-vehicle.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleStatus } from '../entities/vehicle.entity';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
  @ApiPropertyOptional({ 
    enum: VehicleStatus,
    example: VehicleStatus.Active,
    description: 'Vehicle status'
  })
  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;
}
