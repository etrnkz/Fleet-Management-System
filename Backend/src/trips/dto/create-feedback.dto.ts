import {
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackRating } from '../entities/trip-feedback.entity';

export class CreateFeedbackDto {
  @ApiProperty({
    enum: FeedbackRating,
    example: FeedbackRating.GOOD,
    description: 'Overall rating for the trip (1-5)',
  })
  @IsEnum(FeedbackRating)
  overallRating: FeedbackRating;

  @ApiPropertyOptional({
    enum: FeedbackRating,
    example: FeedbackRating.EXCELLENT,
    description: 'Driver performance rating (1-5)',
  })
  @IsOptional()
  @IsEnum(FeedbackRating)
  driverRating?: FeedbackRating;

  @ApiPropertyOptional({
    enum: FeedbackRating,
    example: FeedbackRating.GOOD,
    description: 'Vehicle condition rating (1-5)',
  })
  @IsOptional()
  @IsEnum(FeedbackRating)
  vehicleRating?: FeedbackRating;

  @ApiPropertyOptional({
    enum: FeedbackRating,
    example: FeedbackRating.AVERAGE,
    description: 'Punctuality rating (1-5)',
  })
  @IsOptional()
  @IsEnum(FeedbackRating)
  punctualityRating?: FeedbackRating;

  @ApiPropertyOptional({
    example:
      'Great trip, driver was very professional and the vehicle was clean.',
    description: 'General comments about the trip',
  })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({
    example: 'Could improve vehicle maintenance schedule.',
    description: 'Suggestions for improvement',
  })
  @IsOptional()
  @IsString()
  suggestions?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Would recommend this service to others',
  })
  @IsOptional()
  @IsBoolean()
  wouldRecommend?: boolean;

  @ApiPropertyOptional({
    example: ['Late arrival', 'Vehicle AC not working'],
    description: 'List of issues encountered during the trip',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  issues?: string[];
}
