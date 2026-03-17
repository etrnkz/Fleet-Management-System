import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EarlyCompleteTripDto {
  @ApiProperty({ 
    example: 200.5,
    description: 'Actual distance traveled in kilometers'
  })
  @IsNumber()
  @Min(0)
  actualDistance: number;

  @ApiProperty({ 
    example: 145.75,
    description: 'Actual fuel cost for the trip'
  })
  @IsNumber()
  @Min(0)
  actualFuelCost: number;

  @ApiProperty({ 
    example: 15200,
    description: 'Final vehicle mileage reading'
  })
  @IsNumber()
  @Min(0)
  finalMileage: number;

  @ApiPropertyOptional({ 
    example: 'Trip completed early due to efficient route planning',
    description: 'Reason for early completion'
  })
  @IsOptional()
  @IsString()
  earlyCompletionReason?: string;

  @ApiPropertyOptional({ 
    example: 'All objectives achieved ahead of schedule',
    description: 'Additional notes about the trip completion'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}