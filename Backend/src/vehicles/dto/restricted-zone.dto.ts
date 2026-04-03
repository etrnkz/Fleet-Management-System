import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class RestrictedZoneDto {
  @ApiPropertyOptional({ example: 'Campus core' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 9.032 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 38.7469 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    example: 250,
    description: 'Forbidden radius in meters (vehicle must not enter this circle)',
  })
  @IsNumber()
  @Min(1)
  @Max(500_000)
  radiusMeters: number;
}
