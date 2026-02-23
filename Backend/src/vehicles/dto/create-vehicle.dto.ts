import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Min, Max, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FuelType } from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @ApiProperty({ 
    example: 'ABC-1234',
    description: 'Vehicle plate number (unique)'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9-]+$/, { message: 'Plate number must contain only uppercase letters, numbers, and hyphens' })
  plateNumber: string;

  @ApiProperty({ 
    example: 'Toyota',
    description: 'Vehicle manufacturer'
  })
  @IsString()
  @IsNotEmpty()
  make: string;

  @ApiProperty({ 
    example: 'Hiace',
    description: 'Vehicle model'
  })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ 
    example: 2022,
    description: 'Manufacturing year'
  })
  @IsNumber()
  @Min(1990)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @ApiProperty({ 
    example: 15,
    description: 'Passenger capacity'
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  capacity: number;

  @ApiProperty({ 
    enum: FuelType,
    example: FuelType.Diesel,
    description: 'Fuel type'
  })
  @IsEnum(FuelType)
  fuelType: FuelType;

  @ApiPropertyOptional({ 
    example: 125000,
    description: 'Current mileage in kilometers'
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  currentMileage?: number;

  @ApiPropertyOptional({ 
    example: 'White',
    description: 'Vehicle color'
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ 
    example: '1HGBH41JXMN109186',
    description: 'Vehicle Identification Number'
  })
  @IsString()
  @IsOptional()
  vinNumber?: string;

  @ApiPropertyOptional({ 
    example: 'School bus for student transportation',
    description: 'Additional notes'
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
