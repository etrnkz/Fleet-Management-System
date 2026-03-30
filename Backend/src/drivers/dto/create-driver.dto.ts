import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  IsDateString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDriverDto {
  @ApiProperty({
    example: 'uuid-of-user',
    description: 'User ID (must have Driver role)',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: 'DL-123456789',
    description: 'Driver license number (unique)',
  })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiProperty({
    example: '2028-12-31',
    description: 'License expiry date',
  })
  @IsDateString()
  @IsNotEmpty()
  licenseExpiry: string;

  @ApiProperty({
    example: 10,
    description: 'Years of driving experience',
  })
  @IsNumber()
  @Min(0)
  @Max(50)
  experienceYears: number;

  @ApiPropertyOptional({
    example: 'Heavy vehicles, Long distance',
    description: 'Driver specializations',
  })
  @IsString()
  @IsOptional()
  specializations?: string;

  @ApiPropertyOptional({
    example: 'Excellent safety record',
    description: 'Additional notes',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
