import {
  IsBoolean,
  IsString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ConfirmTransportDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  fuelApproved: boolean;

  @ApiProperty({
    example: 'Fuel allocated, ready for dispatch',
    required: false,
  })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiPropertyOptional({
    example: 150.5,
    description:
      'Optional: override estimated fuel cost (ETB) from deployment allocation when confirming',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedFuelCost?: number;

  @ApiPropertyOptional({
    example: 85.5,
    description:
      'Optional: override estimated distance (km) from deployment allocation when confirming',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedDistance?: number;

  @ApiPropertyOptional({ example: 'Ready for dispatch' })
  @IsString()
  @IsOptional()
  notes?: string;
}
