import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiProperty({ example: 4, description: 'Overall rating (1-5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  overallRating: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  driverRating?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  vehicleRating?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  punctualityRating?: number;

  @ApiPropertyOptional({ example: 'Great trip, very professional.' })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({ example: 'Could improve vehicle maintenance.' })
  @IsOptional()
  @IsString()
  suggestions?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  wouldRecommend?: boolean;

  @ApiPropertyOptional({ example: ['Late arrival', 'AC not working'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  issues?: string[];
}
