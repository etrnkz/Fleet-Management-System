import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SystemConfigDto {
  @ApiProperty({
    example: 30,
    description: 'Maximum days in advance a trip can be requested',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  maxTripAdvanceDays?: number;

  @ApiProperty({
    example: 48,
    description: 'Minimum hours in advance a trip must be requested',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(168)
  minTripAdvanceHours?: number;

  @ApiProperty({
    example: 1000,
    description: 'Auto-approval threshold for trip costs',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  autoApprovalThreshold?: number;

  @ApiProperty({ example: true, description: 'Enable email notifications' })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiProperty({ example: false, description: 'Enable SMS notifications' })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiProperty({ example: false, description: 'System maintenance mode' })
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @ApiProperty({
    example: 'Scheduled system update',
    description: 'Reason for maintenance mode',
  })
  @IsOptional()
  @IsString()
  maintenanceReason?: string;

  @ApiProperty({
    example: 60,
    description: 'Estimated maintenance duration in minutes',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDuration?: number;
}
