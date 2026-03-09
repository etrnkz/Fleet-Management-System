import { IsNumber, IsOptional, IsBoolean, IsObject, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLocationDto {
  @ApiProperty({ example: 9.0320, description: 'Latitude coordinate' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 38.7469, description: 'Longitude coordinate' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ example: 45.5, description: 'Speed in km/h' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  speed?: number;

  @ApiPropertyOptional({ example: 180, description: 'Heading in degrees (0-360)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(360)
  heading?: number;

  @ApiPropertyOptional({ example: 2355, description: 'Altitude in meters' })
  @IsNumber()
  @IsOptional()
  altitude?: number;

  @ApiPropertyOptional({ example: 10, description: 'GPS accuracy in meters' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  accuracy?: number;

  @ApiPropertyOptional({ example: false, description: 'Was recorded offline?' })
  @IsBoolean()
  @IsOptional()
  isOffline?: boolean;

  @ApiPropertyOptional({
    example: { batteryLevel: 85, networkType: '4G', deviceId: 'device-123' },
    description: 'Additional metadata',
  })
  @IsObject()
  @IsOptional()
  metadata?: {
    batteryLevel?: number;
    networkType?: string;
    deviceId?: string;
  };
}
