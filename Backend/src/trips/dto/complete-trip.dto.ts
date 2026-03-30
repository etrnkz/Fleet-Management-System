import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteTripDto {
  @ApiProperty({ example: 48.2 })
  @IsNumber()
  @Min(0)
  actualDistance: number;

  @ApiProperty({ example: 52.5 })
  @IsNumber()
  @Min(0)
  actualFuelCost: number;

  @ApiProperty({ example: 125480 })
  @IsNumber()
  @Min(0)
  finalMileage: number;

  @ApiProperty({ example: 'Trip completed successfully', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
