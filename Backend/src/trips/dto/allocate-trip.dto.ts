import { IsUUID, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class AllocateTripDto {
  @ApiPropertyOptional({
    example: 'uuid',
    description: 'Vehicle ID. If omitted, the pre-assigned vehicle of the available driver is used.',
  })
  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @ApiPropertyOptional({
    example: 'uuid',
    description: 'Driver ID. If omitted, the first available pre-assigned driver is used.',
  })
  @IsOptional()
  @IsUUID()
  driverId?: string;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @Min(0)
  estimatedFuelCost: number;

  @ApiProperty({ example: 45.5 })
  @IsNumber()
  @Min(0)
  estimatedDistance: number;
}
