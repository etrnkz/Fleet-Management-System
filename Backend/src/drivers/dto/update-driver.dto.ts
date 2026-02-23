import { PartialType } from '@nestjs/swagger';
import { CreateDriverDto } from './create-driver.dto';
import { IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DriverStatus } from '../entities/driver.entity';

export class UpdateDriverDto extends PartialType(CreateDriverDto) {
  @ApiPropertyOptional({ 
    enum: DriverStatus,
    example: DriverStatus.Available,
    description: 'Driver status'
  })
  @IsEnum(DriverStatus)
  @IsOptional()
  status?: DriverStatus;

  @ApiPropertyOptional({ 
    example: 4.5,
    description: 'Driver rating (0-5)'
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  rating?: number;
}
