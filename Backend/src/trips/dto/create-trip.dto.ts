import {
  IsEnum,
  IsString,
  IsDateString,
  IsInt,
  IsNumber,
  Min,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TripType, TripCategory } from '../entities/trip-request.entity';

export class CreateTripDto {
  @ApiProperty({ enum: TripType, example: TripType.Normal })
  @IsEnum(TripType)
  tripType: TripType;

  @ApiProperty({ enum: TripCategory, example: TripCategory.STANDARD, required: false })
  @IsEnum(TripCategory)
  @IsOptional()
  tripCategory?: TripCategory;

  @ApiProperty({ example: 'Academic conference attendance' })
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty({ example: 'City Convention Center' })
  @IsString()
  @IsNotEmpty()
  destination: string;

  @ApiProperty({ example: '2024-01-20T09:00:00Z' })
  @IsDateString()
  startDateTime: string;

  @ApiProperty({ example: '2024-01-20T17:00:00Z' })
  @IsDateString()
  endDateTime: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  passengerCount: number;

  // Extra fields sent by some frontends — accepted but not stored on creation
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 150 })
  @IsNumber()
  @IsOptional()
  estimatedDistance?: number;

  // Accepted but ignored — department/college-dean apps send these
  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
