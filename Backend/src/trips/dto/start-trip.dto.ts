import { IsString, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StartTripDto {
  @ApiProperty({ example: 'ABC-1234' })
  @IsString()
  @IsNotEmpty()
  plateNumber: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  scannerValidation: boolean;

  // Accepted but ignored — some frontends send these
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
