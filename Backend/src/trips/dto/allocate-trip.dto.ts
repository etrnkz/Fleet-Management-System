import { IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AllocateTripDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  vehicleId: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  driverId: string;

  @ApiProperty({ example: 50.00 })
  @IsNumber()
  @Min(0)
  estimatedFuelCost: number;

  @ApiProperty({ example: 45.5 })
  @IsNumber()
  @Min(0)
  estimatedDistance: number;
}
