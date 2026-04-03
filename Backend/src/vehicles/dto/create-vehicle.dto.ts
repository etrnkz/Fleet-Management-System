import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Max,
  Matches,
  IsDateString,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FuelType, VehicleStatus } from '../entities/vehicle.entity';
import { RestrictedZoneDto } from './restricted-zone.dto';

export class CreateVehicleDto {
  @ApiPropertyOptional({
    example: 'VEH-001',
    description: 'Custom vehicle ID',
  })
  @IsString()
  @IsOptional()
  vehicleId?: string;

  @ApiProperty({
    example: 'ABC-1234',
    description: 'Vehicle plate number (unique)',
  })
  @IsString()
  @IsNotEmpty()
  plateNumber: string;

  @ApiPropertyOptional({
    example: 'Truck',
    description: 'Vehicle type (Truck, Van, Bus, Sedan, SUV)',
  })
  @IsString()
  @IsOptional()
  vehicleType?: string;

  @ApiProperty({
    example: 'Toyota',
    description: 'Vehicle manufacturer',
  })
  @IsString()
  @IsNotEmpty()
  make: string;

  @ApiProperty({
    example: 'Hiace',
    description: 'Vehicle model',
  })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({
    example: 2022,
    description: 'Manufacturing year',
  })
  @IsNumber()
  @Min(1990)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @ApiPropertyOptional({
    example: 15,
    description: 'Passenger capacity',
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  capacity?: number;

  @ApiProperty({
    enum: FuelType,
    example: FuelType.Diesel,
    description: 'Fuel type',
  })
  @IsEnum(FuelType)
  fuelType: FuelType;

  @ApiPropertyOptional({
    example: 80,
    description: 'Fuel tank capacity in liters',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  fuelCapacity?: number;

  @ApiPropertyOptional({
    enum: VehicleStatus,
    example: VehicleStatus.Active,
    description: 'Vehicle status',
  })
  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;

  @ApiPropertyOptional({
    example: 125000,
    description: 'Current mileage in kilometers',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  currentMileage?: number;

  @ApiPropertyOptional({
    example: '2024-01-15',
    description: 'Vehicle purchase date',
  })
  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Insurance expiry date',
  })
  @IsDateString()
  @IsOptional()
  insuranceExpiryDate?: string;

  @ApiPropertyOptional({
    example: '2024-06-30',
    description: 'Next scheduled service date',
  })
  @IsDateString()
  @IsOptional()
  nextServiceDate?: string;

  @ApiPropertyOptional({
    example: 'White',
    description: 'Vehicle color',
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    example: '1HGBH41JXMN109186',
    description: 'Vehicle Identification Number',
  })
  @IsString()
  @IsOptional()
  vinNumber?: string;

  @ApiPropertyOptional({
    example: 'School bus for student transportation',
    description: 'Additional notes',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description:
      'VIP-style geofence: when enabled, entering any restricted zone simulates engine cut-off',
  })
  @IsBoolean()
  @IsOptional()
  vipGeoRestrictionEnabled?: boolean;

  @ApiPropertyOptional({
    type: [RestrictedZoneDto],
    description: 'Forbidden circular zones (center + radius in meters)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RestrictedZoneDto)
  restrictedZones?: RestrictedZoneDto[];
}
