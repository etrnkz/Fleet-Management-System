import {
  IsUUID,
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FuelRecordType } from '../entities/fuel-record.entity';

export class CreateFuelRecordDto {
  @ApiProperty({ example: 'uuid', description: 'Vehicle ID' })
  @IsUUID()
  vehicleId: string;

  @ApiPropertyOptional({
    example: 'uuid',
    description: 'Trip ID (for trip consumption records)',
  })
  @IsUUID()
  @IsOptional()
  tripId?: string;

  @ApiProperty({ enum: FuelRecordType, example: FuelRecordType.Refuel })
  @IsEnum(FuelRecordType)
  type: FuelRecordType;

  @ApiProperty({ example: 50.5, description: 'Fuel quantity in liters' })
  @IsNumber()
  @Min(0.1)
  quantity: number;

  @ApiProperty({ example: 65.5, description: 'Price per liter' })
  @IsNumber()
  @Min(0)
  pricePerLiter: number;

  @ApiPropertyOptional({ example: 3312.5, description: 'Total cost (quantity × pricePerLiter). Calculated server-side if omitted.' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  totalCost?: number;

  @ApiPropertyOptional({
    example: 125000,
    description: 'Vehicle mileage at refuel',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  mileageAtRefuel?: number;

  @ApiPropertyOptional({
    example: 'Total Gas Station',
    description: 'Fuel station name',
  })
  @IsString()
  @IsOptional()
  station?: string;

  @ApiPropertyOptional({ example: 'RCP-12345', description: 'Receipt number' })
  @IsString()
  @IsOptional()
  receiptNumber?: string;

  @ApiPropertyOptional({
    example: 'Regular refuel',
    description: 'Additional notes',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
